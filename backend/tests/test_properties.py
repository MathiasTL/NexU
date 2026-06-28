"""
Tests de propiedades: listado, detalle, búsqueda con filtros y creación.
Verifica campos calculados (rating, reviewsCount) y aislamiento de acceso.
"""
from __future__ import annotations
from fastapi.testclient import TestClient
from tests.conftest import NEW_PROPERTY_PAYLOAD


# ── LISTADO ───────────────────────────────────────────────────────────────────

class TestListProperties:
    def test_list_all_returns_200(self, client: TestClient):
        r = client.get("/api/v1/properties")
        assert r.status_code == 200

    def test_list_returns_8_active(self, client: TestClient):
        r = client.get("/api/v1/properties")
        assert len(r.json()) == 8  # mock data inicial

    def test_list_rating_is_computed(self, client: TestClient):
        r = client.get("/api/v1/properties")
        props = r.json()
        assert all("rating" in p for p in props)
        assert all("reviewsCount" in p for p in props)

    def test_list_no_password_exposed(self, client: TestClient):
        r = client.get("/api/v1/properties")
        for p in r.json():
            assert "password" not in p
            assert "hashedPassword" not in p

    def test_list_required_fields_present(self, client: TestClient):
        prop = client.get("/api/v1/properties").json()[0]
        for field in ("id", "hostId", "title", "roomType", "pricePerMonth",
                      "district", "nearestUniversity", "availabilityStatus"):
            assert field in prop, f"Campo faltante: {field}"


# ── DETALLE ───────────────────────────────────────────────────────────────────

class TestPropertyDetail:
    def test_get_property_1_ok(self, client: TestClient):
        r = client.get("/api/v1/properties/1")
        assert r.status_code == 200
        p = r.json()
        assert p["id"] == 1

    def test_property_1_rating_computed_correctly(self, client: TestClient):
        p = client.get("/api/v1/properties/1").json()
        # 2 reseñas: rating 5 + 4 → promedio 4.5
        assert p["rating"] == 4.5
        assert p["reviewsCount"] == 2

    def test_property_2_single_review(self, client: TestClient):
        p = client.get("/api/v1/properties/2").json()
        assert p["reviewsCount"] == 1
        assert p["rating"] == 5.0

    def test_property_no_reviews_rating_zero(self, client: TestClient):
        p = client.get("/api/v1/properties/3").json()
        assert p["rating"] == 0.0
        assert p["reviewsCount"] == 0

    def test_property_not_found(self, client: TestClient):
        r = client.get("/api/v1/properties/9999")
        assert r.status_code == 404


# ── BÚSQUEDA ──────────────────────────────────────────────────────────────────

class TestPropertySearch:
    def test_search_by_room_type(self, client: TestClient):
        r = client.get("/api/v1/properties/search?roomType=room")
        assert r.status_code == 200
        results = r.json()
        assert len(results) >= 1
        assert all(p["roomType"] == "room" for p in results)

    def test_search_by_studio(self, client: TestClient):
        r = client.get("/api/v1/properties/search?roomType=studio")
        results = r.json()
        assert all(p["roomType"] == "studio" for p in results)

    def test_search_by_nearest_university(self, client: TestClient):
        r = client.get("/api/v1/properties/search?nearestUniversity=PUCP")
        results = r.json()
        assert len(results) >= 1
        assert all(p["nearestUniversity"] == "PUCP" for p in results)

    def test_search_max_price(self, client: TestClient):
        r = client.get("/api/v1/properties/search?maxPricePerMonth=600")
        results = r.json()
        assert len(results) >= 1
        assert all(p["pricePerMonth"] <= 600 for p in results)

    def test_search_min_price(self, client: TestClient):
        r = client.get("/api/v1/properties/search?minPricePerMonth=700")
        results = r.json()
        assert all(p["pricePerMonth"] >= 700 for p in results)

    def test_search_price_range(self, client: TestClient):
        r = client.get("/api/v1/properties/search?minPricePerMonth=400&maxPricePerMonth=700")
        results = r.json()
        assert all(400 <= p["pricePerMonth"] <= 700 for p in results)

    def test_search_by_district(self, client: TestClient):
        r = client.get("/api/v1/properties/search?district=Miraflores")
        results = r.json()
        assert len(results) >= 1
        assert all("miraflores" in p["district"].lower() for p in results)

    def test_search_text_query(self, client: TestClient):
        r = client.get("/api/v1/properties/search?query=PUCP")
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_search_combined_filters(self, client: TestClient):
        r = client.get("/api/v1/properties/search?roomType=room&maxPricePerMonth=700")
        results = r.json()
        assert all(p["roomType"] == "room" for p in results)
        assert all(p["pricePerMonth"] <= 700 for p in results)

    def test_search_no_matches_returns_empty_list(self, client: TestClient):
        r = client.get("/api/v1/properties/search?maxPricePerMonth=1")
        assert r.status_code == 200
        assert r.json() == []

    def test_search_without_filters_returns_all_active(self, client: TestClient):
        r = client.get("/api/v1/properties/search")
        assert r.status_code == 200
        assert len(r.json()) == 8


# ── CREACIÓN ──────────────────────────────────────────────────────────────────

class TestCreateProperty:
    def test_create_requires_auth(self, client: TestClient):
        r = client.post("/api/v1/properties", json=NEW_PROPERTY_PAYLOAD)
        assert r.status_code == 401

    def test_create_ok_as_host(self, client: TestClient, host_headers: dict):
        r = client.post("/api/v1/properties", json=NEW_PROPERTY_PAYLOAD, headers=host_headers)
        assert r.status_code == 201
        p = r.json()
        assert p["id"] > 0
        assert p["title"] == NEW_PROPERTY_PAYLOAD["title"]
        assert p["rating"] == 0.0       # nueva propiedad, sin reseñas
        assert p["reviewsCount"] == 0
        assert p["status"] == "active"

    def test_create_assigns_host_from_token(self, client: TestClient, host_headers: dict):
        r = client.post("/api/v1/properties", json=NEW_PROPERTY_PAYLOAD, headers=host_headers)
        assert r.status_code == 201
        # host_id debe coincidir con el token (Carlos = id=2)
        assert r.json()["hostId"] == 2

    def test_create_missing_required_field(self, client: TestClient, host_headers: dict):
        payload = {**NEW_PROPERTY_PAYLOAD}
        del payload["title"]
        r = client.post("/api/v1/properties", json=payload, headers=host_headers)
        assert r.status_code == 422

    def test_created_property_appears_in_list(self, client: TestClient, host_headers: dict):
        r = client.post("/api/v1/properties", json={**NEW_PROPERTY_PAYLOAD, "title": "Prop única test lista"},
                        headers=host_headers)
        new_id = r.json()["id"]
        all_props = client.get("/api/v1/properties").json()
        ids = [p["id"] for p in all_props]
        assert new_id in ids


# ── PROPIEDADES POR HOST ───────────────────────────────────────────────────────

class TestHostProperties:
    def test_host_properties_ok(self, client: TestClient):
        r = client.get("/api/v1/users/2/properties")
        assert r.status_code == 200
        props = r.json()
        assert len(props) >= 8
        assert all(p["hostId"] == 2 for p in props)

    def test_host_with_no_properties(self, client: TestClient):
        r = client.get("/api/v1/users/1/properties")   # Ana es tenant, no tiene props
        assert r.status_code == 200
        assert r.json() == []
