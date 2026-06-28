from __future__ import annotations
from fastapi import APIRouter, Depends
from app.schemas.auth import LoginRequest, RegisterRequest, AuthResponse, RefreshRequest, RefreshResponse
from app.schemas.user import AuthUserResponse
from app.services.auth import AuthService
from app.core.security import create_access_token
from app.core.exceptions import unauthorized
from app.api.deps import get_user_repo, get_current_user_id, get_refresh_user_id
from app.repositories.base import UserRepository

router = APIRouter(prefix="/auth", tags=["auth"])


def _get_service(user_repo: UserRepository = Depends(get_user_repo)) -> AuthService:
    return AuthService(user_repo)


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, svc: AuthService = Depends(_get_service)) -> AuthResponse:
    return svc.login(str(body.email), body.password)


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(body: RegisterRequest, svc: AuthService = Depends(_get_service)) -> AuthResponse:
    return svc.register(body.first_name, body.last_name, str(body.email), body.password, body.role)


@router.post("/refresh", response_model=RefreshResponse)
def refresh(user_id: int = Depends(get_refresh_user_id)) -> RefreshResponse:
    return RefreshResponse(access_token=create_access_token(user_id))


@router.get("/me", response_model=AuthUserResponse)
def me(
    user_id: int = Depends(get_current_user_id),
    svc: AuthService = Depends(_get_service),
) -> AuthUserResponse:
    return svc.get_auth_user(user_id)
