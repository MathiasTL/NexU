from __future__ import annotations
from fastapi import APIRouter, Depends
from app.schemas.user import AuthUserResponse, ProfileUpdateRequest, PersonalInfoUpdateRequest, PreferencesUpdateRequest
from app.schemas.review import NotificationResponse, ConversationResponse, MessageResponse, SendMessageRequest
from app.services.user import UserService
from app.api.deps import (
    get_user_repo, get_notification_repo, get_conversation_repo, get_current_user_id,
)
from app.repositories.base import UserRepository, NotificationRepository, ConversationRepository

router = APIRouter(tags=["users"])


def _get_service(
    user_repo: UserRepository = Depends(get_user_repo),
    notif_repo: NotificationRepository = Depends(get_notification_repo),
    convo_repo: ConversationRepository = Depends(get_conversation_repo),
) -> UserService:
    return UserService(user_repo, notif_repo, convo_repo)



@router.patch("/users/{user_id}/profile", response_model=AuthUserResponse)
def update_profile(
    user_id: int,
    body: ProfileUpdateRequest,
    _: int = Depends(get_current_user_id),
    svc: UserService = Depends(_get_service),
) -> AuthUserResponse:
    return svc.update_profile(user_id, body)


@router.patch("/users/{user_id}/personal-info", response_model=AuthUserResponse)
def update_personal_info(
    user_id: int,
    body: PersonalInfoUpdateRequest,
    _: int = Depends(get_current_user_id),
    svc: UserService = Depends(_get_service),
) -> AuthUserResponse:
    return svc.update_personal_info(user_id, body)


@router.patch("/users/{user_id}/preferences", response_model=AuthUserResponse)
def update_preferences(
    user_id: int,
    body: PreferencesUpdateRequest,
    _: int = Depends(get_current_user_id),
    svc: UserService = Depends(_get_service),
) -> AuthUserResponse:
    return svc.update_preferences(user_id, body)


@router.get("/users/{user_id}/notifications", response_model=list[NotificationResponse])
def get_notifications(
    user_id: int,
    _: int = Depends(get_current_user_id),
    svc: UserService = Depends(_get_service),
) -> list[NotificationResponse]:
    return svc.get_notifications(user_id)


@router.patch("/notifications/{notification_id}/read", status_code=204)
def mark_notification_read(
    notification_id: int,
    _: int = Depends(get_current_user_id),
    svc: UserService = Depends(_get_service),
) -> None:
    svc.mark_notification_read(notification_id)


@router.get("/users/{user_id}/conversations", response_model=list[ConversationResponse])
def get_conversations(
    user_id: int,
    _: int = Depends(get_current_user_id),
    svc: UserService = Depends(_get_service),
) -> list[ConversationResponse]:
    return svc.get_conversations(user_id)


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse, status_code=201)
def send_message(
    conversation_id: int,
    body: SendMessageRequest,
    _: int = Depends(get_current_user_id),
    svc: UserService = Depends(_get_service),
) -> MessageResponse:
    return svc.send_message(conversation_id, body)
