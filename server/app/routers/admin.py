import os

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Vote
from app.schemas import AdminDashboard, AdminVoteItem, ResultItem

router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(x_admin_key: str | None = Header(default=None)):
    expected_key = os.getenv("ADMIN_KEY", "").strip()
    if not expected_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ADMIN_KEY no configurada en el servidor",
        )
    if x_admin_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Acceso no autorizado",
        )


def build_dashboard(db: Session) -> AdminDashboard:
    grouped_rows = (
        db.query(Vote.charanga, func.count(Vote.id).label("votes"))
        .group_by(Vote.charanga)
        .order_by(func.count(Vote.id).desc(), Vote.charanga.asc())
        .all()
    )
    votes_by_charanga = [ResultItem(charanga=charanga, votes=votes) for charanga, votes in grouped_rows]

    total_votes = sum(item.votes for item in votes_by_charanga)
    unique_devices = db.query(func.count(func.distinct(Vote.device_id))).scalar() or 0
    unique_ips = db.query(func.count(func.distinct(Vote.ip))).filter(Vote.ip.isnot(None)).scalar() or 0

    recent_rows = db.query(Vote).order_by(Vote.created_at.desc(), Vote.id.desc()).limit(100).all()
    recent_votes = [
        AdminVoteItem(
            id=row.id,
            charanga=row.charanga,
            ip=row.ip,
            user_agent=row.user_agent,
            created_at=row.created_at,
        )
        for row in recent_rows
    ]

    leader_charanga = votes_by_charanga[0].charanga if votes_by_charanga else None
    leader_votes = votes_by_charanga[0].votes if votes_by_charanga else 0
    has_tie = len(votes_by_charanga) > 1 and votes_by_charanga[1].votes == leader_votes
    last_vote_at = recent_votes[0].created_at if recent_votes else None

    return AdminDashboard(
        total_votes=total_votes,
        unique_devices=unique_devices,
        unique_ips=unique_ips,
        leader_charanga=leader_charanga,
        leader_votes=leader_votes,
        has_tie=has_tie,
        last_vote_at=last_vote_at,
        votes_by_charanga=votes_by_charanga,
        recent_votes=recent_votes,
    )


@router.get("/dashboard", response_model=AdminDashboard)
def admin_dashboard(
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    return build_dashboard(db)
