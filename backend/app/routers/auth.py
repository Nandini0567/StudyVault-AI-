from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, oauth2_scheme, decode_token
from app.models.user import User
from app.models.semester import Semester
from app.schemas.auth import UserCreate, UserLogin, UserOut, Token, SemesterUpdate, BranchUpdate, PasswordReset
from app.services.seed_service import seed_student_vault

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        demo_user = db.query(User).first()
        if demo_user:
            return demo_user
        raise credentials_exception

    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    user = db.query(User).filter(func.lower(User.email) == email.strip().lower()).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=Token)
def register_student(user_in: UserCreate, db: Session = Depends(get_db)):
    clean_email = user_in.email.strip().lower()
    existing = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A student account with this email already exists. Click 'Sign In' or use 'Quick Account Switcher' to open your vault."
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=clean_email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name.strip(),
        college=user_in.college.strip() if user_in.college else "Engineering College",
        branch=user_in.branch or "Computer Science & Engineering",
        current_semester=user_in.current_semester or 1
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Seed initial vault data with branch-specific subjects
    try:
        seed_student_vault(db, user.id, branch=user.branch)
    except Exception as e:
        print(f"Notice: Seed vault warning: {e}")

    token = create_access_token({"sub": user.email, "id": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
def login_student(user_in: UserLogin, db: Session = Depends(get_db)):
    clean_email = user_in.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password. Use 'Reset Password' if you forgot your credentials.")
    
    token = create_access_token({"sub": user.email, "id": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/reset-password", response_model=Token)
def reset_student_password(data: PasswordReset, db: Session = Depends(get_db)):
    clean_email = data.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No student account found with this email.")
    
    user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email, "id": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/recent-students")
def get_recent_students(db: Session = Depends(get_db)):
    """
    Returns registered student profiles on this system for 1-click fast login.
    """
    users = db.query(User).order_by(User.id.desc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "college": u.college,
            "branch": u.branch,
            "current_semester": u.current_semester
        }
        for u in users
    ]

@router.get("/me", response_model=UserOut)
def get_student_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/semester")
def update_current_semester(data: SemesterUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.current_semester = data.current_semester
    db.query(Semester).filter(Semester.user_id == current_user.id).update({"is_active": False})
    db.query(Semester).filter(Semester.user_id == current_user.id, Semester.number == data.current_semester).update({"is_active": True})
    db.commit()
    db.refresh(current_user)
    return {"message": "Current semester updated successfully", "current_semester": current_user.current_semester}

@router.put("/branch")
def update_student_branch(data: BranchUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.branch = data.branch
    db.commit()
    db.refresh(current_user)
    return {
        "message": "Student branch updated successfully",
        "branch": current_user.branch,
        "user": current_user
    }
