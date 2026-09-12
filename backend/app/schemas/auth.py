from typing import Optional
from datetime import datetime
from pydantic import BaseModel, field_validator

class UserBase(BaseModel):
    email: str
    full_name: str
    college: Optional[str] = "Engineering College"
    branch: Optional[str] = "Computer Science & Engineering"
    current_semester: Optional[int] = 1

    @field_validator("email")
    def clean_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v:
            raise ValueError("Please provide a valid email address (e.g. personal Gmail or college ID)")
        return v

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator("email")
    def clean_email(cls, v: str) -> str:
        return v.strip().lower()

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class SemesterUpdate(BaseModel):
    current_semester: int

class BranchUpdate(BaseModel):
    branch: str

class PasswordReset(BaseModel):
    email: str
    new_password: str

    @field_validator("email")
    def clean_email(cls, v: str) -> str:
        return v.strip().lower()

