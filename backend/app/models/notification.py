from __future__ import annotations
from pydantic import BaseModel, ConfigDict


class Notification(BaseModel):
    model_config = ConfigDict(frozen=False)  # mutable: read flag changes

    id: int
    user_id: int
    type: str  # 'new_booking' | 'booking_confirmed' | 'new_review' | 'checkin_reminder'
    title: str
    message: str
    read: bool
    created_at: str  # ISO datetime 'YYYY-MM-DDTHH:MM:SS'
