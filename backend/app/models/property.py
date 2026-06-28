from __future__ import annotations
from pydantic import BaseModel, ConfigDict


class Property(BaseModel):
    model_config = ConfigDict(frozen=True)

    id: int
    host_id: int
    title: str
    description: str
    short_description: str
    room_type: str  # 'room' | 'apartment' | 'shared' | 'studio'
    price_per_month: float
    price_per_night: float = 0.0  # deprecated; kept for backward compat
    currency: str = "PEN"
    location: str
    district: str
    city: str
    country: str
    lat: float
    lng: float
    images: list[str]
    amenities: list[str]  # Amenity IDs
    capacity: int
    bedrooms: int
    beds: int
    bathrooms: int
    checkin_time: str   # 'HH:MM'
    checkout_time: str  # 'HH:MM'
    house_rules: list[str]
    status: str  # 'active' | 'inactive'
    availability_status: str  # 'available' | 'reserved' | 'unavailable'
    verified_host: bool
    nearest_university: str
    distance_to_university_minutes: int
    created_at: str  # 'YYYY-MM-DD'
    # rating and reviews_count are NOT stored — computed at service layer
