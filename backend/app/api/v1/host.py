from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from app.schemas.review import DashboardStatsResponse
from app.schemas.booking import BookingResponse
from app.services.host import HostService
from app.api.deps import get_booking_repo, get_review_repo, get_property_repo, get_current_user_id
from app.repositories.base import BookingRepository, ReviewRepository, PropertyRepository

router = APIRouter(prefix="/host", tags=["host"])


def _get_service(
    booking_repo: BookingRepository = Depends(get_booking_repo),
    review_repo: ReviewRepository = Depends(get_review_repo),
    property_repo: PropertyRepository = Depends(get_property_repo),
) -> HostService:
    return HostService(booking_repo, review_repo, property_repo)


@router.get("/stats", response_model=DashboardStatsResponse)
def get_stats(
    host_id: int = Query(..., alias="hostId"),
    _: int = Depends(get_current_user_id),
    svc: HostService = Depends(_get_service),
) -> DashboardStatsResponse:
    return svc.get_stats(host_id)


@router.get("/activity", response_model=list[BookingResponse])
def get_activity(
    host_id: int = Query(..., alias="hostId"),
    _: int = Depends(get_current_user_id),
    svc: HostService = Depends(_get_service),
) -> list[BookingResponse]:
    return svc.get_recent_activity(host_id)
