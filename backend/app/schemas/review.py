from __future__ import annotations
from app.schemas.common import BaseSchema


class ReviewResponse(BaseSchema):
    id: int
    property_id: int
    booking_id: int
    reviewer_id: int
    reviewer_first_name: str   # joined from User at service layer
    reviewer_last_name: str    # joined from User at service layer
    reviewer_avatar: str       # joined from User at service layer
    rating: int
    comment: str
    created_at: str


class DashboardStatsResponse(BaseSchema):
    total_bookings: int
    total_revenue: float
    average_rating: float
    average_ticket: float


class NotificationResponse(BaseSchema):
    id: int
    user_id: int
    type: str
    title: str
    message: str
    read: bool
    created_at: str


class MessageResponse(BaseSchema):
    id: int
    sender_id: int
    text: str
    created_at: str


class ParticipantInfo(BaseSchema):
    id: int
    first_name: str
    last_name: str
    avatar_url: str


class ConversationResponse(BaseSchema):
    id: int
    participants: list[int]
    participants_info: list[ParticipantInfo]
    property_id: int | None = None
    property_title: str | None = None
    messages: list[MessageResponse]
    last_message_at: str


class SendMessageRequest(BaseSchema):
    sender_id: int
    text: str
