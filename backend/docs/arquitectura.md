# NexU Backend — Arquitectura

*(Creado: 2026-06-28 — Python 3.12+, FastAPI, Pydantic v2)*

---

## 1. Visión general

El backend de NexU es una **API REST** construida con FastAPI. Su responsabilidad es servir los datos que el frontend ya validó con mocks y, cuando llegue el momento, persistirlos en PostgreSQL.

La arquitectura prioriza **separación de capas** e **intercambiabilidad**: cambiar de datos en memoria a PostgreSQL no debe tocar ninguna línea fuera de la capa de repositorio.

---

## 2. Diagrama de capas

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (Frontend)                    │
│              React + Vite · http://localhost:5173            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / JSON (camelCase)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI (ASGI / uvicorn)                 │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  CAPA 1 — API Routers  (app/api/v1/)                │   │
│  │  • Valida request con Pydantic schemas               │   │
│  │  • Serializa response a JSON camelCase               │   │
│  │  • Inyecta dependencias vía FastAPI Depends          │   │
│  │  • No contiene lógica de negocio                     │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │ llama a                               │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │  CAPA 2 — Services  (app/services/)                  │   │
│  │  • Contiene toda la lógica de negocio                │   │
│  │  • Stateless: no guarda estado entre requests        │   │
│  │  • Orquesta llamadas a uno o más repositorios        │   │
│  │  • Lanza HTTPExceptions vía app/core/exceptions.py   │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │ llama a                               │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │  CAPA 3 — Repositories  (app/repositories/)          │   │
│  │  • Interfaz abstracta (Protocol en base.py)          │   │
│  │  • Implementación actual: in-memory (memory/)        │   │
│  │  • Implementación futura: PostgreSQL (postgres/)     │   │
│  │  • Solo conoce modelos de dominio, no schemas HTTP   │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │ lee de                                │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │  DATOS — mock_data/  (actual)  /  PostgreSQL (futuro) │   │
│  │  • Datos coherentes con los mocks del frontend        │   │
│  │  • 3 usuarios · 8 propiedades · 4 bookings · 6 reviews│   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Separación models ↔ schemas

| Concepto | Ubicación | Descripción |
|---|---|---|
| **Model** | `app/models/*.py` | Entidad de dominio. Snake_case puro. No tiene concerns HTTP. `frozen=True` para inmutabilidad. |
| **Schema** | `app/schemas/*.py` | DTO HTTP. Pydantic v2 con `alias_generator=to_camel`. Lo que entra/sale de la API. |

**Por qué dos capas de tipos:**  
Si el modelo de dominio cambia (p. ej., se divide `User` en `User` + `UserProfile` para PostgreSQL), el schema puede mantenerse igual y los clientes no se enteran. Si el contrato de la API cambia, solo cambia el schema.

**Conversión automática camelCase ↔ snake_case:**  
```python
# app/schemas/common.py
class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,      # snake_case → camelCase en JSON
        populate_by_name=True,         # permite usar snake_case internamente
    )
```
Resultado: el frontend recibe `{ "hostId": 2, "pricePerMonth": 550.0 }` y el backend trabaja con `host_id` y `price_per_month` internamente.

---

## 4. Patrón de repositorio

### Por qué Protocol en lugar de ABC

Se usa `typing.Protocol` con `@runtime_checkable` en lugar de `ABC` porque:
1. No obliga a heredar — una clase PostgreSQL puede implementar el protocolo sin importar el módulo base.
2. mypy puede verificar la conformidad estáticamente.
3. Es más idiomático en Python moderno (duck typing con tipos).

### Interfaz (base.py)

```python
@runtime_checkable
class PropertyRepository(Protocol):
    def get_by_id(self, property_id: int) -> Property | None: ...
    def get_all_active(self) -> list[Property]: ...
    def search(self, district, room_type, ...) -> list[Property]: ...
    def create(self, prop: Property) -> Property: ...
    def next_id(self) -> int: ...
```

### Implementación actual (memory/)

```python
class MemoryPropertyRepository:
    def __init__(self, seed: list[Property]) -> None:
        self._store: dict[int, Property] = {p.id: p for p in seed}

    def get_by_id(self, property_id: int) -> Property | None:
        return self._store.get(property_id)
    # ...
```

### Implementación futura (postgres/)

Cuando se conecte PostgreSQL, se crea `postgres/property.py`:

```python
class PostgresPropertyRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, property_id: int) -> Property | None:
        result = await self._session.get(PropertyORM, property_id)
        return _to_domain(result) if result else None
```

El **único cambio** en `main.py` es qué clase se instancia:
```python
# Antes:
app.state.property_repo = MemoryPropertyRepository(PROPERTIES)

# Después:
app.state.property_repo = PostgresPropertyRepository(session)
```

Ningún router, servicio ni schema necesita cambiar.

---

## 5. Inyección de dependencias

FastAPI usa `Depends()` para inyectar repositorios y servicios en cada endpoint. Esto permite:
- Testear con repositorios mock sin modificar el código de producción.
- Cambiar implementaciones en un solo lugar.

```
Request
  └─▶ router endpoint
        └─▶ Depends(get_property_repo)
              └─▶ request.app.state.property_repo   ← instancia real
```

El estado de la aplicación (`app.state`) se inicializa una vez en el `lifespan` de `main.py`:

