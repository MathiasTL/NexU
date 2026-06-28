"""
Tests de reservas: listado, creación y cambio de estado.
Verifica aislamiento por rol, transiciones válidas e inválidas.
"""
from __future__ import annotations
from fastapi.testclient import TestClient
from tests.conftest import NEW_BOOKING_PAYLOAD


# ── LISTADO ───────────────────────────────────────────────────────────────────

class TestListBookings:
    def test_list_by_tenant_ok(self, client: TestClient, tenant_headers: dict):
        r = client.get("/api/v1/bookings?tenantId=1", headers=tenant_headers)
        assert r.status_code == 200
        bookings = r.json()
        assert len(bookings) >= 1
        assert all(b["tenantId"] == 1 for b in bookings)

    def test_list_by_host_ok(self, client: TestClient, host_headers: dict):
        r = client.get("/api/v1/bookings?hostId=2", headers=host_headers)
        assert r.status_code == 200
        bookings = r.json()
        assert len(bookings) >= 1
        assert all(b["hostId"] == 2 for b in bookings)

    def test_list_requires_auth(self, client: TestClient):
        r = client.get("/api/v1/bookings?tenantId=1")
        assert r.status_code == 401

    def test_list_without_params_returns_400(self, client: TestClient, tenant_headers: dict):
        r = client.get("/api/v1/bookings", headers=tenant_headers)
        assert r.status_code == 400

    def test_booking_fields_present(self, client: TestClient, tenant_headers: dict):
        r = client.get("/api/v1/bookings?tenantId=1", headers=tenant_headers)
        b = r.json()[0]
        for field in ("id", "propertyId", "tenantId", "hostId", "startMonth",
                      "durationMonths", "residentCount", "pricePerMonth",
                      "serviceFee", "totalAmount", "status", "createdAt"):
            assert field in b, f"Campo faltante: {field}"

    def test_start_month_format(self, client: TestClient, tenant_headers: dict):
        r = client.get("/api/v1/bookings?tenantId=1", headers=tenant_headers)
        for b in r.json():
            assert len(b["startMonth"]) == 7   # YYYY-MM
            assert b["startMonth"][4] == "-"


# ── CREACIÓN ──────────────────────────────────────────────────────────────────

class TestCreateBooking:
    def test_create_ok(self, client: TestClient, tenant_headers: dict):
        r = client.post("/api/v1/bookings", json=NEW_BOOKING_PAYLOAD, headers=tenant_headers)
        assert r.status_code == 201
        b = r.json()
        assert b["id"] > 0
        assert b["status"] == "confirmed"
        assert b["propertyId"] == NEW_BOOKING_PAYLOAD["propertyId"]
        assert b["tenantId"] == NEW_BOOKING_PAYLOAD["tenantId"]

    def test_create_requires_auth(self, client: TestClient):
        r = client.post("/api/v1/bookings", json=NEW_BOOKING_PAYLOAD)
        assert r.status_code == 401

    def test_create_with_guest_message(self, client: TestClient, tenant_headers: dict):
        payload = {**NEW_BOOKING_PAYLOAD, "guestMessage": "Mensaje de prueba"}
        r = client.post("/api/v1/bookings", json=payload, headers=tenant_headers)
        assert r.status_code == 201
        assert r.json()["guestMessage"] == "Mensaje de prueba"

    def test_create_missing_required_field(self, client: TestClient, tenant_headers: dict):
        payload = {**NEW_BOOKING_PAYLOAD}
        del payload["propertyId"]
        r = client.post("/api/v1/bookings", json=payload, headers=tenant_headers)
        assert r.status_code == 422

    def test_created_booking_appears_in_tenant_list(self, client: TestClient, tenant_headers: dict):
        r_create = client.post("/api/v1/bookings", json=NEW_BOOKING_PAYLOAD, headers=tenant_headers)
        new_id = r_create.json()["id"]
        r_list = client.get("/api/v1/bookings?tenantId=1", headers=tenant_headers)
        ids = [b["id"] for b in r_list.json()]
        assert new_id in ids


# ── CAMBIO DE ESTADO ──────────────────────────────────────────────────────────

class TestUpdateBookingStatus:
    def _create_booking(self, client: TestClient, headers: dict) -> int:
        r = client.post("/api/v1/bookings", json=NEW_BOOKING_PAYLOAD, headers=headers)
        assert r.status_code == 201
        return r.json()["id"]

    def test_cancel_booking_ok(self, client: TestClient, host_headers: dict, tenant_headers: dict):
        booking_id = self._create_booking(client, tenant_headers)
        r = client.patch(f"/api/v1/bookings/{booking_id}/status",
                         json={"status": "cancelled"}, headers=host_headers)
        assert r.status_code == 204

    def test_cancel_reflects_in_list(self, client: TestClient, tenant_headers: dict, host_headers: dict):
        booking_id = self._create_booking(client, tenant_headers)
        client.patch(f"/api/v1/bookings/{booking_id}/status",
                     json={"status": "cancelled"}, headers=host_headers)
        bookings = client.get("/api/v1/bookings?tenantId=1", headers=tenant_headers).json()
        cancelled = next((b for b in bookings if b["id"] == booking_id), None)
        assert cancelled is not None
        assert cancelled["status"] == "cancelled"

    def test_complete_booking(self, client: TestClient, tenant_headers: dict, host_headers: dict):
        booking_id = self._create_booking(client, tenant_headers)
        r = client.patch(f"/api/v1/bookings/{booking_id}/status",
                         json={"status": "completed"}, headers=host_headers)
        assert r.status_code == 204

    def test_invalid_status_returns_400(self, client: TestClient, tenant_headers: dict, host_headers: dict):
        booking_id = self._create_booking(client, tenant_headers)
        r = client.patch(f"/api/v1/bookings/{booking_id}/status",
                         json={"status": "rechazado"}, headers=host_headers)
        assert r.status_code == 400

    def test_nonexistent_booking_returns_404(self, client: TestClient, host_headers: dict):
        r = client.patch("/api/v1/bookings/99999/status",
                         json={"status": "cancelled"}, headers=host_headers)
        assert r.status_code == 404

    def test_update_requires_auth(self, client: TestClient):
        r = client.patch("/api/v1/bookings/1/status", json={"status": "cancelled"})
        assert r.status_code == 401
