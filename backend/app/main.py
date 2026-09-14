import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.models import *  # Ensure all models are imported
from app.routers import (
    auth,
    library,
    quick_notes,
    core_knowledge,
    resources,
    search,
    ai
)
from app.services.seed_service import seed_student_vault
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("studyvault")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize tables
    logger.info("Creating database tables if not exist...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")

    # Seed demo student if database is empty
    db = SessionLocal()
    try:
        demo_user = db.query(User).filter(User.email == "student@studyvault.ai").first()
        if not demo_user:
            logger.info("Seeding default demo student: student@studyvault.ai...")
            demo_user = User(
                email="student@studyvault.ai",
                hashed_password=get_password_hash("Student@123"),
                full_name="Alex Rivera",
                college="National Institute of Technology",
                branch="Computer Science & Engineering",
                current_semester=2
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            seed_student_vault(db, demo_user.id)
            logger.info("Demo student and starter academic vault seeded.")
    except Exception as e:
        logger.error(f"Notice during demo student initialization: {e}")
    finally:
        db.close()

    yield
    logger.info("StudyVault AI shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Personal Academic Knowledge Vault for College Students",
    lifespan=lifespan
)

# CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.CORS_ORIGINS,
#     allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "https://studyvault-ai-production.up.railway.app",
#         "http://localhost:5173",
#         "http://127.0.0.1:5173",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(library.router, prefix=settings.API_V1_STR)
app.include_router(quick_notes.router, prefix=settings.API_V1_STR)
app.include_router(core_knowledge.router, prefix=settings.API_V1_STR)
app.include_router(resources.router, prefix=settings.API_V1_STR)
app.include_router(search.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to StudyVault AI Backend API",
        "docs_url": "/docs",
        "status": "active",
        "database": "MySQL / Active Vault"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "StudyVault AI"}