```python
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.property_repo = MemoryPropertyRepository(PROPERTIES)
    app.state.review_repo   = MemoryReviewRepository(REVIEWS)
    # ... todos los repos
    yield
```

---

## 6. Lógica de negocio en Services

Los servicios son **stateless**: reciben repositorios por constructor y no guardan estado entre requests. Esto los hace fácilmente testeables.

### PropertyService — cómputo de rating

El modelo `Property` NO tiene `rating` ni `reviews_count`. El servicio los calcula:

```python
def _enrich(prop: Property, review_repo: ReviewRepository) -> PropertyResponse:
    reviews = review_repo.get_by_property_id(prop.id)
    rating = round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else 0.0
    return PropertyResponse(
        ...
        rating=rating,
        reviews_count=len(reviews),
    )
```

**Cuando llegue PostgreSQL:** el método se puede optimizar con un JOIN o un campo calculado en la query. La interfaz del servicio no cambia.

### ReviewService — join de datos de usuario

El modelo `Review` solo guarda `reviewer_id`. El servicio lo enriquece:

```python
for r in reviews:
    user = user_repo.get_by_id(r.reviewer_id)
    result.append(ReviewResponse(
        reviewer_first_name=user.first_name,
        reviewer_last_name=user.last_name,
        reviewer_avatar=user.avatar_url,
        ...
    ))
```

---

## 7. Autenticación JWT

### Flujo

```
Login/Register
    │
    ▼
AuthService.login() / .register()
    │
    ├── access_token  (30 min)  → cliente lo envía en Authorization: Bearer <token>
    └── refresh_token (7 días)  → cliente lo usa para renovar sin re-login

Request protegido
    │
    ▼
Depends(get_current_user_id)
    │
    ├── extrae Bearer token del header
    ├── verifica firma y expiración
    └── devuelve user_id (int) al endpoint
```

### Tokens

```python
# access token: payload = { "sub": "1", "type": "access", "exp": ... }
# refresh token: payload = { "sub": "1", "type": "refresh", "exp": ... }
```

El tipo (`"access"` vs `"refresh"`) se verifica explícitamente para que un refresh token nunca pueda usarse como access token.

---

## 8. CORS

```python
CORSMiddleware(
    allow_origins=settings.cors_origins_list,   # desde .env
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
)
```

En producción, `CORS_ORIGINS` en `.env` debe listar solo los dominios del frontend desplegado.

---

## 9. Storage abstracto

La interfaz `StorageRepository` (Protocol) tiene un solo método:
```python
def upload(self, filename: str, content: bytes, content_type: str) -> str: ...
```

La implementación actual (`MemoryStorageRepository`) retorna una URL placeholder. Para producción:
- S3: `S3StorageRepository` que usa `boto3`
- GCS: `GCSStorageRepository` que usa `google-cloud-storage`

El endpoint `POST /api/v1/properties/upload-images` no cambia.

---

## 10. Migración a PostgreSQL — hoja de ruta

Cuando el proyecto esté listo para persistencia real:

1. Agregar `asyncpg`, `sqlalchemy[asyncio]`, `alembic` a `requirements.txt`.
2. Crear `app/db/` con configuración de SQLAlchemy (`engine`, `session`).
3. Crear `app/db/models/` con ORM models (diferentes a los domain models).
4. Crear `app/repositories/postgres/*.py` implementando cada Protocol.
5. En `main.py`, swapear `MemoryXxxRepository` por `PostgresXxxRepository`.
6. Ejecutar `alembic init` y generar la primera migración desde los ORM models.
7. El schema derivará de los contratos del frontend — no es un port del schema Oracle legacy.

**Campos que NO existían en Oracle y deben crearse:**
- `property.room_type`, `property.price_per_month`, `property.availability_status`
- `property.nearest_university`, `property.distance_to_university_minutes`
- `property.verified_host`
- `user.lifestyle_preferences` (JSON column o tabla separada)
- `booking.start_month`, `booking.duration_months`, `booking.resident_count`

---

## 11. Estructura de directorios

```
backend/
├── app/
│   ├── main.py            ← FastAPI app + lifespan (inicializa repos)
│   ├── config.py          ← Settings desde .env (pydantic-settings)
│   ├── core/
│   │   ├── security.py    ← JWT (create/verify) + bcrypt (hash/verify)
│   │   └── exceptions.py  ← Wrappers de HTTPException semánticos
│   ├── models/            ← Domain entities (frozen Pydantic, snake_case)
│   ├── schemas/           ← HTTP I/O (Pydantic v2, alias_generator=to_camel)
│   ├── repositories/
│   │   ├── base.py        ← Protocol interfaces (contratos de datos)
│   │   ├── memory/        ← Implementaciones en memoria (actuales)
│   │   └── postgres/      ← Placeholder para implementaciones PostgreSQL
│   ├── services/          ← Lógica de negocio (stateless, testeable)
│   └── api/
│       ├── deps.py        ← FastAPI Depends (extrae repos de app.state)
│       └── v1/            ← Routers FastAPI (versión 1 de la API)
├── mock_data/             ← Datos seed coherentes con el frontend
├── docs/                  ← Documentación arquitectónica
├── requirements.txt
├── pyproject.toml
└── .env.example
```
