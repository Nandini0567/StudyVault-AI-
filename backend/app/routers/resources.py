from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.resource import ImportantResource
from app.schemas.resources import ResourceCreate, ResourceUpdate, ResourceOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/resources", tags=["Important Resources"])

@router.get("/", response_model=List[ResourceOut])
def list_resources(
    resource_type: Optional[str] = None,
    q: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ImportantResource).filter(ImportantResource.user_id == current_user.id)
    if resource_type and resource_type.lower() != "all":
        query = query.filter(ImportantResource.resource_type.ilike(resource_type))
    if q:
        query = query.filter(
            (ImportantResource.title.contains(q)) |
            (ImportantResource.description.contains(q)) |
            (ImportantResource.tags.contains(q))
        )
    return query.order_by(ImportantResource.created_at.desc()).all()

@router.post("/", response_model=ResourceOut)
def create_resource(
    data: ResourceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = ImportantResource(
        user_id=current_user.id,
        title=data.title,
        resource_type=data.resource_type or "Reference Book",
        file_path=data.file_path,
        external_url=data.external_url,
        description=data.description,
        tags=data.tags or "Verified",
        is_verified=data.is_verified if data.is_verified is not None else True,
        priority=data.priority or "High"
    )
    db.add(res)
    db.commit()
    db.refresh(res)
    return res

@router.put("/{res_id}", response_model=ResourceOut)
def update_resource(
    res_id: int,
    data: ResourceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = db.query(ImportantResource).filter(ImportantResource.id == res_id, ImportantResource.user_id == current_user.id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    if data.title is not None:
        res.title = data.title
    if data.resource_type is not None:
        res.resource_type = data.resource_type
    if data.external_url is not None:
        res.external_url = data.external_url
    if data.description is not None:
        res.description = data.description
    if data.tags is not None:
        res.tags = data.tags
    if data.is_verified is not None:
        res.is_verified = data.is_verified
    if data.priority is not None:
        res.priority = data.priority

    db.commit()
    db.refresh(res)
    return res

@router.delete("/{res_id}")
def delete_resource(
    res_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = db.query(ImportantResource).filter(ImportantResource.id == res_id, ImportantResource.user_id == current_user.id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(res)
    db.commit()
    return {"message": "Resource deleted successfully"}
