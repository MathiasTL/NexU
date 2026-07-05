"""
Fixtures compartidos para toda la suite de tests.

El cliente HTTP se crea una sola vez por sesión para que los tests de mutación
(crear booking, actualizar perfil…) puedan encadenarse sin reiniciar la app.
Los tests que crean datos usan valores únicos o verifican con `>=` para no
depender del orden de ejecución.
"""
from __future__ import annotations
import time
import pytest
from fastapi.testclient import TestClient
from app.main import app


# ── Aislamiento del LLM ──────────────────────────────────────────────────────

@pytest.fixture(autouse=True)
def _disable_llm_in_tests(monkeypatch):
    """
    Los tests nunca deben llamar al LLM real (sería lento, con costo y no
    determinista). Se fuerza el fallback por plantilla en ambos dominios
    (roommates y habitaciones) aunque existan keys en el entorno o en
    backend/.env. Los tests de ai_explainer que ejercen la ruta del LLM la
    habilitan localmente con su propio patch (cliente mockeado), así que este
    fixture no los afecta.
    """
    from app.services import ai_explainer
    monkeypatch.setattr(ai_explainer.settings, "llm_api_key_roommates", "")
    monkeypatch.setattr(ai_explainer.settings, "llm_api_key_rooms", "")


# ── Cliente HTTP ─────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def client():
    """TestClient con lifespan activo (carga los repos en memoria)."""
    with TestClient(app) as c:
        yield c


# ── Tokens de autenticación ──────────────────────────────────────────────────

@pytest.fixture(scope="session")
def tenant_token(client: TestClient) -> str:
    r = client.post("/api/v1/auth/login", json={"email": "ana.garcia@pucp.pe", "password": "password123"})
    assert r.status_code == 200, r.text
    return r.json()["accessToken"]


@pytest.fixture(scope="session")
def host_token(client: TestClient) -> str:
    r = client.post("/api/v1/auth/login", json={"email": "carlos.mendoza@gmail.com", "password": "password123"})
    assert r.status_code == 200, r.text
    return r.json()["accessToken"]


@pytest.fixture(scope="session")
def tenant_headers(tenant_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {tenant_token}"}


@pytest.fixture(scope="session")
def host_headers(host_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {host_token}"}


# ── Helpers reutilizables ────────────────────────────────────────────────────

def unique_email() -> str:
    return f"test.{int(time.time() * 1000)}@nexu.pe"


NEW_PROPERTY_PAYLOAD = {
    "title": "Test Habitación Cerca de PUCP",
    "description": "Habitación de prueba para test suite. Amplia con buena iluminación.",
    "shortDescription": "Habitación test en San Miguel",
    "roomType": "room",
    "pricePerMonth": 480.0,
    "location": "Av. La Marina 1500",
    "district": "San Miguel",
    "lat": -12.0771,
    "lng": -77.0842,
    "capacity": 1,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "nearestUniversity": "PUCP",
    "distanceToUniversityMinutes": 8,
    "amenities": ["WIFI", "WORKSPACE"],
}

NEW_BOOKING_PAYLOAD = {
    "propertyId": 3,
    "tenantId": 1,
    "hostId": 2,
    "startMonth": "2026-10",
    "durationMonths": 4,
    "residentCount": 1,
    "pricePerMonth": 450.0,
    "serviceFee": 252.0,
    "totalAmount": 2052.0,
    "currency": "PEN",
    "guestMessage": "Hola, estoy interesado en la habitación para el ciclo 2026-2.",
}
