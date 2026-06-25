import random
import string
import requests
import os
import time
from functools import wraps
from datetime import datetime, timedelta
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ── Load .env ──
try:
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        load_dotenv(dotenv_path=env_path)
        print(f"[{datetime.now()}] ✅ .env loaded from: {env_path}")
    else:
        load_dotenv()
        print(f"[{datetime.now()}] ✅ .env loaded from default location")
except ImportError:
    print(f"[{datetime.now()}] ❌ python-dotenv not installed!")
    raise

# ── Config ──
DATABASE_URL = os.getenv("DATABASE_URL", "")
TERMII_API_KEY = os.getenv("TERMII_API_KEY", "")
TERMII_SENDER_ID = os.getenv("TERMII_SENDER_ID", "")
TERMII_BASE_URL = os.getenv("TERMII_BASE_URL", "https://v3.api.termii.com")


def format_phone(phone: str) -> str:
    """Convert Nigerian phone number to international format."""
    digits = ''.join(c for c in phone if c.isdigit())
    if digits.startswith('0') and len(digits) == 11:
        return '234' + digits[1:]
    if digits.startswith('234') and len(digits) == 13:
        return digits
    if len(digits) == 10:
        return '234' + digits
    return digits  # fallback


def generate_access_key(length: int = 8) -> str:
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.SystemRandom().choice(chars) for _ in range(length))


# ── Retry decorator for failures ──
def retry_on_failure(max_retries=3, delay=0.5, backoff=2):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            current_delay = delay
            while retries <= max_retries:
                try:
                    result = func(*args, **kwargs)
                    if result.get("success"):
                        return result
                    # If API returned error (but not exception), retry
                    if retries < max_retries:
                        print(f"⚠️ SMS attempt {retries+1} failed. Retrying in {current_delay}s...")
                        time.sleep(current_delay)
                        current_delay *= backoff
                        retries += 1
                    else:
                        return result
                except Exception as e:
                    if retries == max_retries:
                        raise
                    print(f"⚠️ Exception: {e}. Retrying in {current_delay}s...")
                    time.sleep(current_delay)
                    current_delay *= backoff
                    retries += 1
            return {"success": False, "reason": "max_retries_exceeded"}
        return wrapper
    return decorator


@retry_on_failure(max_retries=3, delay=0.5, backoff=2)
def send_sms_termii(to: str, message: str) -> dict:
    """
    Send SMS via Termii using the APPROVED NUCAICE sender ID.
    Returns dict with 'success' key.
    """
    formatted_phone = format_phone(to)

    # Validate config
    if not TERMII_API_KEY:
        return {"success": False, "reason": "no_api_key"}
    if not TERMII_SENDER_ID:
        return {"success": False, "reason": "no_sender_id"}

    url = f"{TERMII_BASE_URL}/api/sms/send"
    payload = {
        "api_key": TERMII_API_KEY,
        "to": formatted_phone,
        "from": TERMII_SENDER_ID,
        "sms": message,
        "type": "plain",
        "channel": "generic",
    }

    try:
        # Create a session with automatic retries on connection errors
        session = requests.Session()
        retries = Retry(
            total=3,
            backoff_factor=0.5,
            status_forcelist=[500, 502, 503, 504],
            allowed_methods=["POST"]
        )
        adapter = HTTPAdapter(max_retries=retries)
        session.mount('https://', adapter)
        session.mount('http://', adapter)

        response = session.post(url, json=payload, timeout=15)
        try:
            data = response.json()
        except:
            data = {"raw": response.text}

        if response.status_code == 200:
            return {
                "success": True,
                "method": "sender_id",
                "sender": TERMII_SENDER_ID,
                "data": data
            }
        else:
            error_msg = str(data.get("message", "")).lower()
            return {
                "success": False,
                "reason": "api_error",
                "status_code": response.status_code,
                "data": data
            }
    except Exception as e:
        # Will be retried by the decorator
        raise  # re-raise to trigger retry


def send_daily_access_key(phone: str, staff_name: str = "Staff") -> dict:
    code = generate_access_key(8)
    message = (
        f"NUCAICE Daily Access Key\n"
        f"Hello {staff_name},\n"
        f"Code: {code}\n"
        f"Valid: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n"
        f"Expires in 24hrs. Do not share."
    )
    result = send_sms_termii(phone, message)
    result["generated_code"] = code
    result["formatted_phone"] = format_phone(phone)
    result["expires_at"] = (datetime.now() + timedelta(hours=24)).isoformat()
    result["staff_name"] = staff_name
    return result


# ── Quick Test ──
if __name__ == "__main__":
    print("=" * 65)
    print("  NUCAICE Termii SMS — Sender ID APPROVED ✅")
    print("=" * 65)
    print(f"\n📞 Phone Format Test:")
    print(f"   09031852972 → {format_phone('09031852972')}")
    print(f"\n🔧 Environment Check:")
    print(f"   DATABASE_URL: {'✅ Set' if DATABASE_URL else '❌ Missing'}")
    print(f"   TERMII_API_KEY: {'✅ Set' if TERMII_API_KEY else '❌ Missing'}")
    print(f"   TERMII_SENDER_ID: {'✅ ' + TERMII_SENDER_ID if TERMII_SENDER_ID else '❌ Missing'}")
    print(f"   TERMII_BASE_URL: {TERMII_BASE_URL}")
    print(f"\n📤 Sending Daily Access Key...")
    result = send_daily_access_key("09031852972", "Muhammad")
    print(f"\n📋 Final Result:")
    print(f"   Success: {result.get('success')}")
    print(f"   Method: {result.get('method', 'N/A')}")
    print(f"   Generated Code: {result.get('generated_code')}")
    print(f"   Phone: {result.get('formatted_phone')}")
    print(f"   Expires: {result.get('expires_at')}")
    if not result.get("success"):
        print(f"\n   ❌ Reason: {result.get('reason')}")
        print(f"   📄 API Response: {result.get('data')}")