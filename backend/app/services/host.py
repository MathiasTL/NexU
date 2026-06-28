from __future__ import annotations
from app.repositories.base import BookingRepository, ReviewRepository, PropertyRepository
from app.schemas.review import DashboardStatsResponse
from app.schemas.booking import BookingResponse
from app.services.booking import _to_response


class HostService:
    def __init__(
        self,
        booking_repo: BookingRepository,
        review_repo: ReviewRepository,
        property_repo: PropertyRepository,
    ) -> None:
        self._bookings = booking_repo
        self._reviews = review_repo
        self._props = property_repo

    def get_stats(self, host_id: int) -> DashboardStatsResponse:
        bookings = self._bookings.get_by_host_id(host_id)
        non_cancelled = [b for b in bookings if b.status != "cancelled"]
        completed = [b for b in bookings if b.status == "completed"]

        total_revenue = sum(b.total_amount for b in completed)
        average_ticket = total_revenue / len(completed) if completed else 0.0

        host_props = self._props.get_by_host_id(host_id)
        prop_ids = [p.id for p in host_props]
        all_reviews = self._reviews.get_by_property_ids(prop_ids)
        avg_rating = round(sum(r.rating for r in all_reviews) / len(all_reviews), 1) if all_reviews else 0.0

        return DashboardStatsResponse(
            total_bookings=len(non_cancelled),
            total_revenue=total_revenue,
            average_rating=avg_rating,
            average_ticket=round(average_ticket, 2),
        )

    def get_recent_activity(self, host_id: int, limit: int = 4) -> list[BookingResponse]:
        bookings = self._bookings.get_by_host_id(host_id)
        sorted_bookings = sorted(bookings, key=lambda b: b.created_at, reverse=True)
        return [_to_response(b) for b in sorted_bookings[:limit]]
