from __future__ import annotations
import copy
from app.models.user import User, LifestylePreferences


class MemoryUserRepository:
    def __init__(self, seed: list[User]) -> None:
        self._store: dict[int, User] = {u.id: u for u in seed}

    def get_by_id(self, user_id: int) -> User | None:
        return self._store.get(user_id)

    def get_by_email(self, email: str) -> User | None:
        return next((u for u in self._store.values() if u.email == email), None)

    def get_all(self) -> list[User]:
        return list(self._store.values())

    def create(self, user: User) -> User:
        self._store[user.id] = user
        return user

    def update_profile(self, user_id: int, first_name: str, last_name: str, phone: str, bio: str) -> User | None:
        user = self._store.get(user_id)
        if user is None:
            return None
        updated = user.model_copy(update={"first_name": first_name, "last_name": last_name, "phone": phone, "bio": bio})
        self._store[user_id] = updated
        return updated

    def update_personal_info(self, user_id: int, email: str, phone: str) -> User | None:
        user = self._store.get(user_id)
        if user is None:
            return None
        updated = user.model_copy(update={"email": email, "phone": phone})
        self._store[user_id] = updated
        return updated

    def update_preferences(self, user_id: int, prefs: LifestylePreferences) -> User | None:
        user = self._store.get(user_id)
        if user is None:
            return None
        updated = user.model_copy(update={"lifestyle_preferences": prefs})
        self._store[user_id] = updated
        return updated

    def next_id(self) -> int:
        return max(self._store.keys(), default=0) + 1
