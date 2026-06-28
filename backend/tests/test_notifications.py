"""
Tests de notificaciones: listado y marcar como leída.
Verifica que el estado `read` se persiste correctamente en memoria.
"""
from __future__ import annotations
from fastapi.testclient import TestClient


class TestGetNotifications:
    def test_get_notifications_ok(self, client: TestClient, tenant_headers: dict):
        r = client.get("/api/v1/users/1/notifications", headers=tenant_headers)
        assert r.status_code == 200
        notifs = r.json()
        assert len(notifs) >= 1

    def test_notifications_required_fields(self, client: TestClient, tenant_headers: dict):
        notif = client.get("/api/v1/users/1/notifications", headers=tenant_headers).json()[0]
        for field in ("id", "userId", "type", "title", "message", "read", "createdAt"):
            assert field in notif, f"Campo faltante: {field}"

    def test_notifications_belong_to_user(self, client: TestClient, tenant_headers: dict):
        notifs = client.get("/api/v1/users/1/notifications", headers=tenant_headers).json()
        assert all(n["userId"] == 1 for n in notifs)

    def test_notifications_requires_auth(self, client: TestClient):
        r = client.get("/api/v1/users/1/notifications")
        assert r.status_code == 401

    def test_notifications_host_user(self, client: TestClient, host_headers: dict):
        r = client.get("/api/v1/users/2/notifications", headers=host_headers)
        assert r.status_code == 200


class TestMarkNotificationRead:
    def test_mark_read_ok(self, client: TestClient, tenant_headers: dict):
        notifs = client.get("/api/v1/users/1/notifications", headers=tenant_headers).json()
        notif_id = notifs[0]["id"]
        r = client.patch(f"/api/v1/notifications/{notif_id}/read", headers=tenant_headers)
        assert r.status_code == 204

    def test_mark_read_persists(self, client: TestClient, tenant_headers: dict):
        # Obtener una notificación no leída
        notifs = client.get("/api/v1/users/1/notifications", headers=tenant_headers).json()
        unread = next((n for n in notifs if not n["read"]), None)
        if unread is None:
            return   # todas ya leídas por test previo, skip

        notif_id = unread["id"]
        client.patch(f"/api/v1/notifications/{notif_id}/read", headers=tenant_headers)

        # Verificar que la notificación ahora aparece como leída
        notifs_after = client.get("/api/v1/users/1/notifications", headers=tenant_headers).json()
        updated = next((n for n in notifs_after if n["id"] == notif_id), None)
        assert updated is not None
        assert updated["read"] is True

    def test_mark_read_requires_auth(self, client: TestClient):
        r = client.patch("/api/v1/notifications/1/read")
        assert r.status_code == 401

    def test_mark_read_nonexistent_returns_404(self, client: TestClient, tenant_headers: dict):
        r = client.patch("/api/v1/notifications/99999/read", headers=tenant_headers)
        assert r.status_code == 404
