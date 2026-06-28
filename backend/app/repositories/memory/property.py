from __future__ import annotations
from app.models.property import Property


class MemoryPropertyRepository:
    def __init__(self, seed: list[Property]) -> None:
        self._store: dict[int, Property] = {p.id: p for p in seed}

    def get_by_id(self, property_id: int) -> Property | None:
        return self._store.get(property_id)

    def get_all_active(self) -> list[Property]:
        return [p for p in self._store.values() if p.status == "active"]

    def get_by_host_id(self, host_id: int) -> list[Property]:
        return [p for p in self._store.values() if p.host_id == host_id]

    def search(
        self,
        district: str | None = None,
        room_type: str | None = None,
        nearest_university: str | None = None,
        min_price_per_month: float | None = None,
        max_price_per_month: float | None = None,
        capacity: int | None = None,
        amenities: list[str] | None = None,
        query: str | None = None,
        pets_allowed: bool | None = None,
        quiet_hours: bool | None = None,
        has_workspace: bool | None = None,
    ) -> list[Property]:
        results = self.get_all_active()

        if district:
            results = [p for p in results if district.lower() in p.district.lower()]
        if room_type:
            results = [p for p in results if p.room_type == room_type]
        if nearest_university:
            results = [p for p in results if p.nearest_university == nearest_university]
        if min_price_per_month is not None:
            results = [p for p in results if p.price_per_month >= min_price_per_month]
        if max_price_per_month is not None:
            results = [p for p in results if p.price_per_month <= max_price_per_month]
        if capacity is not None:
            results = [p for p in results if p.capacity >= capacity]
        if amenities:
            results = [p for p in results if all(a in p.amenities for a in amenities)]
        if query:
            q = query.lower()
            results = [
                p for p in results
                if q in p.title.lower()
                or q in p.district.lower()
                or q in p.nearest_university.lower()
                or q in p.description.lower()
            ]
        if pets_allowed is True:
            results = [p for p in results if "PETS_ALLOWED" in p.amenities]
        if quiet_hours is True:
            results = [p for p in results if "QUIET_HOURS" in p.amenities]
        if has_workspace is True:
            results = [p for p in results if "WORKSPACE" in p.amenities]

        return results

    def create(self, prop: Property) -> Property:
        self._store[prop.id] = prop
        return prop

    def next_id(self) -> int:
        return max(self._store.keys(), default=0) + 1
