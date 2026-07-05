"""
Explicación narrativa de un match mediante un LLM (Groq, API compatible con
OpenAI). Aislado tras esta función: si el LLM está deshabilitado o falla,
degrada a las razones deterministas unidas. El matching nunca se cae por aquí.
"""
from __future__ import annotations
import logging
from functools import lru_cache
from app.config import settings

logger = logging.getLogger(__name__)

# Dominios de matching; cada uno usa su propia API key del LLM (ver Settings).
ROOMMATE = "roommate"
ROOM = "room"

_SYSTEM = (
    "Eres el asistente de NexU, una plataforma de alojamiento universitario en "
    "Lima. Explica en 1-2 frases, en español neutro y tono cercano, por qué el "
    "match es bueno. Usa solo las razones dadas; no inventes datos."
)


@lru_cache(maxsize=2)
def _client(api_key: str):
    from openai import OpenAI
    return OpenAI(api_key=api_key, base_url=settings.llm_base_url)


def _fallback(reasons: list[str]) -> str:
    if not reasons:
        return "Compatibilidad calculada según tu perfil de convivencia."
    return " · ".join(reasons)


def explain(context: str, reasons: list[str], *, domain: str = ROOMMATE) -> str:
    api_key = settings.llm_api_key_for(domain)
    if not api_key:
        return _fallback(reasons)
    try:
        prompt = (
            f"Contexto: {context}. Razones de compatibilidad: "
            f"{', '.join(reasons) if reasons else 'ninguna destacada'}."
        )
        resp = _client(api_key).chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": _SYSTEM},
                {"role": "user", "content": prompt},
            ],
            max_tokens=120,
            temperature=0.4,
        )
        text = (resp.choices[0].message.content or "").strip()
        return text or _fallback(reasons)
    except Exception as exc:  # noqa: BLE001 — degradar ante cualquier fallo del LLM
        logger.warning("LLM explain falló, usando fallback: %s", exc)
        return _fallback(reasons)
