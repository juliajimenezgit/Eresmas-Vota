import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

database_url = os.getenv("DATABASE_URL", "sqlite:///votes.db")
if database_url.startswith("sqlite:///") and not database_url.startswith("sqlite:////"):
    db_path = database_url.replace("sqlite:///", "")
    if not Path(db_path).is_absolute():
        server_dir = Path(__file__).resolve().parent.parent
        database_url = f"sqlite:///{server_dir / db_path}"

engine = create_engine(
    database_url,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
