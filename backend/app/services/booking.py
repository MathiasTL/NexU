from __future__ import annotations
from datetime import date
from app.repositories.base import BookingRepository, PropertyRepository
from app.models.booking import Booking
from app.schemas.booking import BookingResponse, CreateBookingRequest
from app.core.exceptions import not_found, bad_request

_VALID_STATUSES = {"pending", "confirmed", "completed", "cancelled"}


def _to_response(b: Booking, property_repo: PropertyRepository | None = None) -> BookingResponse:
    prop_title: str | None = None
    prop_image: str | None = None
    if property_repo is not None:
        prop = property_repo.get_by_id(b.property_id)
        if prop is not None:
            prop_title = prop.title
            prop_image = prop.images[0] if prop.images else None
    return BookingResponse(
        id=b.id,
        property_id=b.property_id,
        property_title=prop_title,
        property_image=prop_image,
        tenant_id=b.tenant_id,
        host_id=b.host_id,
        start_month=b.start_month,
        duration_months=b.duration_months,
        resident_count=b.resident_count,
        price_per_month=b.price_per_month,
        service_fee=b.service_fee,
        total_amount=b.total_amount,
        currency=b.currency,
        status=b.status,
        guest_message=b.guest_message,
        host_note=b.host_note,
        created_at=b.created_at,
    )


class BookingService:
    def __init__(self, booking_repo: BookingRepository, property_repo: PropertyRepository | None = None) -> None:
        self._bookings = booking_repo
        self._properties = property_repo

    def get_by_tenant(self, tenant_id: int) -> list[BookingResponse]:
        return [_to_response(b, self._properties) for b in self._bookings.get_by_tenant_id(tenant_id)]

    def get_by_host(self, host_id: int) -> list[BookingResponse]:
        return [_to_response(b, self._properties) for b in self._bookings.get_by_host_id(host_id)]

    def create(self, req: CreateBookingRequest) -> BookingResponse:
        new_id = self._bookings.next_id()
        booking = Booking(
            id=new_id,
            property_id=req.property_id,
            tenant_id=req.tenant_id,
            host_id=req.host_id,
            start_month=req.start_month,
            duration_months=req.duration_months,
            resident_count=req.resident_count,
            price_per_month=req.price_per_month,
            service_fee=req.service_fee,
            total_amount=req.total_amount,
            currency=req.currency,
            status="confirmed",
            guest_message=req.guest_message,
            host_note=None,
            created_at=date.today().isoformat(),
        )
        self._bookings.create(booking)
        return _to_response(booking, self._properties)

    def update_status(self, booking_id: int, status: str) -> None:
        if status not in _VALID_STATUSES:
            raise bad_request(f"status must be one of: {', '.join(_VALID_STATUSES)}")
        updated = self._bookings.update_status(booking_id, status)
        if updated is None:
            raise not_found("Booking", booking_id)
