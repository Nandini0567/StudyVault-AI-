import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger("studyvault.db")

engine = None
SessionLocal = None

try:
    logger.info("Attempting to connect to MySQL database...")
    mysql_engine = create_engine(
        settings.MYSQL_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
        connect_args={"connect_timeout": 5}
    )
    # Test connection
    with mysql_engine.connect() as conn:
        logger.info("Successfully connected to MySQL database: studyvault_db")
    engine = mysql_engine
except Exception as e:
    logger.warning(f"MySQL connection failed: {e}. Falling back to SQLite...")
    sqlite_engine = create_engine(
        settings.SQLITE_URL,
        connect_args={"check_same_thread": False}
    )
    engine = sqlite_engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
