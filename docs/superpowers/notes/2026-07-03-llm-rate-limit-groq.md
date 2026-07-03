# NexU — Rate limit de Groq (429) en las explicaciones del matching

*(Creado: 2026-07-03 — nota de troubleshooting)*

## Síntoma

Al abrir `/matching` en el frontend, el backend loguea:

```
LLM explain falló, usando fallback: Error code: 429 - {'error': {'message':
'Rate limit reached for model `llama-3.1-8b-instant` ... service tier `on_demand`
on tokens per minute (TPM): Limit 6000, Used 5914, Requested 239. Please try again
in 1.53s ...', 'code': 'rate_limit_exceeded'}}
GET /api/v1/matching/roommates HTTP/1.1 200 OK
```

**Importante:** el matching **NO se cae** — `ai_explainer.explain()` captura el error y
degrada a la explicación por plantilla (las `reasons` unidas). El endpoint responde `200`.
El único efecto es que **pierdes la explicación narrativa del LLM** en las tarjetas afectadas;
en su lugar se ve el texto de plantilla (razones separadas por `·`).

## Causa raíz

El límite del **free tier** de Groq para `llama-3.1-8b-instant` es **6000 tokens por minuto (TPM)**.

El problema es el **volumen de llamadas por carga de página**:

- `MatchingPage.tsx` llama a **ambos** endpoints a la vez (`Promise.all`):
  `GET /matching/properties` **y** `GET /matching/roommates`.
- `MatchingService.rank_properties()` llama `explain()` **una vez por cada propiedad activa** (~8).
- `MatchingService.rank_roommates()` llama `explain()` **una vez por cada roommate** (~14).
- Total: **~22 llamadas al LLM casi simultáneas** por cada carga de `/matching`.
- Cada llamada consume ~200–260 tokens (system prompt + contexto + hasta `max_tokens=120` de salida).
- 22 × ~260 ≈ **~5.700 tokens en una ráfaga** → supera los 6000 TPM y empiezan los `429`.

Archivos involucrados:
- `backend/app/services/ai_explainer.py` — hace la llamada al LLM (con fallback).
- `backend/app/services/matching.py` — llama `explain()` en el loop de `rank_properties` / `rank_roommates`.
- `frontend/src/features/matching/MatchingPage.tsx` — dispara ambos endpoints al montar.

## Cómo diagnosticar / confirmar

1. El mensaje dice `tokens per minute (TPM): Limit 6000` → es límite de **tokens/min**, no de requests.
2. Monitorea el uso real en la consola de Groq: <https://console.groq.com> (Usage / Limits).
3. Si al recargar `/matching` una sola vez ya salen varios `429`, confirma que es la ráfaga de ~22 llamadas.

## Soluciones (ordenadas por impacto / esfuerzo)

### 1. Cachear las explicaciones (MAYOR impacto, bajo esfuerzo) ✅ recomendado
El scoring es **determinista**: el mismo estudiante + misma propiedad → mismas `reasons` → misma
explicación. Cachear evita re-llamar al LLM en cada carga.

En `ai_explainer.py`, cachear por (contexto, razones):

```python
from functools import lru_cache

@lru_cache(maxsize=512)
def _explain_cached(context: str, reasons_key: str) -> str:
    # reasons_key = "|".join(reasons)  -> hashable
    ...  # la llamada real al LLM

def explain(context: str, reasons: list[str]) -> str:
    if not settings.llm_enabled:
        return _fallback(reasons)
    return _explain_cached(context, "|".join(reasons))
```

Tras la primera carga, las siguientes NO consumen tokens. Reduce el problema drásticamente.

### 2. Generar explicación solo para el Top-N (alto impacto, bajo esfuerzo)
No hace falta explicación IA para las 22 tarjetas; solo para las más relevantes.
En `matching.py`, generar `explain()` únicamente para las primeras N (p. ej. 3–5) tras ordenar por
score, y usar la plantilla (`" · ".join(reasons)`) para el resto:

```python
matches.sort(key=lambda m: m.score, reverse=True)
for i, m in enumerate(matches):
    m.explanation = explain(...) if i < 5 else _fallback(m.reasons)
```

Baja de ~22 a ~10 llamadas por carga (5 por endpoint).

### 3. Explicación bajo demanda (mejor arquitectura, esfuerzo medio)
No generar ninguna explicación en el listado. Añadir un endpoint
`POST /matching/explain` que reciba `{context, reasons}` y devuelva el texto; el frontend lo pide
**solo cuando el usuario expande/hover una tarjeta**. Así se llama al LLM 1 vez, no 22.

### 4. Reintento con backoff respetando `Retry-After` (complementario)
El error 429 indica “try again in 1.53s”. En `ai_explainer.explain()`, reintentar 1–2 veces con
una espera corta antes de caer al fallback. Nota: bajo ráfaga sostenida esto solo retrasa; combinar
con #1 o #2. La librería `openai` acepta `max_retries` en el cliente:

```python
OpenAI(api_key=..., base_url=..., max_retries=2)
```

### 5. Reducir tokens por llamada (menor, complementario)
- Bajar `max_tokens` (hoy 120) a ~80.
- Acortar el system prompt (`_SYSTEM`).
Reduce el consumo por llamada, pero no elimina el problema si hay 22 llamadas.

### 6. Throttling / rate limiter propio (esfuerzo medio-alto)
Serializar las llamadas con un token-bucket para no pasar de 6000 TPM. Más complejo; normalmente
innecesario si se aplica #1 + #2.

### 7. Cambiar de modelo o de tier (según necesidad)
- Probar otro modelo de Groq con mayor TPM en free tier (revisar límites por modelo en la consola).
  Se cambia sin tocar código: variable `LLM_MODEL` en `backend/.env`.
- Subir a **Dev Tier** (de pago) para límites mayores: <https://console.groq.com/settings/billing>.

### 8. Precomputar (opcional, dado que la data es mock)
Como los datos son mock y el scoring es determinista, se podrían generar las explicaciones una sola
vez (warmup) y guardarlas. Es esencialmente #1 (cache) con precarga.

## Recomendación práctica

Aplicar **#1 (cache) + #2 (Top-N)** cubre el 90% del problema con poco código y sin costo:
- La primera carga hace pocas llamadas (Top-N por endpoint) en vez de 22.
- Las recargas siguientes salen del cache → 0 tokens.

Si se quiere la mejor UX/arquitectura, migrar luego a **#3 (bajo demanda)**.

## Mientras tanto

No es urgente: el fallback ya mantiene el matching funcionando (score, razones, radar y contacto
siguen intactos). Solo la explicación narrativa cae a plantilla cuando se agota el TPM.
