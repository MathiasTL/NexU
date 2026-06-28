from __future__ import annotations
from app.models.notification import Notification


class MemoryNotificationRepository:
    def __init__(self, seed: list[Notification]) -> None:
        self._store: dict[int, Notification] = {n.id: n for n in seed}

    def get_by_user_id(self, user_id: int) -> list[Notification]:
        return [n for n in self._store.values() if n.user_id == user_id]

    def mark_read(self, notification_id: int) -> Notification | None:
        notif = self._store.get(notification_id)
        if notif is None:
            return None
        notif.read = True  # Notification model is mutable
        return notif
