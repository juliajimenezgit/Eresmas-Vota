from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Vote
from app.schemas import ResultItem

router = APIRouter(prefix="/api", tags=["results"])


@router.get("/results", response_model=list[ResultItem])
def get_results(db: Session = Depends(get_db)):
    rows = (
        db.query(Vote.charanga, func.count(Vote.id).label("votes"))
        .group_by(Vote.charanga)
        .order_by(func.count(Vote.id).desc())
        .all()
    )
    return [ResultItem(charanga=charanga, votes=votes) for charanga, votes in rows]
