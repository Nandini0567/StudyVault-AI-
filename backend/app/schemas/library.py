from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class SubjectBase(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = "indigo"

class SubjectCreate(SubjectBase):
    semester_id: int

class SubjectOut(SubjectBase):
    id: int
    semester_id: int
    document_count: Optional[int] = 0
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentOut(BaseModel):
    id: int
    subject_id: int
    semester_id: int
    title: str
    file_name: str
    file_size: int
    page_count: int
    file_type: str
    tags: str
    description: Optional[str] = None
    is_favorite: bool
    is_important: bool
    flag_exam: bool
    flag_revision: bool
    flag_interview: bool
    created_at: datetime
    subject_name: Optional[str] = None
    semester_number: Optional[int] = None

    class Config:
        from_attributes = True

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    tags: Optional[str] = None
    description: Optional[str] = None
    is_favorite: Optional[bool] = None
    is_important: Optional[bool] = None
    flag_exam: Optional[bool] = None
    flag_revision: Optional[bool] = None
    flag_interview: Optional[bool] = None

class SemesterOut(BaseModel):
    id: int
    number: int
    title: str
    is_active: bool
    subjects: List[SubjectOut] = []
    total_documents: Optional[int] = 0

    class Config:
        from_attributes = True
