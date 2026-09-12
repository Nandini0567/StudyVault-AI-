from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ResourceBase(BaseModel):
    title: str
    resource_type: str = "Reference Book"
    file_path: Optional[str] = None
    external_url: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = "Verified"
    is_verified: Optional[bool] = True
    priority: Optional[str] = "High"

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    resource_type: Optional[str] = None
    external_url: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None
    is_verified: Optional[bool] = None
    priority: Optional[str] = None

class ResourceOut(ResourceBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
