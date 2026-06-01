from uuid import uuid4

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Vote
from app.schemas import VoteCreate, VoteResponse

router = APIRouter(prefix="/api", tags=["vote"])
DISALLOWED_CHARANGAS = {"charanga eresmas", "eresmas"}
LOCALHOST_IPS = {"127.0.0.1", "::1", "localhost"}


@router.post("/vote", response_model=VoteResponse)
def register_vote(
    payload: VoteCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    normalized_charanga = payload.charanga.strip()
    if normalized_charanga.lower() in DISALLOWED_CHARANGAS:
        return VoteResponse(
            success=False,
            message="No se puede votar a la charanga organizadora",
        )

    client_ip = request.client.host if request.client else None
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
    is_local_request = client_ip in LOCALHOST_IPS

    existing = db.query(Vote).filter(Vote.device_id == payload.deviceId).first()
    if existing and not is_local_request:
        return VoteResponse(success=False, message="Ya has votado")

    stored_device_id = payload.deviceId
    if existing and is_local_request:
        stored_device_id = f"{payload.deviceId}-{uuid4()}"

    vote = Vote(
        device_id=stored_device_id,
        charanga=normalized_charanga,
        ip=client_ip,
        user_agent=request.headers.get("user-agent"),
    )
    db.add(vote)
    db.commit()

    return VoteResponse(success=True, message="Voto registrado")
