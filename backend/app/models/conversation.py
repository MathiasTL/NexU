from __future__ import annotations
from pydantic import BaseModel, ConfigDict


class Message(BaseModel):
    model_config = ConfigDict(frozen=True)

    id: int
    sender_id: int
    text: str
    created_at: str  # ISO datetime


class Conversation(BaseModel):
    model_config = ConfigDict(frozen=False)  # mutable: messages grow

    id: int
    participants: list[int]  # [User.id, User.id]
    property_id: int | None = None  # None cuando es conversación entre roommates
    messages: list[Message]
    last_message_at: str  # ISO datetime
