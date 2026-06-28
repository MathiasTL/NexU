from __future__ import annotations
from pydantic import BaseModel, ConfigDict


class LifestylePreferences(BaseModel):
    model_config = ConfigDict(frozen=True)

    sleep_schedule: str = ""
    study_habits: str = ""
    noise_level: str = ""
    cleanliness: str = ""
    guests_policy: str = ""
    smoking_policy: str = ""
    pets_policy: str = ""
    target_university: str = ""
    max_monthly_budget: float = 0.0


class User(BaseModel):
    model_config = ConfigDict(frozen=True)

    id: int
    email: str
    hashed_password: str
    first_name: str
    last_name: str
    role: str  # 'tenant' | 'host' | 'both'
    avatar_url: str
    phone: str
    bio: str
    created_at: str  # 'YYYY-MM-DD'
    lifestyle_preferences: LifestylePreferences | None = None
