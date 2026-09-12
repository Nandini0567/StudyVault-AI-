from typing import List, Optional
from pydantic import BaseModel
from app.schemas.library import DocumentOut
from app.schemas.quick_notes import QuickNoteOut
from app.schemas.core_knowledge import CoreKnowledgeOut
from app.schemas.resources import ResourceOut

class SearchResultChunk(BaseModel):
    document_id: int
    document_title: str
    subject_name: str
    semester_number: int
    page_number: int
    snippet: str

class GlobalSearchResult(BaseModel):
    query: str
    documents: List[DocumentOut] = []
    chunks: List[SearchResultChunk] = []
    quick_notes: List[QuickNoteOut] = []
    core_knowledge: List[CoreKnowledgeOut] = []
    resources: List[ResourceOut] = []
