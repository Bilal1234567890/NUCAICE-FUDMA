import random
import string
import requests
import os
from datetime import datetime, timedelta

# ── CRITICAL: Load .env file BEFORE reading environment variables ──
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

# ── Load configuration from .env ──
DATABASE_URL = os.getenv("DATABASE_URL", "")
TERMII_API_KEY = os.getenv("TERMII_API_KEY", "")
TERMII_SENDER_ID = os.getenv("TERMII_SENDER_ID", "")
TERMII_BASE_URL = os.getenv("TERMII_BASE_URL", "https://v3.api.termii.com")


def format_phone(phone: str) -> str:
    """
    Convert Nigerian phone number to international format.
    """
    # DEBUG: Show what we received
    print(f"[{datetime.now()}] 🔍 format_phone() INPUT: '{phone}' (type: {type(phone).__name__})")
    
    digits = ''.join(c for c in phone if c.isdigit())
    print(f"[{datetime.now()}] 🔍 format_phone() DIGITS ONLY: '{digits}' (length: {len(digits)})")

    if digits.startswith('0') and len(digits) == 11:
        result = '234' + digits[1:]
        print(f"[{datetime.now()}] 🔍 format_phone() OUTPUT: '{result}'")
        return result

    if digits.startswith('234') and len(digits) == 13:
        print(f"[{datetime.now()}] 🔍 format_phone() OUTPUT (already intl): '{digits}'")
        return digits

    if len(digits) == 10:
        result = '234' + digits
        print(f"[{datetime.now()}] 🔍 format_phone() OUTPUT (10 digits): '{result}'")
        return result

    print(f"[{datetime.now()}] 🔍 format_phone() OUTPUT (unrecognized): '{digits}'")
    return digits


def generate_access_key(length: int = 8) -> str:
    """Generate a random code with numbers, letters, and symbols."""
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.SystemRandom().choice(chars) for _ in range(length))


def send_sms_termii(to: str, message: str) -> dict:
    """
    Send SMS via Termii using the APPROVED NUCAICE sender ID.
    """
    formatted_phone = format_phone(to)

    # Validate API key
    if not TERMII_API_KEY:
        print(f"[{datetime.now()}] ❌ TERMII_API_KEY not found in .env")
        return {"success": False, "reason": "no_api_key", "phone": formatted_phone}

    # Validate sender ID
    if not TERMII_SENDER_ID:
        print(f"[{datetime.now()}] ❌ TERMII_SENDER_ID not found in .env")
        return {"success": False, "reason": "no_sender_id", "phone": formatted_phone}

    print(f"\n[{datetime.now()}] 📋 Configuration:")
    print(f"   API Key: {'*' * 10}{TERMII_API_KEY[-6:]}")
    print(f"   Sender ID: '{TERMII_SENDER_ID}' ✅ APPROVED")
    print(f"   Base URL: {TERMII_BASE_URL}")
    print(f"   📞 RECEIVER: '{formatted_phone}'")

    # ── Send SMS with Approved Sender ID ──
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
        print(f"[{datetime.now()}] 📤 Sending SMS to '{formatted_phone}' with sender '{TERMII_SENDER_ID}'...")
        print(f"[{datetime.now()}] 📤 PAYLOAD: {payload}")
        response = requests.post(url, json=payload, timeout=30)

        try:
            data = response.json()
        except:
            data = {"raw": response.text}

        print(f"[{datetime.now()}] 📥 Response [{response.status_code}]: {data}")

        if response.status_code == 200:
            print(f"[{datetime.now()}] ✅ SMS sent successfully to '{formatted_phone}'!")
            return {
                "success": True,
                "method": "sender_id",
                "sender": TERMII_SENDER_ID,
                "data": data
            }

        error_msg = str(data.get("message", "")).lower()
        print(f"[{datetime.now()}] ❌ SMS failed: {error_msg}")
        return {
            "success": False,
            "reason": "api_error",
            "status_code": response.status_code,
            "data": data
        }

    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now()}] ❌ Request failed: {e}")
        return {"success": False, "reason": "request_error", "error": str(e)}


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