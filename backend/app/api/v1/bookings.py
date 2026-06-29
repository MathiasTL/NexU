from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from app.schemas.booking import BookingResponse, CreateBookingRequest, UpdateBookingStatusRequest
from app.services.booking import BookingService
from app.api.deps import get_booking_repo, get_property_repo, get_user_repo, get_current_user_id
from app.repositories.base import BookingRepository, PropertyRepository, UserRepository
from app.core.exceptions import bad_request

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _get_service(
    repo: BookingRepository = Depends(get_booking_repo),
    prop_repo: PropertyRepository = Depends(get_property_repo),
    user_repo: UserRepository = Depends(get_user_repo),
) -> BookingService:
    return BookingService(repo, prop_repo, user_repo)


@router.get("", response_model=list[BookingResponse])
def list_bookings(
    tenant_id: int | None = Query(None, alias="tenantId"),
    host_id: int | None = Query(None, alias="hostId"),
    _: int = Depends(get_current_user_id),
    svc: BookingService = Depends(_get_service),
) -> list[BookingResponse]:
    if tenant_id is not None:
        return svc.get_by_tenant(tenant_id)
    if host_id is not None:
        return svc.get_by_host(host_id)
    raise bad_request("Provide tenantId or hostId query param")


@router.post("", response_model=BookingResponse, status_code=201)
def create_booking(
    body: CreateBookingRequest,
    _: int = Depends(get_current_user_id),
    svc: BookingService = Depends(_get_service),
) -> BookingResponse:
    return svc.create(body)


@router.patch("/{booking_id}/status", status_code=204)
def update_booking_status(
    booking_id: int,
    body: UpdateBookingStatusRequest,
    _: int = Depends(get_current_user_id),
    svc: BookingService = Depends(_get_service),
) -> None:
    svc.update_status(booking_id, body.status)
