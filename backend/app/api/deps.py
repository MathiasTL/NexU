from __future__ import annotations
from fastapi import Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import verify_access_token, verify_refresh_token
from app.core.exceptions import unauthorized
from app.repositories.base import (
    UserRepository, PropertyRepository, BookingRepository,
    ReviewRepository, NotificationRepository, ConversationRepository, AmenityRepository,
    ConnectionRequestRepository,
)
from app.services.storage import StorageRepository

_bearer = HTTPBearer()


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> int:
    user_id = verify_access_token(credentials.credentials)
    if user_id is None:
        raise unauthorized("Invalid or expired access token")
    return user_id


def get_refresh_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> int:
    user_id = verify_refresh_token(credentials.credentials)
    if user_id is None:
        raise unauthorized("Invalid or expired refresh token")
    return user_id


def get_user_repo(request: Request) -> UserRepository:
    return request.app.state.user_repo  # type: ignore[no-any-return]


def get_property_repo(request: Request) -> PropertyRepository:
    return request.app.state.property_repo  # type: ignore[no-any-return]


def get_booking_repo(request: Request) -> BookingRepository:
    return request.app.state.booking_repo  # type: ignore[no-any-return]


def get_review_repo(request: Request) -> ReviewRepository:
    return request.app.state.review_repo  # type: ignore[no-any-return]


def get_notification_repo(request: Request) -> NotificationRepository:
    return request.app.state.notification_repo  # type: ignore[no-any-return]


def get_conversation_repo(request: Request) -> ConversationRepository:
    return request.app.state.conversation_repo  # type: ignore[no-any-return]


def get_amenity_repo(request: Request) -> AmenityRepository:
    return request.app.state.amenity_repo  # type: ignore[no-any-return]


def get_connection_request_repo(request: Request) -> ConnectionRequestRepository:
    return request.app.state.connection_request_repo  # type: ignore[no-any-return]


def get_storage_repo(request: Request) -> StorageRepository:
    return request.app.state.storage_repo  # type: ignore[no-any-return]
