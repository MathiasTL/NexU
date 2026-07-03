from __future__ import annotations
from app.models.connection_request import ConnectionRequest


class MemoryConnectionRequestRepository:
    def __init__(self, seed: list[ConnectionRequest]) -> None:
        self._store: dict[int, ConnectionRequest] = {r.id: r for r in seed}

    def next_id(self) -> int:
        return max(self._store.keys(), default=0) + 1

    def create(self, req: ConnectionRequest) -> ConnectionRequest:
        self._store[req.id] = req
        return req

    def get_by_id(self, req_id: int) -> ConnectionRequest | None:
        return self._store.get(req_id)

    def get_incoming(self, user_id: int) -> list[ConnectionRequest]:
        return [r for r in self._store.values() if r.to_id == user_id]

    def set_status(self, req_id: int, status: str) -> ConnectionRequest | None:
        req = self._store.get(req_id)
        if req is None:
            return None
        req.status = status
        return req
