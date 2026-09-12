from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class CoreKnowledge(Base):
    __tablename__ = "core_knowledge"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    topic = Column(String(100), nullable=False)  # OOP, DBMS, OS, Computer Networks, DSA, SQL
    title = Column(String(255), nullable=False)
    key_points = Column(Text, nullable=False)
    code_example = Column(Text, nullable=True)
    interview_notes = Column(Text, nullable=True)
    importance = Column(String(50), default="High")  # Critical, High, Medium
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="core_knowledges")
