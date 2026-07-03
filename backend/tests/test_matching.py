"""
Tests deterministas del motor de scoring (estudiante↔habitación y roommate).
No usan red ni el LLM: solo funciones puras de app.services.matching.
"""
from __future__ import annotations
from app.models.user import LifestylePreferences
from app.models.property import Property
from app.services.matching import score_property, score_roommate


def _prefs(**over) -> LifestylePreferences:
    base = dict(
        sleep_schedule="early", study_habits="intense", noise_level="quiet",
        cleanliness="strict", guests_policy="occasionally", smoking_policy="no",
        pets_policy="no", target_university="PUCP", max_monthly_budget=800.0,
    )
    base.update(over)
    return LifestylePreferences(**base)


def _prop(**over) -> Property:
    base = dict(
        id=1, host_id=2, title="T", description="D", short_description="S",
        room_type="room", price_per_month=550.0, price_per_night=0.0, currency="PEN",
        location="L", district="San Miguel", city="Lima", country="Perú",
        lat=-12.0, lng=-77.0, images=[], amenities=["QUIET_HOURS", "WORKSPACE"],
        capacity=1, bedrooms=1, beds=1, bathrooms=1,
        checkin_time="14:00", checkout_time="12:00",
        house_rules=["No fumar dentro del departamento"],
        status="active", availability_status="available", verified_host=True,
        nearest_university="PUCP", distance_to_university_minutes=10,
        created_at="2025-08-01",
    )
    base.update(over)
    return Property(**base)


class TestScoreProperty:
    def test_perfect_match_scores_high(self):
        r = score_property(_prefs(), _prop())
        assert r.score >= 85
        assert "Cerca de PUCP" in r.reasons

    def test_over_budget_gives_no_budget_reason(self):
        r = score_property(_prefs(max_monthly_budget=400.0), _prop(price_per_month=900.0))
        assert "Dentro de tu presupuesto" not in r.reasons

    def test_score_capped_at_100(self):
        r = score_property(_prefs(), _prop())
        assert 0 <= r.score <= 100

    def test_dimensions_present_for_radar(self):
        r = score_property(_prefs(), _prop())
        for axis in ("universidad", "presupuesto", "ruido", "estudio", "mascotas", "fumar"):
            assert axis in r.dimensions
            assert 0 <= r.dimensions[axis] <= 100


import pytest
from fastapi import HTTPException
from app.services.matching import MatchingService
from app.repositories.memory import (
    MemoryUserRepository, MemoryPropertyRepository, MemoryReviewRepository,
)
from mock_data import USERS, PROPERTIES, REVIEWS


def _service() -> MatchingService:
    return MatchingService(
        MemoryUserRepository(USERS),
        MemoryPropertyRepository(PROPERTIES),
        MemoryReviewRepository(REVIEWS),
    )


class TestMatchingService:
    def test_rank_properties_sorted_desc(self):
        matches = _service().rank_properties(user_id=1)  # Ana, PUCP
        scores = [m.score for m in matches]
        assert scores == sorted(scores, reverse=True)

    def test_rank_properties_explanation_falls_back_to_reasons(self):
        matches = _service().rank_properties(user_id=1)
        top = matches[0]
        assert top.explanation  # no vacío
        for reason in top.reasons:
            assert reason in top.explanation

    def test_user_without_preferences_conflicts(self):
        with pytest.raises(HTTPException) as exc:
            _service().rank_roommates(user_id=2)  # Carlos (host) sin preferences
        assert exc.value.status_code == 409

    def test_rank_roommates_excludes_self(self):
        matches = _service().rank_roommates(user_id=1)
        assert all(m.user.id != 1 for m in matches)


class TestScoreRoommate:
    def test_identical_profiles_score_100(self):
        p = _prefs()
        r = score_roommate(p, p)
        assert r.score == 100

    def test_opposite_profiles_score_low(self):
        a = _prefs(sleep_schedule="early", noise_level="quiet", cleanliness="strict",
                   guests_policy="never", smoking_policy="no", pets_policy="no",
                   study_habits="intense")
        b = _prefs(sleep_schedule="night", noise_level="lively", cleanliness="relaxed",
                   guests_policy="often", smoking_policy="yes", pets_policy="yes",
                   study_habits="casual")
        r = score_roommate(a, b)
        assert r.score <= 20

    def test_radar_axes_present(self):
        r = score_roommate(_prefs(), _prefs())
        for axis in ("sueño", "ruido", "limpieza", "estudio", "invitados", "fumar", "mascotas"):
            assert axis in r.dimensions


from fastapi.testclient import TestClient


class TestMatchingEndpoints:
    def test_properties_requires_auth(self, client: TestClient):
        r = client.get("/api/v1/matching/properties")
        assert r.status_code in (401, 403)

    def test_properties_ranked(self, client: TestClient, tenant_headers):
        r = client.get("/api/v1/matching/properties", headers=tenant_headers)
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1
        assert "score" in data[0] and "dimensions" in data[0] and "explanation" in data[0]

    def test_roommates_ranked(self, client: TestClient, tenant_headers):
        r = client.get("/api/v1/matching/roommates", headers=tenant_headers)
        assert r.status_code == 200
        assert all(m["user"]["id"] != 1 for m in r.json())

    def test_host_without_prefs_gets_409(self, client: TestClient, host_headers):
        r = client.get("/api/v1/matching/roommates", headers=host_headers)
        assert r.status_code == 409


class TestMockDataVolume:
    def test_enough_students_for_roommate_matching(self):
        from mock_data import USERS
        tenants_with_prefs = [
            u for u in USERS if u.role == "tenant" and u.lifestyle_preferences is not None
        ]
        assert len(tenants_with_prefs) >= 12


class TestExplainerWired:
    def test_property_match_uses_explainer(self):
        from unittest.mock import patch
        with patch("app.services.matching.explain", return_value="Texto IA de prueba") as mk:
            matches = _service().rank_properties(user_id=1)
            assert matches[0].explanation == "Texto IA de prueba"
            assert mk.called
