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


class TestConnectEndpoint:
    def test_connect_creates_conversation(self, client, tenant_headers):
        r = client.post("/api/v1/matching/roommates/3/connect", headers=tenant_headers)
        assert r.status_code == 201, r.text
        body = r.json()
        assert 1 in body["participants"] and 3 in body["participants"]

    def test_connect_is_idempotent(self, client, tenant_headers):
        r1 = client.post("/api/v1/matching/roommates/4/connect", headers=tenant_headers)
        r2 = client.post("/api/v1/matching/roommates/4/connect", headers=tenant_headers)
        assert r1.status_code == 201 and r2.status_code == 201
        assert r1.json()["id"] == r2.json()["id"]  # reutiliza, no duplica

    def test_connect_requires_auth(self, client):
        r = client.post("/api/v1/matching/roommates/3/connect")
        assert r.status_code in (401, 403)


class TestConnectionRequests:
    def test_create_and_accept_request(self):
        from app.models.connection_request import ConnectionRequest
        from app.repositories.memory.connection_request import MemoryConnectionRequestRepository
        repo = MemoryConnectionRequestRepository([])
        req = repo.create(ConnectionRequest(
            id=repo.next_id(), from_id=1, to_id=3, status="pending", created_at="2026-07-02",
        ))
        assert req.status == "pending"
        assert any(r.id == req.id for r in repo.get_incoming(3))
        updated = repo.set_status(req.id, "accepted")
        assert updated is not None and updated.status == "accepted"


class TestDoubleOptIn:
    def _lucia_headers(self, client):
        login = client.post("/api/v1/auth/login",
                            json={"email": "lucia.torres@uni.pe", "password": "password123"})
        return {"Authorization": f"Bearer {login.json()['accessToken']}"}

    def test_request_then_accept_creates_conversation(self, client, tenant_headers):
        # Ana (1) solicita a Lucía (3)
        r = client.post("/api/v1/matching/roommates/3/request", headers=tenant_headers)
        assert r.status_code == 201, r.text
        req_id = r.json()["id"]
        assert r.json()["status"] == "pending"
        # Lucía la ve en su bandeja
        lucia_headers = self._lucia_headers(client)
        incoming = client.get("/api/v1/matching/requests", headers=lucia_headers)
        assert incoming.status_code == 200
        assert any(x["id"] == req_id for x in incoming.json())
        # Lucía acepta → se crea/reutiliza la conversación
        acc = client.post(f"/api/v1/matching/requests/{req_id}/accept", headers=lucia_headers)
        assert acc.status_code == 200, acc.text
        assert 1 in acc.json()["participants"] and 3 in acc.json()["participants"]

    def test_reject_marks_rejected(self, client, tenant_headers):
        r = client.post("/api/v1/matching/roommates/5/request", headers=tenant_headers)
        assert r.status_code == 201, r.text
        req_id = r.json()["id"]
        # Valeria (5) rechaza
        login = client.post("/api/v1/auth/login",
                            json={"email": "valeria.chavez@unmsm.pe", "password": "password123"})
        valeria_headers = {"Authorization": f"Bearer {login.json()['accessToken']}"}
        rej = client.post(f"/api/v1/matching/requests/{req_id}/reject", headers=valeria_headers)
        assert rej.status_code == 200, rej.text
        assert rej.json()["status"] == "rejected"

    def test_accept_only_by_recipient(self, client, tenant_headers):
        # Ana solicita a Lucía; un tercero (la propia Ana) no puede aceptar
        r = client.post("/api/v1/matching/roommates/6/request", headers=tenant_headers)
        req_id = r.json()["id"]
        acc = client.post(f"/api/v1/matching/requests/{req_id}/accept", headers=tenant_headers)
        assert acc.status_code in (403, 409)

    def test_request_requires_auth(self, client):
        r = client.post("/api/v1/matching/roommates/3/request")
        assert r.status_code in (401, 403)
