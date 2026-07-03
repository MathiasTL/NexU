from __future__ import annotations
from fastapi import APIRouter, Depends
from app.schemas.matching import (
    PropertyMatchResponse, RoommateMatchResponse, ConnectionRequestResponse,
)
from app.schemas.review import ConversationResponse
from app.services.matching import MatchingService
from app.api.deps import (
    get_user_repo, get_property_repo, get_review_repo, get_conversation_repo,
    get_connection_request_repo, get_current_user_id,
)
from app.repositories.base import (
    UserRepository, PropertyRepository, ReviewRepository, ConversationRepository,
    ConnectionRequestRepository,
)

router = APIRouter(prefix="/matching", tags=["matching"])


def _get_service(
    user_repo: UserRepository = Depends(get_user_repo),
    prop_repo: PropertyRepository = Depends(get_property_repo),
    review_repo: ReviewRepository = Depends(get_review_repo),
    convo_repo: ConversationRepository = Depends(get_conversation_repo),
    request_repo: ConnectionRequestRepository = Depends(get_connection_request_repo),
) -> MatchingService:
    return MatchingService(user_repo, prop_repo, review_repo, convo_repo, request_repo)


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


# ── Doble opt-in (solicitud → aceptación) ─────────────────────────────────────

@router.post("/roommates/{target_id}/request", response_model=ConnectionRequestResponse, status_code=201)
def request_roommate(
    target_id: int,
    user_id: int = Depends(get_current_user_id),
    svc: MatchingService = Depends(_get_service),
) -> ConnectionRequestResponse:
    return svc.request_roommate(user_id, target_id)


@router.get("/requests", response_model=list[ConnectionRequestResponse])
def list_incoming_requests(
    user_id: int = Depends(get_current_user_id),
    svc: MatchingService = Depends(_get_service),
) -> list[ConnectionRequestResponse]:
    return svc.list_incoming(user_id)


@router.post("/requests/{req_id}/accept", response_model=ConversationResponse)
def accept_request(
    req_id: int,
    user_id: int = Depends(get_current_user_id),
    svc: MatchingService = Depends(_get_service),
) -> ConversationResponse:
    return svc.accept_request(user_id, req_id)


@router.post("/requests/{req_id}/reject", response_model=ConnectionRequestResponse)
def reject_request(
    req_id: int,
    user_id: int = Depends(get_current_user_id),
    svc: MatchingService = Depends(_get_service),
) -> ConnectionRequestResponse:
    return svc.reject_request(user_id, req_id)
