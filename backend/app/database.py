import os
import logging
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger(__name__)

# Parse database URL and ensure parent directory exists for SQLite file
db_url = settings.DATABASE_URL
if db_url.startswith("sqlite:///"):
    db_path = db_url.replace("sqlite:///", "")
    # For relative path like ./crm.db or absolute path like /data/crm.db
    db_dir = os.path.dirname(db_path)
    if db_dir:
        try:
            os.makedirs(db_dir, exist_ok=True)
        except Exception as e:
            logger.warning(f"Could not create database directory '{db_dir}': {e}")

# Engine setup
engine = create_engine(
    db_url,
    connect_args={"check_same_thread": False} if db_url.startswith("sqlite") else {}
)

# Explicitly enable foreign keys for every SQLite connection
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if db_url.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db():
    """Initializes tables and automatically applies non-breaking schema updates."""
    import app.models.ticket  # noqa: F401
    Base.metadata.create_all(bind=engine)
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        if "tickets" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("tickets")]
            if "ai_source" not in columns:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE tickets ADD COLUMN ai_source VARCHAR(50) DEFAULT 'gemini'"))
    except Exception as e:
        logger.warning(f"Could not verify ai_source column: {e}")


def get_db():
    """FastAPI dependency yielding a SQLAlchemy session and ensuring proper close."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
