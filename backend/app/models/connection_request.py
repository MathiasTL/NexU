from __future__ import annotations
from pydantic import BaseModel, ConfigDict


class ConnectionRequest(BaseModel):
    model_config = ConfigDict(frozen=False)  # mutable: status cambia

    id: int
    from_id: int
    to_id: int
    status: str  # 'pending' | 'accepted' | 'rejected'
    created_at: str
