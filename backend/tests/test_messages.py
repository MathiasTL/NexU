"""
Tests de mensajería: listar conversaciones y enviar mensajes.
Verifica que el mensaje nuevo aparece en la conversación tras el envío.
"""
from __future__ import annotations
from fastapi.testclient import TestClient


class TestConversations:
    def test_get_conversations_ok(self, client: TestClient, tenant_headers: dict):
        r = client.get("/api/v1/users/1/conversations", headers=tenant_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_conversations_have_messages(self, client: TestClient, tenant_headers: dict):
        convos = client.get("/api/v1/users/1/conversations", headers=tenant_headers).json()
        assert len(convos) >= 1
        assert isinstance(convos[0]["messages"], list)

    def test_conversation_required_fields(self, client: TestClient, tenant_headers: dict):
        conv = client.get("/api/v1/users/1/conversations", headers=tenant_headers).json()[0]
        for field in ("id", "participants", "propertyId", "messages", "lastMessageAt"):
            assert field in conv, f"Campo faltante: {field}"

    def test_conversations_user_is_participant(self, client: TestClient, tenant_headers: dict):
        convos = client.get("/api/v1/users/1/conversations", headers=tenant_headers).json()
        assert all(1 in c["participants"] for c in convos)

    def test_conversations_requires_auth(self, client: TestClient):
        r = client.get("/api/v1/users/1/conversations")
        assert r.status_code == 401

    def test_conversations_host(self, client: TestClient, host_headers: dict):
        r = client.get("/api/v1/users/2/conversations", headers=host_headers)
        assert r.status_code == 200


class TestSendMessage:
    def test_send_message_ok(self, client: TestClient, tenant_headers: dict):
        r = client.post("/api/v1/conversations/1/messages",
                        json={"senderId": 1, "text": "Hola, ¿está disponible la habitación?"},
                        headers=tenant_headers)
        assert r.status_code == 201
        msg = r.json()
        assert msg["id"] > 0
        assert msg["senderId"] == 1
        assert msg["text"] == "Hola, ¿está disponible la habitación?"
        assert "createdAt" in msg

    def test_send_message_appears_in_conversation(self, client: TestClient, tenant_headers: dict):
        text = "Mensaje único para verificar persistencia"
        client.post("/api/v1/conversations/1/messages",
                    json={"senderId": 1, "text": text}, headers=tenant_headers)
        conv = client.get("/api/v1/users/1/conversations", headers=tenant_headers).json()
        conv1 = next((c for c in conv if c["id"] == 1), None)
        assert conv1 is not None
        texts = [m["text"] for m in conv1["messages"]]
        assert text in texts

    def test_send_message_updates_last_message_at(self, client: TestClient, tenant_headers: dict):
        before = client.get("/api/v1/users/1/conversations", headers=tenant_headers).json()
        conv_before = next((c for c in before if c["id"] == 1), None)
        old_ts = conv_before["lastMessageAt"] if conv_before else None

        client.post("/api/v1/conversations/1/messages",
                    json={"senderId": 1, "text": "Mensaje ts"}, headers=tenant_headers)

        after = client.get("/api/v1/users/1/conversations", headers=tenant_headers).json()
        conv_after = next((c for c in after if c["id"] == 1), None)
        assert conv_after["lastMessageAt"] >= (old_ts or "")

    def test_send_message_requires_auth(self, client: TestClient):
        r = client.post("/api/v1/conversations/1/messages",
                        json={"senderId": 1, "text": "sin auth"})
        assert r.status_code == 401

    def test_send_message_missing_text(self, client: TestClient, tenant_headers: dict):
        r = client.post("/api/v1/conversations/1/messages",
                        json={"senderId": 1}, headers=tenant_headers)
        assert r.status_code == 422

    def test_send_to_nonexistent_conversation(self, client: TestClient, tenant_headers: dict):
        r = client.post("/api/v1/conversations/9999/messages",
                        json={"senderId": 1, "text": "texto"}, headers=tenant_headers)
        assert r.status_code == 404
