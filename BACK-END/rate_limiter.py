from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import LoginAttempt

class LoginRateLimiter:
    def __init__(self, db: Session, max_attempts: int = 3, lockout_seconds: int = 600):
        self.db = db
        self.max_attempts = max_attempts
        self.lockout_seconds = lockout_seconds

    def _get_record(self, user_id: str):
        """Get or create a LoginAttempt record for this user."""
        record = self.db.query(LoginAttempt).filter(LoginAttempt.user_id == user_id).first()
        if not record:
            record = LoginAttempt(user_id=user_id, attempts=0, first_attempt_time=None, locked_until=None)
            self.db.add(record)
            self.db.commit()
            self.db.refresh(record)
        return record

    def is_locked(self, user_id: str) -> bool:
        """Check if the user is currently locked out."""
        record = self._get_record(user_id)
        if record.locked_until and record.locked_until > datetime.utcnow():
            return True
        # If lockout has expired, clear the lock
        if record.locked_until and record.locked_until <= datetime.utcnow():
            record.locked_until = None
            record.attempts = 0
            record.first_attempt_time = None
            self.db.commit()
        return False

    def record_attempt(self, user_id: str) -> int:
        """
        Record a failed attempt.
        Returns remaining lockout seconds if the user is now locked, otherwise 0.
        """
        record = self._get_record(user_id)
        now = datetime.utcnow()

        # If there's an active lock, return remaining seconds
        if record.locked_until and record.locked_until > now:
            remaining = int((record.locked_until - now).total_seconds())
            return max(0, remaining)

        # Reset if lockout expired
        if record.locked_until and record.locked_until <= now:
            record.attempts = 0
            record.first_attempt_time = None
            record.locked_until = None

        # If first attempt, set the timestamp
        if record.attempts == 0:
            record.first_attempt_time = now

        # Increment attempts
        record.attempts += 1

        # If max attempts reached, lock the user
        if record.attempts >= self.max_attempts:
            record.locked_until = now + timedelta(seconds=self.lockout_seconds)
            self.db.commit()
            return self.lockout_seconds

        self.db.commit()
        return 0

    def reset(self, user_id: str) -> None:
        """Clear all login attempts and lockout for a successful login."""
        record = self.db.query(LoginAttempt).filter(LoginAttempt.user_id == user_id).first()
        if record:
            record.attempts = 0
            record.first_attempt_time = None
            record.locked_until = None
            self.db.commit()