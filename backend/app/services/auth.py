from __future__ import annotations
from datetime import date
from app.repositories.base import UserRepository
from app.models.user import User
from app.schemas.auth import AuthResponse
from app.schemas.user import AuthUserResponse, LifestylePreferencesSchema
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.exceptions import bad_request, unauthorized, conflict


def _to_auth_user(user: User) -> AuthUserResponse:
    prefs = None
    if user.lifestyle_preferences:
        prefs = LifestylePreferencesSchema(
            sleep_schedule=user.lifestyle_preferences.sleep_schedule,
            study_habits=user.lifestyle_preferences.study_habits,
            noise_level=user.lifestyle_preferences.noise_level,
            cleanliness=user.lifestyle_preferences.cleanliness,
            guests_policy=user.lifestyle_preferences.guests_policy,
            smoking_policy=user.lifestyle_preferences.smoking_policy,
            pets_policy=user.lifestyle_preferences.pets_policy,
            target_university=user.lifestyle_preferences.target_university,
            max_monthly_budget=user.lifestyle_preferences.max_monthly_budget,
        )
    return AuthUserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        avatar_url=user.avatar_url,
        phone=user.phone,
        bio=user.bio,
        created_at=user.created_at,
        lifestyle_preferences=prefs,
    )


def _build_auth_response(user: User) -> AuthResponse:
    return AuthResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=_to_auth_user(user),
    )


class AuthService:
    def __init__(self, user_repo: UserRepository) -> None:
        self._users = user_repo

    def login(self, email: str, password: str) -> AuthResponse:
        user = self._users.get_by_email(email)
        if user is None or not verify_password(password, user.hashed_password):
            raise unauthorized("Invalid email or password")
        return _build_auth_response(user)

    def register(self, first_name: str, last_name: str, email: str, password: str, role: str) -> AuthResponse:
        if role not in ("tenant", "host"):
            raise bad_request("role must be 'tenant' or 'host'")
        if self._users.get_by_email(email):
            raise conflict("Email already registered")
        new_id = self._users.next_id()
        user = User(
            id=new_id,
            email=email,
            hashed_password=hash_password(password),
            first_name=first_name,
            last_name=last_name,
            role=role,
            avatar_url=f"https://i.pravatar.cc/150?u={new_id}",
            phone="",
            bio="",
            created_at=date.today().isoformat(),
        )
        self._users.create(user)
        return _build_auth_response(user)

    def get_auth_user(self, user_id: int) -> AuthUserResponse:
        user = self._users.get_by_id(user_id)
        if user is None:
            raise unauthorized()
        return _to_auth_user(user)
