from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from app.schemas.review import ReviewResponse
from app.services.review import ReviewService
from app.api.deps import get_review_repo, get_user_repo
from app.repositories.base import ReviewRepository, UserRepository

router = APIRouter(tags=["reviews"])


def _get_service(
    review_repo: ReviewRepository = Depends(get_review_repo),
    user_repo: UserRepository = Depends(get_user_repo),
) -> ReviewService:
    return ReviewService(review_repo, user_repo)


@router.get("/properties/{property_id}/reviews", response_model=list[ReviewResponse])
def get_reviews_by_property(
    property_id: int,
    svc: ReviewService = Depends(_get_service),
) -> list[ReviewResponse]:
    return svc.get_by_property_id(property_id)


@router.get("/reviews", response_model=list[ReviewResponse])
def get_reviews_by_property_ids(
    property_ids: str = Query(..., alias="propertyIds", description="Comma-separated property IDs, e.g. 1,2,3"),
    svc: ReviewService = Depends(_get_service),
) -> list[ReviewResponse]:
    ids = [int(i.strip()) for i in property_ids.split(",") if i.strip().isdigit()]
    return svc.get_by_property_ids(ids)
