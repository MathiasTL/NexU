from __future__ import annotations
from app.models.booking import Booking


class MemoryBookingRepository:
    def __init__(self, seed: list[Booking]) -> None:
        self._store: dict[int, Booking] = {b.id: b for b in seed}

    def get_by_tenant_id(self, tenant_id: int) -> list[Booking]:
        return [b for b in self._store.values() if b.tenant_id == tenant_id]

    def get_by_host_id(self, host_id: int) -> list[Booking]:
        return [b for b in self._store.values() if b.host_id == host_id]

    def get_by_id(self, booking_id: int) -> Booking | None:
        return self._store.get(booking_id)

    def create(self, booking: Booking) -> Booking:
        self._store[booking.id] = booking
        return booking

    def update_status(self, booking_id: int, status: str) -> Booking | None:
        booking = self._store.get(booking_id)
        if booking is None:
            return None
        updated = booking.model_copy(update={"status": status})
        self._store[booking_id] = updated
        return updated

    def next_id(self) -> int:
        return max(self._store.keys(), default=0) + 1
