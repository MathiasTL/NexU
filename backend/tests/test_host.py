"""
Tests del dashboard de host: estadísticas y actividad reciente.
"""
from __future__ import annotations
from fastapi.testclient import TestClient


class TestHostStats:
    def test_stats_ok(self, client: TestClient, host_headers: dict):
        r = client.get("/api/v1/host/stats?hostId=2", headers=host_headers)
        assert r.status_code == 200

    def test_stats_required_fields(self, client: TestClient, host_headers: dict):
        stats = client.get("/api/v1/host/stats?hostId=2", headers=host_headers).json()
        for field in ("totalBookings", "totalRevenue", "averageRating", "averageTicket"):
            assert field in stats, f"Campo faltante: {field}"

    def test_stats_total_bookings_positive(self, client: TestClient, host_headers: dict):
        stats = client.get("/api/v1/host/stats?hostId=2", headers=host_headers).json()
        assert stats["totalBookings"] >= 0

    def test_stats_average_rating_range(self, client: TestClient, host_headers: dict):
        stats = client.get("/api/v1/host/stats?hostId=2", headers=host_headers).json()
        assert 0.0 <= stats["averageRating"] <= 5.0

    def test_stats_total_revenue_non_negative(self, client: TestClient, host_headers: dict):
        stats = client.get("/api/v1/host/stats?hostId=2", headers=host_headers).json()
        assert stats["totalRevenue"] >= 0

    def test_stats_requires_auth(self, client: TestClient):
        r = client.get("/api/v1/host/stats?hostId=2")
        assert r.status_code == 401

    def test_stats_missing_host_id(self, client: TestClient, host_headers: dict):
        r = client.get("/api/v1/host/stats", headers=host_headers)
        assert r.status_code == 422

    def test_stats_host_with_no_bookings(self, client: TestClient, host_headers: dict):
        r = client.get("/api/v1/host/stats?hostId=9999", headers=host_headers)
        assert r.status_code == 200
        stats = r.json()
        assert stats["totalBookings"] == 0
        assert stats["totalRevenue"] == 0
        assert stats["averageRating"] == 0.0


class TestHostActivity:
    def test_activity_ok(self, client: TestClient, host_headers: dict):
        r = client.get("/api/v1/host/activity?hostId=2", headers=host_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_activity_has_bookings(self, client: TestClient, host_headers: dict):
        activity = client.get("/api/v1/host/activity?hostId=2", headers=host_headers).json()
        assert len(activity) >= 1

    def test_activity_booking_fields(self, client: TestClient, host_headers: dict):
        activity = client.get("/api/v1/host/activity?hostId=2", headers=host_headers).json()
        b = activity[0]
        for field in ("id", "propertyId", "tenantId", "hostId", "status", "createdAt"):
            assert field in b, f"Campo faltante: {field}"

    def test_activity_requires_auth(self, client: TestClient):
        r = client.get("/api/v1/host/activity?hostId=2")
        assert r.status_code == 401

    def test_activity_missing_host_id(self, client: TestClient, host_headers: dict):
        r = client.get("/api/v1/host/activity", headers=host_headers)
        assert r.status_code == 422

    def test_activity_host_no_bookings(self, client: TestClient, host_headers: dict):
        r = client.get("/api/v1/host/activity?hostId=9999", headers=host_headers)
        assert r.status_code == 200
        assert r.json() == []
