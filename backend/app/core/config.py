import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

class Settings:
    PROJECT_NAME: str = "StudyVault AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Primary MySQL connection; falls back to SQLite if MySQL is unreachable
    MYSQL_URL: str = os.getenv("DATABASE_URL", "")
    SQLITE_URL: str = f"sqlite:///{BASE_DIR}/studyvault.db"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "studyvault-super-secure-jwt-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 14  # 14 days
    
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    # Google Gemini API (100% Free Forever Tier from https://aistudio.google.com/app/apikey)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # Groq API (Free Tier from https://console.groq.com/keys)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    UPLOAD_DIR: str = UPLOAD_DIR
    CORS_ORIGINS: list = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://studyvault-ai-production.up.railway.app"
]

settings = Settings()
