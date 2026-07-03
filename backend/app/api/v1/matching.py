from __future__ import annotations
from fastapi import APIRouter, Depends
from app.schemas.matching import PropertyMatchResponse, RoommateMatchResponse
from app.services.matching import MatchingService
from app.api.deps import (
    get_user_repo, get_property_repo, get_review_repo, get_current_user_id,
)
from app.repositories.base import UserRepository, PropertyRepository, ReviewRepository

router = APIRouter(prefix="/matching", tags=["matching"])


def _get_service(
    user_repo: UserRepository = Depends(get_user_repo),
    prop_repo: PropertyRepository = Depends(get_property_repo),
    review_repo: ReviewRepository = Depends(get_review_repo),
) -> MatchingService:
    return MatchingService(user_repo, prop_repo, review_repo)


@router.get("/properties", response_model=list[PropertyMatchResponse])
def match_properties(
    user_id: int = Depends(get_current_user_id),
    svc: MatchingService = Depends(_get_service),
) -> list[PropertyMatchResponse]:
    return svc.rank_properties(user_id)


@router.get("/roommates", response_model=list[RoommateMatchResponse])
def match_roommates(
    user_id: int = Depends(get_current_user_id),
    svc: MatchingService = Depends(_get_service),
) -> list[RoommateMatchResponse]:
    return svc.rank_roommates(user_id)
