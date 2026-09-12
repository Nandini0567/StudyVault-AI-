import os
from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.user import User
from app.models.semester import Semester, Subject
from app.models.document import Document, DocumentChunk
from app.models.quick_note import QuickNote
from app.models.core_knowledge import CoreKnowledge
from app.models.resource import ImportantResource
from app.schemas.library import SemesterOut, SubjectCreate, SubjectOut, DocumentOut, DocumentUpdate
from app.routers.auth import get_current_user
from app.services.pdf_service import save_uploaded_pdf, extract_pdf_chunks

router = APIRouter(prefix="/library", tags=["Academic Library"])

@router.get("/semesters", response_model=List[SemesterOut])
def get_student_semesters(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    semesters = db.query(Semester).filter(Semester.user_id == current_user.id).order_by(Semester.number.asc()).all()
    
    result = []
    for sem in semesters:
        subjects = db.query(Subject).filter(Subject.semester_id == sem.id).all()
        subj_out_list = []
        sem_total_docs = 0
        for s in subjects:
            doc_count = db.query(func.count(Document.id)).filter(Document.subject_id == s.id).scalar() or 0
            sem_total_docs += doc_count
            subj_out_list.append(
                SubjectOut(
                    id=s.id,
                    semester_id=s.semester_id,
                    name=s.name,
                    code=s.code,
                    description=s.description,
                    color=s.color,
                    document_count=doc_count,
                    created_at=s.created_at
                )
            )
        
        result.append(
            SemesterOut(
                id=sem.id,
                number=sem.number,
                title=sem.title,
                is_active=sem.is_active,
                subjects=subj_out_list,
                total_documents=sem_total_docs
            )
        )
    return result

@router.post("/subjects", response_model=SubjectOut)
def create_subject(data: SubjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sem = db.query(Semester).filter(Semester.id == data.semester_id, Semester.user_id == current_user.id).first()
    if not sem:
        raise HTTPException(status_code=404, detail="Semester not found.")
    
    subj = Subject(
        semester_id=data.semester_id,
        user_id=current_user.id,
        name=data.name,
        code=data.code,
        description=data.description,
        color=data.color or "indigo"
    )
    db.add(subj)
    db.commit()
    db.refresh(subj)
    return SubjectOut(
        id=subj.id,
        semester_id=subj.semester_id,
        name=subj.name,
        code=subj.code,
        description=subj.description,
        color=subj.color,
        document_count=0,
        created_at=subj.created_at
    )

@router.get("/subjects/{subject_id}/documents", response_model=List[DocumentOut])
def get_subject_documents(
    subject_id: int,
    tag: Optional[str] = None,
    filter_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Document, Subject.name.label("subject_name"), Semester.number.label("semester_number"))\
        .join(Subject, Document.subject_id == Subject.id)\
        .join(Semester, Document.semester_id == Semester.id)\
        .filter(Document.subject_id == subject_id, Document.user_id == current_user.id)
    
    if tag:
        query = query.filter(Document.tags.contains(tag))
    if filter_type == "favorite":
        query = query.filter(Document.is_favorite == True)
    elif filter_type == "important":
        query = query.filter(Document.is_important == True)
    elif filter_type == "exam":
        query = query.filter(Document.flag_exam == True)
    elif filter_type == "revision":
        query = query.filter(Document.flag_revision == True)
    elif filter_type == "interview":
        query = query.filter(Document.flag_interview == True)

    rows = query.order_by(Document.created_at.desc()).all()
    results = []
    for doc, subj_name, sem_num in rows:
        results.append(
            DocumentOut(
                id=doc.id,
                subject_id=doc.subject_id,
                semester_id=doc.semester_id,
                title=doc.title,
                file_name=doc.file_name,
                file_size=doc.file_size,
                page_count=doc.page_count,
                file_type=doc.file_type,
                tags=doc.tags or "",
                description=doc.description,
                is_favorite=doc.is_favorite,
                is_important=doc.is_important,
                flag_exam=doc.flag_exam,
                flag_revision=doc.flag_revision,
                flag_interview=doc.flag_interview,
                created_at=doc.created_at,
                subject_name=subj_name,
                semester_number=sem_num
            )
        )
    return results

@router.post("/upload", response_model=DocumentOut)
async def upload_academic_document(
    file: UploadFile = File(...),
    semester_id: int = Form(...),
    subject_id: int = Form(...),
    title: str = Form(...),
    tags: Optional[str] = Form("Notes"),
    description: Optional[str] = Form(None),
    is_favorite: Optional[bool] = Form(False),
    is_important: Optional[bool] = Form(False),
    flag_exam: Optional[bool] = Form(False),
    flag_revision: Optional[bool] = Form(False),
    flag_interview: Optional[bool] = Form(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify subject belongs to user
    subj = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == current_user.id).first()
    if not subj:
        raise HTTPException(status_code=404, detail="Subject not found")

    file_bytes = await file.read()
    file_path, file_size = save_uploaded_pdf(current_user.id, semester_id, file.filename, file_bytes)

    # Extract text chunks and total page count
    total_pages = 1
    chunks = []
    try:
        total_pages, chunks = extract_pdf_chunks(file_path)
    except Exception as e:
        print(f"Warning: PDF chunk extraction encountered notice: {e}")
        # Default fallback chunk
        chunks = [{
            "page_number": 1,
            "chunk_index": 0,
            "content": f"{title} - Academic material for {subj.name}. Uploaded on {file.filename}."
        }]

    doc = Document(
        user_id=current_user.id,
        subject_id=subject_id,
        semester_id=semester_id,
        title=title or file.filename,
        file_name=file.filename,
        file_path=file_path,
        file_size=file_size,
        page_count=max(total_pages, 1),
        file_type="application/pdf",
        tags=tags or "Notes",
        description=description,
        is_favorite=is_favorite or False,
        is_important=is_important or False,
        flag_exam=flag_exam or False,
        flag_revision=flag_revision or False,
        flag_interview=flag_interview or False
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Save chunks into DB for RAG indexing
    for c in chunks:
        chunk_obj = DocumentChunk(
            document_id=doc.id,
            user_id=current_user.id,
            page_number=c["page_number"],
            chunk_index=c["chunk_index"],
            content=c["content"]
        )
        db.add(chunk_obj)
    db.commit()

    sem = db.query(Semester).filter(Semester.id == semester_id).first()
    return DocumentOut(
        id=doc.id,
        subject_id=doc.subject_id,
        semester_id=doc.semester_id,
        title=doc.title,
        file_name=doc.file_name,
        file_size=doc.file_size,
        page_count=doc.page_count,
        file_type=doc.file_type,
        tags=doc.tags or "",
        description=doc.description,
        is_favorite=doc.is_favorite,
        is_important=doc.is_important,
        flag_exam=doc.flag_exam,
        flag_revision=doc.flag_revision,
        flag_interview=doc.flag_interview,
        created_at=doc.created_at,
        subject_name=subj.name,
        semester_number=sem.number if sem else 1
    )

@router.get("/documents/{doc_id}/view")
def view_document_pdf(doc_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not os.path.exists(doc.file_path):
        # Return a lightweight inline mock PDF response or text info if starter placeholder
        raise HTTPException(status_code=404, detail="PDF file not found on server storage")

    return FileResponse(doc.file_path, media_type="application/pdf", filename=doc.file_name)

@router.put("/documents/{doc_id}")
def update_document(doc_id: int, data: DocumentUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if data.title is not None:
        doc.title = data.title
    if data.tags is not None:
        doc.tags = data.tags
    if data.description is not None:
        doc.description = data.description
    if data.is_favorite is not None:
        doc.is_favorite = data.is_favorite
    if data.is_important is not None:
        doc.is_important = data.is_important
    if data.flag_exam is not None:
        doc.flag_exam = data.flag_exam
    if data.flag_revision is not None:
        doc.flag_revision = data.flag_revision
    if data.flag_interview is not None:
        doc.flag_interview = data.flag_interview

    db.commit()
    db.refresh(doc)
    return {"message": "Document updated successfully", "id": doc.id}

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Try deleting file on disk if exists
    try:
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)
    except Exception:
        pass

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}

@router.get("/stats")
def get_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total_docs = db.query(func.count(Document.id)).filter(Document.user_id == current_user.id).scalar() or 0
    total_quick_notes = db.query(func.count(QuickNote.id)).filter(QuickNote.user_id == current_user.id).scalar() or 0
    total_core_knowledge = db.query(func.count(CoreKnowledge.id)).filter(CoreKnowledge.user_id == current_user.id).scalar() or 0
    total_resources = db.query(func.count(ImportantResource.id)).filter(ImportantResource.user_id == current_user.id).scalar() or 0

    recent_docs_rows = db.query(Document, Subject.name.label("subject_name"), Semester.number.label("semester_number"))\
        .join(Subject, Document.subject_id == Subject.id)\
        .join(Semester, Document.semester_id == Semester.id)\
        .filter(Document.user_id == current_user.id)\
        .order_by(Document.created_at.desc())\
        .limit(5).all()

    recent_uploads = [
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
        for d, subj_name, sem_num in recent_docs_rows
    ]

    pinned_rows = db.query(Document, Subject.name.label("subject_name"), Semester.number.label("semester_number"))\
        .join(Subject, Document.subject_id == Subject.id)\
        .join(Semester, Document.semester_id == Semester.id)\
        .filter(Document.user_id == current_user.id, (Document.is_favorite == True) | (Document.is_important == True))\
        .limit(5).all()

    pinned_resources = [
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
        for d, subj_name, sem_num in pinned_rows
    ]

    return {
        "current_semester": current_user.current_semester,
        "total_documents": total_docs,
        "total_quick_notes": total_quick_notes,
        "total_core_knowledge": total_core_knowledge,
        "total_important_resources": total_resources,
        "recent_uploads": recent_uploads,
        "pinned_resources": pinned_resources
    }
