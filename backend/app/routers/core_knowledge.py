from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import distinct
from app.core.database import get_db
from app.models.user import User
from app.models.core_knowledge import CoreKnowledge
from app.schemas.core_knowledge import CoreKnowledgeCreate, CoreKnowledgeUpdate, CoreKnowledgeOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/core-knowledge", tags=["Core Knowledge"])

@router.get("/", response_model=List[CoreKnowledgeOut])
def list_core_knowledge(
    topic: Optional[str] = None,
    q: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(CoreKnowledge).filter(CoreKnowledge.user_id == current_user.id)
    if topic and topic.lower() != "all":
        query = query.filter(CoreKnowledge.topic.ilike(topic))
    if q:
        query = query.filter(
            (CoreKnowledge.title.contains(q)) |
            (CoreKnowledge.key_points.contains(q)) |
            (CoreKnowledge.interview_notes.contains(q))
        )
    return query.order_by(CoreKnowledge.created_at.desc()).all()

@router.post("/", response_model=CoreKnowledgeOut)
def create_core_knowledge(
    data: CoreKnowledgeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    core = CoreKnowledge(
        user_id=current_user.id,
        topic=data.topic,
        title=data.title,
        key_points=data.key_points,
        code_example=data.code_example,
        interview_notes=data.interview_notes,
        importance=data.importance or "High"
    )
    db.add(core)
    db.commit()
    db.refresh(core)
    return core

@router.put("/{core_id}", response_model=CoreKnowledgeOut)
def update_core_knowledge(
    core_id: int,
    data: CoreKnowledgeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    core = db.query(CoreKnowledge).filter(CoreKnowledge.id == core_id, CoreKnowledge.user_id == current_user.id).first()
    if not core:
        raise HTTPException(status_code=404, detail="Core Knowledge concept not found")

    if data.topic is not None:
        core.topic = data.topic
    if data.title is not None:
        core.title = data.title
    if data.key_points is not None:
        core.key_points = data.key_points
    if data.code_example is not None:
        core.code_example = data.code_example
    if data.interview_notes is not None:
        core.interview_notes = data.interview_notes
    if data.importance is not None:
        core.importance = data.importance

    db.commit()
    db.refresh(core)
    return core

@router.delete("/{core_id}")
def delete_core_knowledge(
    core_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    core = db.query(CoreKnowledge).filter(CoreKnowledge.id == core_id, CoreKnowledge.user_id == current_user.id).first()
    if not core:
        raise HTTPException(status_code=404, detail="Core Knowledge not found")
    db.delete(core)
    db.commit()
    return {"message": "Core knowledge deleted successfully"}

@router.get("/topics")
def get_topics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    topics = db.query(distinct(CoreKnowledge.topic)).filter(CoreKnowledge.user_id == current_user.id).all()
    unique_topics = [t[0] for t in topics if t[0]]
    defaults = ["OOP", "DBMS", "Operating Systems", "DSA", "Computer Networks", "SQL", "System Design"]
    all_topics = sorted(list(set(defaults + unique_topics)))
    return all_topics
