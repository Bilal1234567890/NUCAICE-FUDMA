from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler
import models
import schemas
import database
import termii
from datetime import datetime, timedelta
from database import engine, get_db
from rate_limiter import LoginRateLimiter
import time

# ── Create tables ──
try:
    models.Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified successfully.")
except Exception as e:
    print(f"❌ Failed to create database tables: {e}")

# ── Ensure new columns ──
try:
    with engine.connect() as conn:
        conn.execute("ALTER TABLE staff ADD COLUMN IF NOT EXISTS role_id VARCHAR(50)")
        conn.execute("ALTER TABLE staff ADD COLUMN IF NOT EXISTS duty_index INT")
        conn.commit()
        print("✅ Added role_id and duty_index columns if missing.")
except Exception as e:
    print(f"⚠️ Could not add columns: {e}")

app = FastAPI(title="NUCAICE Staff Portal API")

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health Check ──
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "NUCAICE API is running"}

# ── Scheduler: Send daily keys at midnight ──
def send_daily_keys():
    db = database.SessionLocal()
    try:
        staff_members = db.query(models.Staff).all()
        for staff in staff_members:
            new_key = termii.generate_access_key()
            staff.daily_access_key = new_key
            db.commit()
            
            message = (
                f"NUCAICE Daily Access Key\n"
                f"Code: {new_key}\n"
                f"Valid: {datetime.now().strftime('%Y-%m-%d')}\n"
                f"Expires in 24hrs. Do not share."
            )
            termii.send_sms_termii(staff.phone, message)
    except Exception as e:
        print(f"❌ Scheduler error: {e}")
    finally:
        db.close()

@app.on_event("startup")
def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(send_daily_keys, 'cron', hour=0, minute=0)
    scheduler.start()
    print("✅ Daily key scheduler started.")

# ── Register Staff ──
@app.post("/api/register", status_code=status.HTTP_201_CREATED)
def register_staff(staff: schemas.StaffCreate, db: Session = Depends(get_db)):
    # Check existing user
    db_staff = db.query(models.Staff).filter(
        (models.Staff.staff_id == staff.staff_id) | (models.Staff.email == staff.email)
    ).first()
    if db_staff:
        raise HTTPException(status_code=400, detail="Staff ID or Email already registered")
    
    # Generate access key
    access_key = termii.generate_access_key()
    
    # ── Attempt to send SMS BEFORE saving to DB ──
    message = (
        f"NUCAICE Registration Success!\n"
        f"Daily Access Key: {access_key}\n"
        f"Valid: {datetime.now().strftime('%Y-%m-%d')}\n"
        f"Expires in 24hrs."
    )
    try:
        sms_result = termii.send_sms_termii(staff.phone, message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SMS delivery failed: {str(e)}")
    
    if not sms_result.get("success"):
        error_detail = sms_result.get("reason", "unknown error")
        raise HTTPException(status_code=400, detail=f"Could not send access key: {error_detail}")
    
    # ── SMS sent successfully – now save user ──
    new_staff = models.Staff(
        staff_id=staff.staff_id,
        full_name=staff.full_name,
        email=staff.email,
        phone=staff.phone,
        encrypted_key=staff.encrypted_key,
        daily_access_key=access_key
    )
    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)
    
    print(f"✅ Staff registered: {staff.staff_id} – SMS sent.")
    return {
        "message": "Staff registered successfully",
        "sms_sent": True
    }

# ── Login Staff ──
@app.post("/api/login")
def login_staff(
    credentials: schemas.StaffLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = credentials.user_id.strip()

    # ── Create rate limiter with database session ──
    rate_limiter = LoginRateLimiter(db, max_attempts=3, lockout_seconds=600)

    # 1. Check if the user is currently locked out
    if rate_limiter.is_locked(user_id):
        # Get the lock expiry from the database
        record = db.query(models.LoginAttempt).filter(models.LoginAttempt.user_id == user_id).first()
        if record and record.locked_until:
            remaining = int((record.locked_until - datetime.utcnow()).total_seconds())
            remaining = max(0, remaining)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={"seconds_remaining": remaining},
                headers={"Retry-After": str(remaining)}
            )

    # 2. Find the staff member
    db_staff = db.query(models.Staff).filter(models.Staff.staff_id == user_id).first()

    # 3. Validate credentials
    valid = db_staff is not None and db_staff.daily_access_key == credentials.daily_access_key

    if not valid:
        remaining = rate_limiter.record_attempt(user_id)
        if remaining > 0:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={"seconds_remaining": remaining},
                headers={"Retry-After": str(remaining)}
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid credentials"
            )

    # 4. Success: reset attempts
    rate_limiter.reset(user_id)

    return {
        "message": "Login successful",
        "user": {
            "staff_id": db_staff.staff_id,
            "full_name": db_staff.full_name,
            "email": db_staff.email,
            "role_id": db_staff.role_id,
            "duty_index": db_staff.duty_index,
        }
    }

# ── Select Role ──
@app.post("/api/select-role")
def select_role(request: schemas.SelectRoleRequest, db: Session = Depends(get_db)):
    staff = db.query(models.Staff).filter(models.Staff.staff_id == request.staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    if request.duty_index is None:
        existing_head = db.query(models.Staff).filter(
            models.Staff.role_id == request.role_id,
            models.Staff.duty_index.is_(None)
        ).first()
        if existing_head:
            raise HTTPException(status_code=400, detail="Head of Role already assigned to another staff.")
    staff.role_id = request.role_id
    staff.duty_index = request.duty_index
    db.commit()
    db.refresh(staff)
    return {
        "message": "Role assigned successfully",
        "user": {
            "staff_id": staff.staff_id,
            "full_name": staff.full_name,
            "email": staff.email,
            "role_id": staff.role_id,
            "duty_index": staff.duty_index,
        }
    }