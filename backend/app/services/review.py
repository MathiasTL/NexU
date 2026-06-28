from __future__ import annotations
from app.repositories.base import ReviewRepository, UserRepository
from app.schemas.review import ReviewResponse
from app.core.exceptions import not_found


def _enrich(review_repo: ReviewRepository, user_repo: UserRepository, property_id: int) -> list[ReviewResponse]:
    reviews = review_repo.get_by_property_id(property_id)
    result = []
    for r in reviews:
        user = user_repo.get_by_id(r.reviewer_id)
        if user is None:
            continue
        result.append(ReviewResponse(
            id=r.id,
            property_id=r.property_id,
            booking_id=r.booking_id,
            reviewer_id=r.reviewer_id,
            reviewer_first_name=user.first_name,
            reviewer_last_name=user.last_name,
            reviewer_avatar=user.avatar_url,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
        ))
    return result


class ReviewService:
    def __init__(self, review_repo: ReviewRepository, user_repo: UserRepository) -> None:
        self._reviews = review_repo
        self._users = user_repo

    def get_by_property_id(self, property_id: int) -> list[ReviewResponse]:
        return _enrich(self._reviews, self._users, property_id)

    def get_by_property_ids(self, property_ids: list[int]) -> list[ReviewResponse]:
        raw = self._reviews.get_by_property_ids(property_ids)
        result = []
        for r in raw:
            user = self._users.get_by_id(r.reviewer_id)
            if user is None:
                continue
            result.append(ReviewResponse(
                id=r.id,
                property_id=r.property_id,
                booking_id=r.booking_id,
                reviewer_id=r.reviewer_id,
                reviewer_first_name=user.first_name,
                reviewer_last_name=user.last_name,
                reviewer_avatar=user.avatar_url,
                rating=r.rating,
                comment=r.comment,
                created_at=r.created_at,
            ))
        return result
