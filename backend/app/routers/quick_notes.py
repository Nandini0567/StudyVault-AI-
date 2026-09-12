from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import distinct
from app.core.database import get_db
from app.models.user import User
from app.models.quick_note import QuickNote
from app.schemas.quick_notes import QuickNoteCreate, QuickNoteUpdate, QuickNoteOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/quick-notes", tags=["Quick Notes"])

@router.get("/", response_model=List[QuickNoteOut])
def list_quick_notes(
    category: Optional[str] = None,
    tag: Optional[str] = None,
    q: Optional[str] = None,
    favorite_only: Optional[bool] = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(QuickNote).filter(QuickNote.user_id == current_user.id)
    if category and category.lower() != "all":
        query = query.filter(QuickNote.category.ilike(category))
    if tag:
        query = query.filter(QuickNote.tags.contains(tag))
    if favorite_only:
        query = query.filter(QuickNote.is_favorite == True)
    if q:
        query = query.filter(
            (QuickNote.title.contains(q)) |
            (QuickNote.explanation.contains(q)) |
            (QuickNote.code_snippet.contains(q))
        )
    return query.order_by(QuickNote.created_at.desc()).all()

@router.post("/", response_model=QuickNoteOut)
def create_quick_note(
    data: QuickNoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = QuickNote(
        user_id=current_user.id,
        title=data.title,
        category=data.category or "General",
        code_snippet=data.code_snippet,
        explanation=data.explanation,
        tags=data.tags or "",
        is_favorite=data.is_favorite or False
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.put("/{note_id}", response_model=QuickNoteOut)
def update_quick_note(
    note_id: int,
    data: QuickNoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = db.query(QuickNote).filter(QuickNote.id == note_id, QuickNote.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Quick Note not found")
    
    if data.title is not None:
        note.title = data.title
    if data.category is not None:
        note.category = data.category
    if data.code_snippet is not None:
        note.code_snippet = data.code_snippet
    if data.explanation is not None:
        note.explanation = data.explanation
    if data.tags is not None:
        note.tags = data.tags
    if data.is_favorite is not None:
        note.is_favorite = data.is_favorite

    db.commit()
    db.refresh(note)
    return note

@router.delete("/{note_id}")
def delete_quick_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = db.query(QuickNote).filter(QuickNote.id == note_id, QuickNote.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Quick Note not found")
    db.delete(note)
    db.commit()
    return {"message": "Quick note deleted successfully"}

@router.get("/categories")
def get_categories(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cats = db.query(distinct(QuickNote.category)).filter(QuickNote.user_id == current_user.id).all()
    unique_cats = [c[0] for c in cats if c[0]]
    # Ensure standard set
    defaults = ["Java", "SQL", "Linux", "DSA", "OOP", "Python", "Web", "General"]
    all_cats = sorted(list(set(defaults + unique_cats)))
    return all_cats
