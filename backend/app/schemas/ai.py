from typing import Optional, List
from pydantic import BaseModel

class Citation(BaseModel):
    document_id: int
    document_title: str
    semester_number: Optional[int] = None
    subject_name: Optional[str] = None
    page_number: int
    snippet: str

class MatchedDocument(BaseModel):
    id: int
    title: str
    file_name: str
    semester_number: int
    subject_name: str
    page_count: int
    file_size: int
    tags: str
    exists_on_disk: bool

class AskQuestionRequest(BaseModel):
    question: str
    mode: str = "documents"  # "documents" (My Documents Mode) or "general" (General AI Mode)
    document_id: Optional[int] = None  # If asked directly within a specific PDF
    action: Optional[str] = None  # "explain_simple", "explain_detailed", "give_example", "summarize", "short_notes", "generate_questions", "generate_mcqs", "check_pdf_exists"

class AskQuestionResponse(BaseModel):
    answer: str
    mode: str
    is_grounded: bool
    citations: List[Citation] = []
    matched_documents: List[MatchedDocument] = []
    suggested_title: Optional[str] = None
    suggested_category: Optional[str] = None

class SaveToKnowledgeRequest(BaseModel):
    target: str  # "quick_note", "core_knowledge", "important_resource"
    title: str
    category_or_topic: str
    content: str
    code_snippet: Optional[str] = None
    tags: Optional[str] = "AI-Verified"

class RevisionRequest(BaseModel):
    semester_id: Optional[int] = None
    subject_id: Optional[int] = None
    document_id: Optional[int] = None
    topic: Optional[str] = None

class RevisionResponse(BaseModel):
    title: str
    subject_name: str
    key_concepts: List[str]
    formulas_or_syntax: List[str]
    exam_questions: List[str]
    detailed_summary: str

class QuizRequest(BaseModel):
    document_id: Optional[int] = None
    subject_id: Optional[int] = None
    difficulty: str = "medium"  # easy, medium, hard
    num_questions: int = 5

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_index: int
    explanation: str
    source_document: Optional[str] = None
    page_number: Optional[int] = None

class QuizResponse(BaseModel):
    title: str
    questions: List[QuizQuestion]
