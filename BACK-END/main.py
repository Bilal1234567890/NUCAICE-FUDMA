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
import random
import string

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
        conn.execute("ALTER TABLE staff ADD COLUMN IF NOT EXISTS last_encrypted_key_generation DATETIME")
        conn.commit()
        print("✅ Added role_id, duty_index, and last_encrypted_key_generation columns if missing.")
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

# ── Seed master encrypted key on startup ──
@app.on_event("startup")
def seed_master_key():
    db = database.SessionLocal()
    try:
        master_key = "!@#$%^&*()_+!@#$%^&*()_+"
        existing = db.query(models.EncryptedKey).filter(models.EncryptedKey.encrypted_key == master_key).first()
        if not existing:
            new_key = models.EncryptedKey(
                encrypted_key=master_key,
                valid=True,
                invalid=False,
                used_by=None,
                used_time=None
            )
            db.add(new_key)
            db.commit()
            print("✅ Master encrypted key seeded successfully.")
        else:
            print("ℹ️ Master encrypted key already exists.")
    except Exception as e:
        print(f"❌ Failed to seed master key: {e}")
    finally:
        db.close()

# ── Register Staff ──
@app.post("/api/register", status_code=status.HTTP_201_CREATED)
def register_staff(staff: schemas.StaffCreate, db: Session = Depends(get_db)):
    # ── Check Staff ID duplicate ──
    if db.query(models.Staff).filter(models.Staff.staff_id == staff.staff_id).first():
        raise HTTPException(status_code=400, detail="Staff ID already exists")

    # ── Check Email duplicate ──
    if db.query(models.Staff).filter(models.Staff.email == staff.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    # ── Check Phone duplicate ──
    if db.query(models.Staff).filter(models.Staff.phone == staff.phone).first():
        raise HTTPException(status_code=400, detail="Phone number already exists")

    # ── Ensure the master key exists in the encrypted_keys table ──
    master_key = "!@#$%^&*()_+!@#$%^&*()_+"
    if staff.encrypted_key == master_key:
        master_record = db.query(models.EncryptedKey).filter(
            models.EncryptedKey.encrypted_key == master_key
        ).first()
        if not master_record:
            master_record = models.EncryptedKey(
                encrypted_key=master_key,
                valid=True,
                invalid=False,
                used_by=None,
                used_time=None
            )
            db.add(master_record)
            db.commit()
            print("✅ Master key inserted on the fly.")

    # ── Validate encrypted key against the encrypted_keys table ──
    key_record = db.query(models.EncryptedKey).filter(
        models.EncryptedKey.encrypted_key == staff.encrypted_key
    ).first()
    if not key_record:
        raise HTTPException(status_code=400, detail="Invalid encrypted key. Please use a valid generated key.")
    if not key_record.valid:
        raise HTTPException(status_code=400, detail="This encrypted key has already been used.")
    if key_record.invalid:
        raise HTTPException(status_code=400, detail="This encrypted key is no longer valid.")

    # ── Mark key as used ──
    key_record.valid = False
    key_record.invalid = True
    key_record.used_by = staff.staff_id
    key_record.used_time = datetime.utcnow()
    db.commit()

    # ── Generate access key ──
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
        encrypted_key=staff.encrypted_key,   # store the key they used
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
    rate_limiter = LoginRateLimiter(db, max_attempts=3, lockout_seconds=600)

    if rate_limiter.is_locked(user_id):
        record = db.query(models.LoginAttempt).filter(models.LoginAttempt.user_id == user_id).first()
        if record and record.locked_until:
            remaining = int((record.locked_until - datetime.utcnow()).total_seconds())
            remaining = max(0, remaining)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={"seconds_remaining": remaining},
                headers={"Retry-After": str(remaining)}
            )

    db_staff = db.query(models.Staff).filter(models.Staff.staff_id == user_id).first()
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

# ── Generate Encrypted Keys (only CDO Head) ──
@app.post("/api/generate-encrypted-keys")
def generate_encrypted_keys(
    req: schemas.GenerateKeysRequest,
    db: Session = Depends(get_db)
):
    staff = db.query(models.Staff).filter(models.Staff.staff_id == req.staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    # Only allow CDO Head (role_id='cdo' and duty_index IS NULL)
    if staff.role_id != 'cdo' or staff.duty_index is not None:
        raise HTTPException(status_code=403, detail="Only the Head of CDO can generate encrypted keys.")

    # Check cooldown: 5 hours
    now = datetime.utcnow()
    if staff.last_encrypted_key_generation:
        elapsed = (now - staff.last_encrypted_key_generation).total_seconds()
        if elapsed < 5 * 3600:  # 5 hours
            remaining = int(5 * 3600 - elapsed)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={"seconds_remaining": remaining}
            )

    # Generate 10 keys
    symbol_set = "!@#$%^&*()_+"
    keys = []
    for _ in range(10):
        length = random.choice([4, 6])  # 4 or 6 characters
        key = ''.join(random.choices(symbol_set, k=length))
        # Ensure uniqueness (if collision, regenerate)
        while db.query(models.EncryptedKey).filter(models.EncryptedKey.encrypted_key == key).first():
            key = ''.join(random.choices(symbol_set, k=length))
        new_key = models.EncryptedKey(
            encrypted_key=key,
            valid=True,
            invalid=False,
            used_by=None,
            used_time=None
        )
        db.add(new_key)
        keys.append(key)
    
    # Update last generation timestamp
    staff.last_encrypted_key_generation = now
    db.commit()

    return {"keys": keys, "generated_at": now.isoformat()}

# ── Get all encrypted keys (for CDO Head dashboard) ──
@app.get("/api/encrypted-keys")
def get_encrypted_keys(
    staff_id: str,
    db: Session = Depends(get_db)
):
    staff = db.query(models.Staff).filter(models.Staff.staff_id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    if staff.role_id != 'cdo' or staff.duty_index is not None:
        raise HTTPException(status_code=403, detail="Only the Head of CDO can view encrypted keys.")

    keys = db.query(models.EncryptedKey).order_by(models.EncryptedKey.id.desc()).all()
    return keys