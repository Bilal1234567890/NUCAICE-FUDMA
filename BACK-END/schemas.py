# schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class StaffCreate(BaseModel):
    staff_id: str
    full_name: str
    email: EmailStr
    phone: str
    encrypted_key: str

class StaffLogin(BaseModel):
    user_id: str
    daily_access_key: str

class StaffResponse(BaseModel):
    staff_id: str
    full_name: str
    email: str
    role_id: Optional[str] = None
    duty_index: Optional[int] = None

    class Config:
        from_attributes = True

class SelectRoleRequest(BaseModel):
    staff_id: str
    role_id: str
    duty_index: Optional[int] = None

class EncryptedKeyResponse(BaseModel):
    id: int
    encrypted_key: str
    valid: bool
    used_by: Optional[str] = None
    used_time: Optional[datetime] = None
    generated_time: datetime

    class Config:
        from_attributes = True

class GenerateKeysRequest(BaseModel):
    staff_id: str   # the CDO Head staff_id