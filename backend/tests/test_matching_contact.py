"""
Tests del contacto entre roommates (Fase 6): property_id opcional en
conversaciones, creación de conversaciones y el endpoint /connect.
"""
from __future__ import annotations
from app.models.conversation import Conversation
from app.repositories.memory import MemoryConversationRepository
from mock_data import CONVERSATIONS


def test_create_conversation_without_property():
    repo = MemoryConversationRepository(list(CONVERSATIONS))
    new_id = repo.next_id()
    convo = Conversation(
        id=new_id, participants=[1, 3], property_id=None,
        messages=[], last_message_at="2026-07-02T10:00:00",
    )
    created = repo.create(convo)
    assert created.id == new_id
    assert created.property_id is None
    assert repo.get_by_id(new_id) is not None
