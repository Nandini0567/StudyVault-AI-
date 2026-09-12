from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class CoreKnowledgeBase(BaseModel):
    topic: str
    title: str
    key_points: str
    code_example: Optional[str] = None
    interview_notes: Optional[str] = None
    importance: Optional[str] = "High"

class CoreKnowledgeCreate(CoreKnowledgeBase):
    pass

class CoreKnowledgeUpdate(BaseModel):
    topic: Optional[str] = None
    title: Optional[str] = None
    key_points: Optional[str] = None
    code_example: Optional[str] = None
    interview_notes: Optional[str] = None
    importance: Optional[str] = None

class CoreKnowledgeOut(CoreKnowledgeBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
