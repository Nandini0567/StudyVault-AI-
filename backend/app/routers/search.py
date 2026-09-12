from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.semester import Semester, Subject
from app.models.document import Document, DocumentChunk
from app.models.quick_note import QuickNote
from app.models.core_knowledge import CoreKnowledge
from app.models.resource import ImportantResource
from app.schemas.search import GlobalSearchResult, SearchResultChunk
from app.schemas.library import DocumentOut
from app.schemas.quick_notes import QuickNoteOut
from app.schemas.core_knowledge import CoreKnowledgeOut
from app.schemas.resources import ResourceOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/search", tags=["Global Cross-Vault Search"])

@router.get("/", response_model=GlobalSearchResult)
def global_vault_search(
    q: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query_str = q.strip()
    if not query_str:
        return GlobalSearchResult(query="")

    # 1. Search Documents
    doc_rows = db.query(Document, Subject.name.label("subject_name"), Semester.number.label("semester_number"))\
        .join(Subject, Document.subject_id == Subject.id)\
        .join(Semester, Document.semester_id == Semester.id)\
        .filter(
            Document.user_id == current_user.id,
            (Document.title.contains(query_str)) |
            (Document.tags.contains(query_str)) |
            (Document.description.contains(query_str))
        ).limit(10).all()

    matched_docs = [
        DocumentOut(
            id=d.id,
            subject_id=d.subject_id,
            semester_id=d.semester_id,
            title=d.title,
            file_name=d.file_name,
            file_size=d.file_size,
            page_count=d.page_count,
            file_type=d.file_type,
            tags=d.tags or "",
            description=d.description,
            is_favorite=d.is_favorite,
            is_important=d.is_important,
            flag_exam=d.flag_exam,
            flag_revision=d.flag_revision,
            flag_interview=d.flag_interview,
            created_at=d.created_at,
            subject_name=subj_name,
            semester_number=sem_num
        )
        for d, subj_name, sem_num in doc_rows
    ]

    # 2. Search Document Chunks with exact page number and snippet
    chunk_rows = db.query(DocumentChunk, Document.title.label("doc_title"), Subject.name.label("subject_name"), Semester.number.label("sem_num"))\
        .join(Document, DocumentChunk.document_id == Document.id)\
        .join(Subject, Document.subject_id == Subject.id)\
        .join(Semester, Document.semester_id == Semester.id)\
        .filter(
            DocumentChunk.user_id == current_user.id,
            DocumentChunk.content.contains(query_str)
        ).limit(10).all()

    matched_chunks = [
        SearchResultChunk(
            document_id=c.document_id,
            document_title=doc_title,
            subject_name=subject_name,
            semester_number=sem_num,
            page_number=c.page_number,
            snippet=c.content[:280] + ("..." if len(c.content) > 280 else "")
        )
        for c, doc_title, subject_name, sem_num in chunk_rows
    ]

    # 3. Search Quick Notes
    matched_notes = db.query(QuickNote).filter(
        QuickNote.user_id == current_user.id,
        (QuickNote.title.contains(query_str)) |
        (QuickNote.category.contains(query_str)) |
        (QuickNote.code_snippet.contains(query_str)) |
        (QuickNote.explanation.contains(query_str))
    ).limit(8).all()

    # 4. Search Core Knowledge
    matched_core = db.query(CoreKnowledge).filter(
        CoreKnowledge.user_id == current_user.id,
        (CoreKnowledge.title.contains(query_str)) |
        (CoreKnowledge.topic.contains(query_str)) |
        (CoreKnowledge.key_points.contains(query_str)) |
        (CoreKnowledge.interview_notes.contains(query_str))
    ).limit(8).all()

    # 5. Search Important Resources
    matched_resources = db.query(ImportantResource).filter(
        ImportantResource.user_id == current_user.id,
        (ImportantResource.title.contains(query_str)) |
        (ImportantResource.resource_type.contains(query_str)) |
        (ImportantResource.description.contains(query_str)) |
        (ImportantResource.tags.contains(query_str))
    ).limit(8).all()

    return GlobalSearchResult(
        query=query_str,
        documents=matched_docs,
        chunks=matched_chunks,
        quick_notes=[QuickNoteOut.from_orm(n) for n in matched_notes],
        core_knowledge=[CoreKnowledgeOut.from_orm(k) for k in matched_core],
        resources=[ResourceOut.from_orm(r) for r in matched_resources]
    )
