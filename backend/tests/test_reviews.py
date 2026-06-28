"""
Tests de reseñas: obtener por propiedad y por múltiples propiedades.
Verifica el JOIN con usuario (reviewerFirstName) y que no se expone
información sensible del reviewer.
"""
from __future__ import annotations
from fastapi.testclient import TestClient


class TestReviewsByProperty:
    def test_reviews_property_1_ok(self, client: TestClient):
        r = client.get("/api/v1/properties/1/reviews")
        assert r.status_code == 200
        reviews = r.json()
        assert len(reviews) == 2

    def test_reviews_have_joined_reviewer_name(self, client: TestClient):
        r = client.get("/api/v1/properties/1/reviews")
        for rev in r.json():
            assert "reviewerFirstName" in rev
            assert "reviewerLastName" in rev
            assert isinstance(rev["reviewerFirstName"], str)
            assert len(rev["reviewerFirstName"]) > 0

    def test_reviews_have_reviewer_id_fk(self, client: TestClient):
        r = client.get("/api/v1/properties/1/reviews")
        for rev in r.json():
            assert rev["reviewerId"] > 0

    def test_reviews_no_password_exposed(self, client: TestClient):
        r = client.get("/api/v1/properties/1/reviews")
        for rev in r.json():
            assert "password" not in rev
            assert "hashedPassword" not in rev

    def test_reviews_rating_in_valid_range(self, client: TestClient):
        r = client.get("/api/v1/properties/1/reviews")
        for rev in r.json():
            assert 1 <= rev["rating"] <= 5

    def test_reviews_property_2_single(self, client: TestClient):
        r = client.get("/api/v1/properties/2/reviews")
        assert r.status_code == 200
        assert len(r.json()) == 1
        assert r.json()[0]["rating"] == 5

    def test_reviews_property_no_reviews(self, client: TestClient):
        r = client.get("/api/v1/properties/3/reviews")
        assert r.status_code == 200
        assert r.json() == []

    def test_reviews_nonexistent_property_empty(self, client: TestClient):
        r = client.get("/api/v1/properties/9999/reviews")
        assert r.status_code == 200
        assert r.json() == []

    def test_reviews_required_fields(self, client: TestClient):
        rev = client.get("/api/v1/properties/1/reviews").json()[0]
        for field in ("id", "propertyId", "reviewerId", "rating", "comment",
                      "createdAt", "reviewerFirstName", "reviewerLastName"):
            assert field in rev, f"Campo faltante: {field}"


class TestReviewsByPropertyIds:
    def test_multi_property_ok(self, client: TestClient):
        r = client.get("/api/v1/reviews?propertyIds=1,2,3")
        assert r.status_code == 200
        reviews = r.json()
        assert len(reviews) >= 3   # prop 1=2, prop 2=1, prop 3=0

    def test_multi_property_all_ids_in_set(self, client: TestClient):
        r = client.get("/api/v1/reviews?propertyIds=1,2")
        property_ids_in_response = {rev["propertyId"] for rev in r.json()}
        assert property_ids_in_response.issubset({1, 2})

    def test_single_property_via_ids_param(self, client: TestClient):
        r = client.get("/api/v1/reviews?propertyIds=1")
        assert r.status_code == 200
        assert len(r.json()) == 2

    def test_no_matching_properties_empty(self, client: TestClient):
        r = client.get("/api/v1/reviews?propertyIds=9998,9999")
        assert r.status_code == 200
        assert r.json() == []

    def test_missing_property_ids_param(self, client: TestClient):
        r = client.get("/api/v1/reviews")
        assert r.status_code == 422
