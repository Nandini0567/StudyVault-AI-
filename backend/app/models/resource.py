from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class ImportantResource(Base):
    __tablename__ = "important_resources"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    resource_type = Column(String(100), default="Reference Book")  # Reference Book, Teacher Notes, Cheat Sheet, Interview Prep
    file_path = Column(String(500), nullable=True)
    external_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    tags = Column(String(255), default="Verified")
    is_verified = Column(Boolean, default=True)
    priority = Column(String(50), default="High")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="resources")
