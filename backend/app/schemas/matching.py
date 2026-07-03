from __future__ import annotations
from app.schemas.common import BaseSchema
from app.schemas.property import PropertyResponse
from app.schemas.user import AuthUserResponse


class PropertyMatchResponse(BaseSchema):
    property: PropertyResponse
    score: int
    reasons: list[str]
    dimensions: dict[str, int]
    explanation: str


class RoommateMatchResponse(BaseSchema):
    user: AuthUserResponse
    score: int
    reasons: list[str]
    dimensions: dict[str, int]
    explanation: str
