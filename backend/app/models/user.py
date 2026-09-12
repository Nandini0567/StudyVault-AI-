from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    college = Column(String(255), nullable=True, default="Engineering College")
    branch = Column(String(100), nullable=True, default="Computer Science & Engineering")
    current_semester = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    semesters = relationship("Semester", back_populates="user", cascade="all, delete-orphan")
    subjects = relationship("Subject", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    quick_notes = relationship("QuickNote", back_populates="user", cascade="all, delete-orphan")
    core_knowledges = relationship("CoreKnowledge", back_populates="user", cascade="all, delete-orphan")
    resources = relationship("ImportantResource", back_populates="user", cascade="all, delete-orphan")
