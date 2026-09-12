from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class QuickNoteBase(BaseModel):
    title: str
    category: str = "General"  # Java, SQL, Linux, DSA, OOP, Python, Web
    code_snippet: Optional[str] = None
    explanation: str
    tags: Optional[str] = ""
    is_favorite: Optional[bool] = False

class QuickNoteCreate(QuickNoteBase):
    pass

class QuickNoteUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    code_snippet: Optional[str] = None
    explanation: Optional[str] = None
    tags: Optional[str] = None
    is_favorite: Optional[bool] = None

class QuickNoteOut(QuickNoteBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
