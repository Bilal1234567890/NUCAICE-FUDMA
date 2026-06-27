# models.py
from sqlalchemy import Column, Integer, String, DateTime
from database import Base

class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    staff_id = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=False)
    encrypted_key = Column(String(255), nullable=False)
    daily_access_key = Column(String(20), nullable=True)
    role = Column(String(100), nullable=True)           # kept for backward compatibility, but we'll use new fields
    role_id = Column(String(50), nullable=True)         # e.g., 'cpc', 'aircu', 'cto', 'cdo'
    duty_index = Column(Integer, nullable=True)         # index of the duty (0-based), NULL means Head of Role


class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(50), index=True, nullable=False)
    attempts = Column(Integer, default=0)
    first_attempt_time = Column(DateTime, nullable=True)
    locked_until = Column(DateTime, nullable=True)      # NULL means not locked