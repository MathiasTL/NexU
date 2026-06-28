from __future__ import annotations
from pydantic import BaseModel, ConfigDict


class Review(BaseModel):
    model_config = ConfigDict(frozen=True)

    id: int
    property_id: int
    booking_id: int
    reviewer_id: int  # FK to User; first/last name and avatar are joined at service layer
    rating: int  # 1–5
    comment: str
    created_at: str  # 'YYYY-MM-DD'
