from __future__ import annotations
from pydantic import EmailStr
from app.schemas.common import BaseSchema


class LifestylePreferencesSchema(BaseSchema):
    sleep_schedule: str = ""
    study_habits: str = ""
    noise_level: str = ""
    cleanliness: str = ""
    guests_policy: str = ""
    smoking_policy: str = ""
    pets_policy: str = ""
    target_university: str = ""
    max_monthly_budget: float = 0.0


class AuthUserResponse(BaseSchema):
    id: int
    email: str
    first_name: str
    last_name: str
    role: str
    avatar_url: str
    phone: str
    bio: str
    created_at: str
    lifestyle_preferences: LifestylePreferencesSchema | None = None


class ProfileUpdateRequest(BaseSchema):
    first_name: str
    last_name: str
    phone: str
    bio: str


class PersonalInfoUpdateRequest(BaseSchema):
    email: EmailStr
    phone: str


class PreferencesUpdateRequest(BaseSchema):
    lifestyle_preferences: LifestylePreferencesSchema
