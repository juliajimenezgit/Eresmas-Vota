from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.database import Base


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String, unique=True, nullable=False)
    charanga = Column(String, nullable=False)
    ip = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
