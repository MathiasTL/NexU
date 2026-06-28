"""
Tests de autenticación: login, register, refresh token, /me.
Cubre camino feliz, credenciales inválidas, validación y duplicados.
"""
from __future__ import annotations
import time
from fastapi.testclient import TestClient


# ── LOGIN ─────────────────────────────────────────────────────────────────────

class TestLogin:
    def test_login_tenant_ok(self, client: TestClient):
        r = client.post("/api/v1/auth/login", json={"email": "ana.garcia@pucp.pe", "password": "password123"})
        assert r.status_code == 200
        data = r.json()
        assert "accessToken" in data
        assert "refreshToken" in data
        assert data["user"]["role"] == "tenant"
        assert data["user"]["email"] == "ana.garcia@pucp.pe"
        assert "hashedPassword" not in data["user"]   # nunca debe exponerse

    def test_login_host_ok(self, client: TestClient):
        r = client.post("/api/v1/auth/login", json={"email": "carlos.mendoza@gmail.com", "password": "password123"})
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "host"

    def test_login_wrong_password(self, client: TestClient):
        r = client.post("/api/v1/auth/login", json={"email": "ana.garcia@pucp.pe", "password": "wrong"})
        assert r.status_code == 401

    def test_login_unknown_email(self, client: TestClient):
        r = client.post("/api/v1/auth/login", json={"email": "noexiste@nexu.pe", "password": "password123"})
        assert r.status_code == 401

    def test_login_missing_password(self, client: TestClient):
        r = client.post("/api/v1/auth/login", json={"email": "ana.garcia@pucp.pe"})
        assert r.status_code == 422

    def test_login_invalid_email_format(self, client: TestClient):
        r = client.post("/api/v1/auth/login", json={"email": "no-es-email", "password": "pass"})
        assert r.status_code == 422

    def test_login_tokens_are_strings(self, client: TestClient):
        r = client.post("/api/v1/auth/login", json={"email": "ana.garcia@pucp.pe", "password": "password123"})
        data = r.json()
        assert isinstance(data["accessToken"], str) and len(data["accessToken"]) > 20
        assert isinstance(data["refreshToken"], str) and len(data["refreshToken"]) > 20


# ── REGISTER ──────────────────────────────────────────────────────────────────

class TestRegister:
    def test_register_new_tenant(self, client: TestClient):
        email = f"nuevo.tenant.{int(time.time())}@nexu.pe"
        r = client.post("/api/v1/auth/register", json={
            "firstName": "Nuevo", "lastName": "Usuario",
            "email": email, "password": "segura123", "role": "tenant",
        })
        assert r.status_code == 201
        data = r.json()
        assert "accessToken" in data
        assert "refreshToken" in data
        assert data["user"]["email"] == email
        assert data["user"]["role"] == "tenant"
        assert data["user"]["id"] > 0

    def test_register_new_host(self, client: TestClient):
        email = f"nuevo.host.{int(time.time())}@nexu.pe"
        r = client.post("/api/v1/auth/register", json={
            "firstName": "Propietario", "lastName": "Test",
            "email": email, "password": "clave456", "role": "host",
        })
        assert r.status_code == 201
        assert r.json()["user"]["role"] == "host"

    def test_register_duplicate_email(self, client: TestClient):
        email = f"dup.{int(time.time())}@nexu.pe"
        payload = {"firstName": "A", "lastName": "B", "email": email, "password": "pass", "role": "tenant"}
        client.post("/api/v1/auth/register", json=payload)   # primer registro OK
        r = client.post("/api/v1/auth/register", json=payload)  # segundo → conflicto
        assert r.status_code == 409

    def test_register_invalid_role(self, client: TestClient):
        r = client.post("/api/v1/auth/register", json={
            "firstName": "X", "lastName": "Y",
            "email": f"role.{int(time.time())}@nexu.pe", "password": "pass", "role": "admin",
        })
        assert r.status_code == 400

    def test_register_invalid_email_format(self, client: TestClient):
        r = client.post("/api/v1/auth/register", json={
            "firstName": "X", "lastName": "Y",
            "email": "no-es-email", "password": "pass", "role": "tenant",
        })
        assert r.status_code == 422

    def test_register_missing_required_fields(self, client: TestClient):
        r = client.post("/api/v1/auth/register", json={"email": "a@b.com"})
        assert r.status_code == 422

    def test_register_user_not_exposed_password(self, client: TestClient):
        email = f"nopwd.{int(time.time())}@nexu.pe"
        r = client.post("/api/v1/auth/register", json={
            "firstName": "Seg", "lastName": "Ura",
            "email": email, "password": "clave_secreta", "role": "tenant",
        })
        assert r.status_code == 201
        user = r.json()["user"]
        assert "password" not in user
        assert "hashedPassword" not in user


# ── REFRESH TOKEN ─────────────────────────────────────────────────────────────

class TestRefresh:
    def test_refresh_ok(self, client: TestClient):
        login = client.post("/api/v1/auth/login", json={"email": "ana.garcia@pucp.pe", "password": "password123"})
        refresh_token = login.json()["refreshToken"]
        r = client.post("/api/v1/auth/refresh", headers={"Authorization": f"Bearer {refresh_token}"})
        assert r.status_code == 200
        assert "accessToken" in r.json()

    def test_refresh_with_access_token_fails(self, client: TestClient):
        login = client.post("/api/v1/auth/login", json={"email": "ana.garcia@pucp.pe", "password": "password123"})
        access_token = login.json()["accessToken"]
        r = client.post("/api/v1/auth/refresh", headers={"Authorization": f"Bearer {access_token}"})
        assert r.status_code == 401

    def test_refresh_without_token(self, client: TestClient):
        r = client.post("/api/v1/auth/refresh")
        assert r.status_code == 401


# ── /ME ───────────────────────────────────────────────────────────────────────

class TestMe:
    def test_me_ok(self, client: TestClient, tenant_headers: dict):
        r = client.get("/api/v1/auth/me", headers=tenant_headers)
        assert r.status_code == 200
        user = r.json()
        assert user["email"] == "ana.garcia@pucp.pe"
        assert user["firstName"] == "Ana"
        assert "password" not in user

    def test_me_no_token(self, client: TestClient):
        r = client.get("/api/v1/auth/me")
        assert r.status_code == 401

    def test_me_invalid_token(self, client: TestClient):
        r = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer token_invalido"})
        assert r.status_code == 401
