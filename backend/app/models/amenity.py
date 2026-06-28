from __future__ import annotations
from pydantic import BaseModel, ConfigDict


class Amenity(BaseModel):
    model_config = ConfigDict(frozen=True)

    id: str    # 'WIFI', 'POOL', etc.
    name: str
    icon: str  # Lucide React icon name


class AmenityCategory(BaseModel):
    model_config = ConfigDict(frozen=True)

    title: str
    amenities: list[Amenity]
