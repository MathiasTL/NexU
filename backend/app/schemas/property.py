from __future__ import annotations
from app.schemas.common import BaseSchema


class PropertyResponse(BaseSchema):
    id: int
    host_id: int
    title: str
    description: str
    short_description: str
    room_type: str
    price_per_month: float
    price_per_night: float = 0.0
    currency: str
    location: str
    district: str
    city: str
    country: str
    lat: float
    lng: float
    images: list[str]
    amenities: list[str]
    capacity: int
    bedrooms: int
    beds: int
    bathrooms: int
    rating: float          # computed by service
    reviews_count: int     # computed by service
    checkin_time: str
    checkout_time: str
    house_rules: list[str]
    status: str
    availability_status: str
    verified_host: bool
    nearest_university: str
    distance_to_university_minutes: int
    created_at: str


class CreatePropertyRequest(BaseSchema):
    title: str
    description: str
    short_description: str = ""
    room_type: str
    price_per_month: float
    price_per_night: float = 0.0
    location: str
    district: str
    city: str = "Lima"
    country: str = "Perú"
    lat: float
    lng: float
    images: list[str] = []
    amenities: list[str] = []
    capacity: int
    bedrooms: int
    beds: int
    bathrooms: int
    checkin_time: str = "14:00"
    checkout_time: str = "12:00"
    house_rules: list[str] = []
    availability_status: str = "available"
    nearest_university: str
    distance_to_university_minutes: int


class UploadImagesResponse(BaseSchema):
    urls: list[str]
