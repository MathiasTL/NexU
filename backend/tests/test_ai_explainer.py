"""
Tests del explainer: verifica el fallback a plantilla y que se llama al LLM
cuando está habilitado. El cliente LLM se mockea — no hay red real.
"""
from __future__ import annotations
from unittest.mock import patch, MagicMock
from app.services import ai_explainer


class TestFallback:
    def test_disabled_llm_returns_reasons_joined(self):
        with patch.object(ai_explainer.settings, "llm_api_key", ""):
            out = ai_explainer.explain("una habitación", ["Cerca de PUCP", "Sin humo"])
            assert out == "Cerca de PUCP · Sin humo"

    def test_llm_error_falls_back_to_reasons(self):
        with patch.object(ai_explainer.settings, "llm_api_key", "fake-key"):
            with patch.object(ai_explainer, "_client") as mk:
                mk.return_value.chat.completions.create.side_effect = RuntimeError("boom")
                out = ai_explainer.explain("una habitación", ["Cerca de PUCP"])
                assert out == "Cerca de PUCP"


class TestLLMPath:
    def test_calls_llm_when_enabled(self):
        fake = MagicMock()
        fake.chat.completions.create.return_value.choices = [
            MagicMock(message=MagicMock(content="Esta habitación encaja contigo."))
        ]
        with patch.object(ai_explainer.settings, "llm_api_key", "fake-key"):
            with patch.object(ai_explainer, "_client", return_value=fake):
                out = ai_explainer.explain("una habitación", ["Cerca de PUCP"])
                assert out == "Esta habitación encaja contigo."
                fake.chat.completions.create.assert_called_once()
