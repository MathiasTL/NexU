"""
Tests de amenidades: endpoint público sin autenticación.
"""
from __future__ import annotations
from fastapi.testclient import TestClient


class TestAmenities:
    def test_get_amenities_ok(self, client: TestClient):
        r = client.get("/api/v1/amenities")
        assert r.status_code == 200

    def test_get_amenities_returns_8_categories(self, client: TestClient):
        categories = client.get("/api/v1/amenities").json()
        assert len(categories) == 8

    def test_categories_required_fields(self, client: TestClient):
        cat = client.get("/api/v1/amenities").json()[0]
        assert "title" in cat
        assert "amenities" in cat
        assert isinstance(cat["amenities"], list)
        assert len(cat["amenities"]) > 0

    def test_amenities_items_have_id_and_name(self, client: TestClient):
        categories = client.get("/api/v1/amenities").json()
        for cat in categories:
            for amenity in cat["amenities"]:
                assert "id" in amenity, f"Amenidad sin id en categoría '{cat['title']}'"
                assert "name" in amenity, f"Amenidad sin name en categoría '{cat['title']}'"

    def test_amenities_public_no_auth_needed(self, client: TestClient):
        # No debe requerir token
        r = client.get("/api/v1/amenities")
        assert r.status_code == 200

    def test_amenities_no_duplicates(self, client: TestClient):
        categories = client.get("/api/v1/amenities").json()
        all_ids = [a["id"] for cat in categories for a in cat["amenities"]]
        assert len(all_ids) == len(set(all_ids)), "Hay IDs de amenidades duplicados"
