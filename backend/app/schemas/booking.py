from __future__ import annotations
from app.schemas.common import BaseSchema


class BookingResponse(BaseSchema):
    id: int
    property_id: int
    property_title: str | None
    property_image: str | None
    tenant_id: int
    host_id: int
    start_month: str
    duration_months: int
    resident_count: int
    price_per_month: float
    service_fee: float
    total_amount: float
    currency: str
    status: str
    guest_message: str | None
    host_note: str | None
    created_at: str


class CreateBookingRequest(BaseSchema):
    property_id: int
    tenant_id: int
    host_id: int
    start_month: str
    duration_months: int
    resident_count: int
    price_per_month: float
    service_fee: float
    total_amount: float
    currency: str = "PEN"
    guest_message: str | None = None


class UpdateBookingStatusRequest(BaseSchema):
    status: str  # 'pending' | 'confirmed' | 'completed' | 'cancelled'
