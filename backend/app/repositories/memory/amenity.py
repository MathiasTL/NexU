from __future__ import annotations
from app.models.amenity import AmenityCategory


class MemoryAmenityRepository:
    def __init__(self, seed: list[AmenityCategory]) -> None:
        self._categories = seed

    def get_all_categories(self) -> list[AmenityCategory]:
        return self._categories
