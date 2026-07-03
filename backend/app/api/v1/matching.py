from __future__ import annotations
from fastapi import APIRouter, Depends
from app.schemas.matching import PropertyMatchResponse, RoommateMatchResponse
from app.schemas.review import ConversationResponse
from app.services.matching import MatchingService
from app.api.deps import (
    get_user_repo, get_property_repo, get_review_repo, get_conversation_repo,
    get_current_user_id,
)
from app.repositories.base import (
    UserRepository, PropertyRepository, ReviewRepository, ConversationRepository,
)

router = APIRouter(prefix="/matching", tags=["matching"])


def _get_service(
    user_repo: UserRepository = Depends(get_user_repo),
    prop_repo: PropertyRepository = Depends(get_property_repo),
    review_repo: ReviewRepository = Depends(get_review_repo),
    convo_repo: ConversationRepository = Depends(get_conversation_repo),
) -> MatchingService:
    return MatchingService(user_repo, prop_repo, review_repo, convo_repo)


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


@router.post("/roommates/{target_id}/connect", response_model=ConversationResponse, status_code=201)
def connect_roommate(
    target_id: int,
    user_id: int = Depends(get_current_user_id),
    svc: MatchingService = Depends(_get_service),
) -> ConversationResponse:
    return svc.connect_roommate(user_id, target_id)
