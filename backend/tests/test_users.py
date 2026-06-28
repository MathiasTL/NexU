"""
Tests de gestión de usuarios: actualización de perfil, info personal y preferencias.
Verifica coherencia de datos tras cada actualización.
"""
from __future__ import annotations
from fastapi.testclient import TestClient


class TestUpdateProfile:
    def test_update_profile_ok(self, client: TestClient, tenant_headers: dict):
        payload = {"firstName": "AnaActualizada", "lastName": "García", "phone": "+51 111 222 333", "bio": "Bio actualizada."}
        r = client.patch("/api/v1/users/1/profile", json=payload, headers=tenant_headers)
        assert r.status_code == 200
        u = r.json()
        assert u["firstName"] == "AnaActualizada"
        assert u["phone"] == "+51 111 222 333"
        assert u["bio"] == "Bio actualizada."

    def test_update_profile_persists(self, client: TestClient, tenant_headers: dict):
        payload = {"firstName": "AnaPersistida", "lastName": "García", "phone": "+51 999", "bio": "Persiste."}
        client.patch("/api/v1/users/1/profile", json=payload, headers=tenant_headers)
        me = client.get("/api/v1/auth/me", headers=tenant_headers).json()
        assert me["firstName"] == "AnaPersistida"

    def test_update_profile_requires_auth(self, client: TestClient):
        payload = {"firstName": "X", "lastName": "Y", "phone": "", "bio": ""}
        r = client.patch("/api/v1/users/1/profile", json=payload)
        assert r.status_code == 401

    def test_update_profile_missing_fields_returns_422(self, client: TestClient, tenant_headers: dict):
        r = client.patch("/api/v1/users/1/profile", json={"firstName": "Solo"}, headers=tenant_headers)
        assert r.status_code == 422

    def test_update_profile_does_not_expose_password(self, client: TestClient, tenant_headers: dict):
        payload = {"firstName": "Seg", "lastName": "Ura", "phone": "", "bio": ""}
        r = client.patch("/api/v1/users/1/profile", json=payload, headers=tenant_headers)
        u = r.json()
        assert "password" not in u
        assert "hashedPassword" not in u


class TestUpdatePersonalInfo:
    def test_update_personal_info_ok(self, client: TestClient, tenant_headers: dict):
        r = client.patch("/api/v1/users/1/personal-info",
                         json={"email": "ana.garcia@pucp.pe", "phone": "+51 777 888 999"},
                         headers=tenant_headers)
        assert r.status_code == 200
        u = r.json()
        assert u["phone"] == "+51 777 888 999"

    def test_update_personal_info_invalid_email(self, client: TestClient, tenant_headers: dict):
        r = client.patch("/api/v1/users/1/personal-info",
                         json={"email": "no-es-email", "phone": "+51 000"},
                         headers=tenant_headers)
        assert r.status_code == 422

    def test_update_personal_info_requires_auth(self, client: TestClient):
        r = client.patch("/api/v1/users/1/personal-info",
                         json={"email": "a@b.com", "phone": ""})
        assert r.status_code == 401


class TestUpdatePreferences:
    PREFS_PAYLOAD = {
        "lifestylePreferences": {
            "sleepSchedule": "night",
            "studyHabits": "moderate",
            "noiseLevel": "quiet",
            "cleanliness": "strict",
            "guestsPolicy": "never",
            "smokingPolicy": "no",
            "petsPolicy": "yes",
            "targetUniversity": "UNI",
            "maxMonthlyBudget": 700.0,
        }
    }

    def test_update_preferences_ok(self, client: TestClient, tenant_headers: dict):
        r = client.patch("/api/v1/users/1/preferences", json=self.PREFS_PAYLOAD, headers=tenant_headers)
        assert r.status_code == 200
        prefs = r.json().get("lifestylePreferences")
        assert prefs is not None
        assert prefs["targetUniversity"] == "UNI"
        assert prefs["maxMonthlyBudget"] == 700.0

    def test_update_preferences_persists(self, client: TestClient, tenant_headers: dict):
        client.patch("/api/v1/users/1/preferences", json=self.PREFS_PAYLOAD, headers=tenant_headers)
        me = client.get("/api/v1/auth/me", headers=tenant_headers).json()
        assert me["lifestylePreferences"]["targetUniversity"] == "UNI"

    def test_update_preferences_requires_auth(self, client: TestClient):
        r = client.patch("/api/v1/users/1/preferences", json=self.PREFS_PAYLOAD)
        assert r.status_code == 401
