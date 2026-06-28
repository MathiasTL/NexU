from __future__ import annotations
from pydantic import BaseModel, ConfigDict


class Booking(BaseModel):
    model_config = ConfigDict(frozen=True)

    id: int
    property_id: int
    tenant_id: int
    host_id: int
    start_month: str      # 'YYYY-MM'
    duration_months: int  # 1, 2, 3, 6, 12
    resident_count: int
    price_per_month: float
    service_fee: float    # 14% of (price_per_month × duration_months)
    total_amount: float
    currency: str = "PEN"
    status: str  # 'pending' | 'confirmed' | 'completed' | 'cancelled'
    guest_message: str | None = None
    host_note: str | None = None
    created_at: str  # 'YYYY-MM-DD'
