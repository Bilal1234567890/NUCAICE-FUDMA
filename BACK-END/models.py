# models.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from database import Base
from datetime import datetime

class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    staff_id = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=False, unique=True)
    encrypted_key = Column(String(255), nullable=False)
    daily_access_key = Column(String(20), nullable=True)
    role = Column(String(100), nullable=True)           # kept for backward compatibility
    role_id = Column(String(50), nullable=True)         # e.g., 'cpc', 'aircu', 'cto', 'cdo'
    duty_index = Column(Integer, nullable=True)         # index of the duty (0-based), NULL means Head of Role
    last_encrypted_key_generation = Column(DateTime, nullable=True)


class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(50), index=True, nullable=False)
    attempts = Column(Integer, default=0)
    first_attempt_time = Column(DateTime, nullable=True)
    locked_until = Column(DateTime, nullable=True)      # NULL means not locked


class EncryptedKey(Base):
    __tablename__ = "encrypted_keys"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    encrypted_key = Column(String(255), unique=True, nullable=False)  # ← increased to 255
    valid = Column(Boolean, default=True)
    invalid = Column(Boolean, default=False)
    used_by = Column(String(50), nullable=True)
    used_time = Column(DateTime, nullable=True)
    generated_time = Column(DateTime, default=datetime.utcnow)