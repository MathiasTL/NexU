from __future__ import annotations
from pydantic import EmailStr
from app.schemas.common import BaseSchema
from app.schemas.user import AuthUserResponse


class LoginRequest(BaseSchema):
    email: EmailStr
    password: str


class RegisterRequest(BaseSchema):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role: str  # 'tenant' | 'host'


class AuthResponse(BaseSchema):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: AuthUserResponse


class RefreshRequest(BaseSchema):
    refresh_token: str


class RefreshResponse(BaseSchema):
    access_token: str
    token_type: str = "bearer"
