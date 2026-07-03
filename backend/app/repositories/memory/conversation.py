from __future__ import annotations
from app.models.conversation import Conversation, Message


class MemoryConversationRepository:
    def __init__(self, seed: list[Conversation]) -> None:
        self._store: dict[int, Conversation] = {c.id: c for c in seed}
        self._max_message_id: int = max(
            (m.id for c in seed for m in c.messages),
            default=0,
        )

    def get_by_user_id(self, user_id: int) -> list[Conversation]:
        return [c for c in self._store.values() if user_id in c.participants]

    def get_by_id(self, conversation_id: int) -> Conversation | None:
        return self._store.get(conversation_id)

    def add_message(self, conversation_id: int, message: Message) -> Conversation | None:
        convo = self._store.get(conversation_id)
        if convo is None:
            return None
        convo.messages.append(message)
        convo.last_message_at = message.created_at
        return convo

    def next_message_id(self) -> int:
        self._max_message_id += 1
        return self._max_message_id

    def next_id(self) -> int:
        return max(self._store.keys(), default=0) + 1

    def create(self, conversation: Conversation) -> Conversation:
        self._store[conversation.id] = conversation
        return conversation
