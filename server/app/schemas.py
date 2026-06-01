from datetime import datetime

from pydantic import BaseModel, Field


class VoteCreate(BaseModel):
    charanga: str = Field(..., min_length=1, max_length=200)
    deviceId: str = Field(..., min_length=1, max_length=64)


class VoteResponse(BaseModel):
    success: bool
    message: str | None = None


class ResultItem(BaseModel):
    charanga: str
    votes: int


class AdminVoteItem(BaseModel):
    id: int
    charanga: str
    ip: str | None = None
    user_agent: str | None = None
    created_at: datetime


class AdminDashboard(BaseModel):
    total_votes: int
    unique_devices: int
    unique_ips: int
    leader_charanga: str | None = None
    leader_votes: int = 0
    has_tie: bool = False
    last_vote_at: datetime | None = None
    votes_by_charanga: list[ResultItem]
    recent_votes: list[AdminVoteItem]
