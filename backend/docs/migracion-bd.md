# NexU — Migración a PostgreSQL: Esquema de Base de Datos

*(Creado: 2026-06-29 — Documento técnico de referencia)*

> Este documento describe las tablas, columnas, tipos, restricciones e índices que se crearán al migrar de la implementación en memoria a PostgreSQL. Se deriva directamente de los modelos de dominio (`app/models/`) y los contratos de API (`app/schemas/`), **no** del schema Oracle legacy.

---

## Herramientas previstas

| Herramienta | Rol |
|---|---|
| `SQLAlchemy 2.x` (async) | ORM + query builder |
| `Alembic` | Migraciones versionadas |
| `asyncpg` | Driver PostgreSQL async |
| `pydantic-settings` | `DATABASE_URL` desde `.env` |

```bash
pip install sqlalchemy[asyncio] alembic asyncpg
```

---

## Diagrama de entidades (ERD simplificado)

```
users
 ├── properties (host_id → users.id)
 │     ├── property_images (property_id → properties.id)
 │     ├── property_amenities (property_id → properties.id)
 │     ├── bookings (property_id → properties.id)
 │     │     └── reviews (booking_id → bookings.id)
 │     └── conversations (property_id → properties.id)
 │           ├── conversation_participants (conversation_id → conversations.id)
 │           └── messages (conversation_id → conversations.id)
 ├── bookings (tenant_id → users.id)
 ├── reviews (reviewer_id → users.id)
 ├── notifications (user_id → users.id)
 ├── conversation_participants (user_id → users.id)
 ├── messages (sender_id → users.id)
 └── user_preferences (user_id → users.id)  [1:1]

amenity_categories
 └── amenities (category_id → amenity_categories.id)
      └── property_amenities (amenity_id → amenities.id)
```

---

## Tablas

### `users`

Almacena todos los usuarios de la plataforma (inquilinos y propietarios).

```sql
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    role            VARCHAR(20)  NOT NULL CHECK (role IN ('tenant', 'host')),
    avatar_url      TEXT,
    phone           VARCHAR(30),
    bio             TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role  ON users (role);
```

**Notas:**
- `role` es un `CHECK` constraint; si se agregan roles en el futuro, se puede migrar a un `ENUM` de PostgreSQL.
- `avatar_url` puede ser `NULL` hasta que el usuario suba una foto.
- `password_hash` nunca se expone en respuestas API — el schema `AuthUserResponse` no incluye este campo.

---

### `user_preferences`

Preferencias de convivencia del inquilino. Relación 1:1 con `users`.

```sql
CREATE TABLE user_preferences (
    user_id               INT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    sleep_schedule        VARCHAR(20),   -- 'early' | 'late' | 'flexible'
    study_habits          VARCHAR(20),   -- 'intense' | 'moderate' | 'casual'
    noise_level           VARCHAR(20),   -- 'quiet' | 'moderate' | 'social'
    cleanliness           VARCHAR(20),   -- 'strict' | 'moderate' | 'relaxed'
    guests_policy         VARCHAR(20),   -- 'never' | 'occasionally' | 'often'
    smoking_policy        VARCHAR(10),   -- 'no' | 'outside' | 'yes'
    pets_policy           VARCHAR(10),   -- 'no' | 'yes'
    target_university     VARCHAR(20),   -- 'PUCP' | 'UNI' | 'UPC' | ...
    max_monthly_budget    NUMERIC(10,2)
);
```

**Alternativa descartada:** columna `lifestyle_preferences JSONB` en `users`. Se descartó porque:
- Una tabla separada permite índices en columnas individuales (p. ej., filtrar inquilinos por `target_university`).
- Pydantic puede mapear directamente: `user_preferences.*` → `LifestylePreferences`.
- Es más fácil agregar columnas en migraciones futuras sin tocar `users`.

---

### `properties`

Propiedades publicadas por los hosts.

```sql
CREATE TABLE properties (
    id                              SERIAL PRIMARY KEY,
    host_id                         INT         NOT NULL REFERENCES users (id),
    title                           VARCHAR(200) NOT NULL,
    description                     TEXT         NOT NULL,
    short_description               VARCHAR(160),
    room_type                       VARCHAR(20)  NOT NULL
                                    CHECK (room_type IN ('room', 'apartment', 'shared', 'studio')),
    price_per_month                 NUMERIC(10,2) NOT NULL,
    location                        VARCHAR(300),
    district                        VARCHAR(100) NOT NULL,
    lat                             NUMERIC(10,7),
    lng                             NUMERIC(10,7),
    capacity                        SMALLINT     NOT NULL DEFAULT 1,
    bedrooms                        SMALLINT     NOT NULL DEFAULT 1,
    beds                            SMALLINT     NOT NULL DEFAULT 1,
    bathrooms                       NUMERIC(3,1) NOT NULL DEFAULT 1,
    nearest_university              VARCHAR(20),
    distance_to_university_minutes  SMALLINT,
    availability_status             VARCHAR(20)  NOT NULL DEFAULT 'available'
                                    CHECK (availability_status IN ('available', 'occupied', 'paused')),
    verified_host                   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_properties_host_id            ON properties (host_id);
CREATE INDEX idx_properties_district           ON properties (district);
CREATE INDEX idx_properties_nearest_university ON properties (nearest_university);
CREATE INDEX idx_properties_room_type          ON properties (room_type);
CREATE INDEX idx_properties_availability       ON properties (availability_status);
CREATE INDEX idx_properties_price              ON properties (price_per_month);
```

**Campos que NO existen en Oracle legacy y se crean nuevos:**
`room_type`, `price_per_month`, `short_description`, `nearest_university`, `distance_to_university_minutes`, `availability_status`, `verified_host`.

**Campos que no se almacenan en `properties` (se calculan):**
- `rating` — `AVG(reviews.rating)` agrupado por `property_id`
- `reviews_count` — `COUNT(reviews.id)` agrupado por `property_id`

Para escalar, se puede crear una vista materializada:
```sql
CREATE MATERIALIZED VIEW property_stats AS
SELECT
    property_id,
    ROUND(AVG(rating)::NUMERIC, 1) AS rating,
    COUNT(*)                        AS reviews_count
FROM reviews
GROUP BY property_id;

CREATE UNIQUE INDEX ON property_stats (property_id);
-- Refrescar con: REFRESH MATERIALIZED VIEW CONCURRENTLY property_stats;
```

---

### `property_images`

URLs de las imágenes de cada propiedad, en orden de prioridad.

```sql
CREATE TABLE property_images (
    id          SERIAL PRIMARY KEY,
    property_id INT  NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    position    SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_property_images_property ON property_images (property_id, position);
```

**Alternativa:** columna `images TEXT[]` en `properties`. Se descartó porque:
- Un array PostgreSQL no tiene orden garantizado sin posición explícita.
- Con tabla separada es fácil reordenar imágenes o eliminar una sin reescribir el array.

---

### `amenity_categories`

Grupos de amenidades (p. ej., "Destacados", "Seguridad", "Servicios").

```sql
CREATE TABLE amenity_categories (
    id    SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE,
    position SMALLINT NOT NULL DEFAULT 0
);
```

---

### `amenities`

Catálogo de amenidades disponibles.

```sql
CREATE TABLE amenities (
    id          VARCHAR(30) PRIMARY KEY,   -- 'WIFI', 'POOL', 'WORKSPACE', ...
    name        VARCHAR(100) NOT NULL,
    icon        VARCHAR(50),               -- nombre del ícono Lucide
    category_id INT NOT NULL REFERENCES amenity_categories (id)
);

CREATE INDEX idx_amenities_category ON amenities (category_id);
```

**Por qué `id` es VARCHAR:** los IDs como `WIFI`, `PETS_ALLOWED` son legibles y son los que el frontend usa en filtros (`?amenities=WIFI,WORKSPACE`). Un `SERIAL` requeriría una tabla de mapeo adicional.

---

### `property_amenities`

Relación M:N entre propiedades y amenidades.

```sql
CREATE TABLE property_amenities (
    property_id INT         NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
    amenity_id  VARCHAR(30) NOT NULL REFERENCES amenities (id),
    PRIMARY KEY (property_id, amenity_id)
);

CREATE INDEX idx_property_amenities_amenity ON property_amenities (amenity_id);
```

---

### `bookings`

Reservas de alquiler.

```sql
CREATE TABLE bookings (
    id               SERIAL PRIMARY KEY,
    property_id      INT           NOT NULL REFERENCES properties (id),
    tenant_id        INT           NOT NULL REFERENCES users (id),
    host_id          INT           NOT NULL REFERENCES users (id),
    start_month      CHAR(7)       NOT NULL,   -- formato 'YYYY-MM'
    duration_months  SMALLINT      NOT NULL CHECK (duration_months > 0),
    resident_count   SMALLINT      NOT NULL DEFAULT 1,
    price_per_month  NUMERIC(10,2) NOT NULL,
    service_fee      NUMERIC(10,2) NOT NULL,
    total_amount     NUMERIC(10,2) NOT NULL,
    currency         CHAR(3)       NOT NULL DEFAULT 'PEN',
    status           VARCHAR(20)   NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    guest_message    TEXT,
    host_note        TEXT,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_tenant_id    ON bookings (tenant_id);
CREATE INDEX idx_bookings_host_id      ON bookings (host_id);
CREATE INDEX idx_bookings_property_id  ON bookings (property_id);
CREATE INDEX idx_bookings_status       ON bookings (status);
CREATE INDEX idx_bookings_created_at   ON bookings (created_at DESC);
```

**Notas:**
- `start_month` es `CHAR(7)` (`'YYYY-MM'`) para mantener el contrato del frontend sin parsear fechas completas.
- `property_title`, `property_image`, `tenant_first_name` etc. **no se almacenan** — se calculan con JOIN al servir la respuesta.
- `host_id` está desnormalizado (podría derivarse de `properties.host_id`) para acelerar la query `WHERE host_id = ?` sin JOIN.

---

### `reviews`

Reseñas de propiedades.

```sql
CREATE TABLE reviews (
    id          SERIAL PRIMARY KEY,
    property_id INT      NOT NULL REFERENCES properties (id),
    booking_id  INT      NOT NULL UNIQUE REFERENCES bookings (id),
    reviewer_id INT      NOT NULL REFERENCES users (id),
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_property_id ON reviews (property_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews (reviewer_id);
```

**Restricción `booking_id UNIQUE`:** una reserva puede tener como máximo una reseña.

**Campos calculados en servicio (no almacenados):**
`reviewer_first_name`, `reviewer_last_name`, `reviewer_avatar` — se obtienen con `JOIN users ON reviews.reviewer_id = users.id`.

---

### `notifications`

Notificaciones de sistema para los usuarios.

```sql
CREATE TABLE notifications (
    id         SERIAL PRIMARY KEY,
    user_id    INT         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    type       VARCHAR(50) NOT NULL,   -- 'new_booking' | 'booking_confirmed' | 'new_review' | ...
    title      VARCHAR(200) NOT NULL,
    message    TEXT        NOT NULL,
    read       BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id    ON notifications (user_id);
CREATE INDEX idx_notifications_read       ON notifications (user_id, read) WHERE read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);
```

El índice parcial `WHERE read = FALSE` acelera la consulta de notificaciones no leídas, que es el caso más frecuente.

---

### `conversations`

Hilo de mensajes asociado a una propiedad.

```sql
CREATE TABLE conversations (
    id              SERIAL PRIMARY KEY,
    property_id     INT         REFERENCES properties (id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_property    ON conversations (property_id);
CREATE INDEX idx_conversations_last_msg    ON conversations (last_message_at DESC);
```

---

### `conversation_participants`

Participantes de cada conversación (M:N entre `conversations` y `users`).

```sql
CREATE TABLE conversation_participants (
    conversation_id INT NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    user_id         INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_conv_participants_user ON conversation_participants (user_id);
```

---

### `messages`

Mensajes individuales dentro de una conversación.

```sql
CREATE TABLE messages (
    id              SERIAL PRIMARY KEY,
    conversation_id INT  NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    sender_id       INT  NOT NULL REFERENCES users (id),
    text            TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at ASC);
CREATE INDEX idx_messages_sender       ON messages (sender_id);
```

---

## Resumen de tablas

| Tabla | Filas en seed | Tipo |
|---|---|---|
| `users` | 3 | Entidad principal |
| `user_preferences` | 2 (tenants) | 1:1 con users |
| `properties` | 8 | Entidad principal |
| `property_images` | ~24 (≈3 por propiedad) | 1:N con properties |
| `amenity_categories` | 8 | Catálogo |
| `amenities` | ~40 | Catálogo |
| `property_amenities` | ~40 (≈5 por propiedad) | M:N |
| `bookings` | 4 | Transaccional |
| `reviews` | 6 | Transaccional |
| `notifications` | 4 | Operacional |
| `conversations` | 2 | Operacional |
| `conversation_participants` | 4 (2 por conv.) | M:N |
| `messages` | 6 | Operacional |

---

## Plan de migración en fases

### Fase 1 — Infraestructura

1. Agregar a `requirements.txt`:
   ```
   sqlalchemy[asyncio]>=2.0
   alembic>=1.13
   asyncpg>=0.29
   ```

2. Crear `app/db/`:
   ```
   app/db/
     __init__.py
     engine.py      ← create_async_engine(settings.database_url)
     session.py     ← AsyncSessionLocal + get_db() Depends
     models/        ← ORM classes (distintos a domain models)
   ```

3. Agregar `DATABASE_URL` a `.env.example`:
   ```
   DATABASE_URL=postgresql+asyncpg://nexu:nexu@localhost:5432/nexu_db
   ```

### Fase 2 — ORM models

Crear una clase SQLAlchemy por tabla en `app/db/models/`. Ejemplo:

```python
# app/db/models/user.py
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, DateTime, func

class Base(DeclarativeBase): pass

class UserORM(Base):
    __tablename__ = "users"

    id:            Mapped[int]  = mapped_column(primary_key=True)
    email:         Mapped[str]  = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str]  = mapped_column(String(255), nullable=False)
    first_name:    Mapped[str]  = mapped_column(String(100), nullable=False)
    last_name:     Mapped[str]  = mapped_column(String(100), nullable=False)
    role:          Mapped[str]  = mapped_column(String(20),  nullable=False)
    avatar_url:    Mapped[str | None]
    phone:         Mapped[str | None] = mapped_column(String(30))
    bio:           Mapped[str | None]
    created_at:    Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
```

### Fase 3 — Repositorios PostgreSQL

Crear `app/repositories/postgres/*.py` implementando cada Protocol:

```python
# app/repositories/postgres/user.py
class PostgresUserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, user_id: int) -> User | None:
        orm = await self._session.get(UserORM, user_id)
        return _to_domain(orm) if orm else None

    async def get_by_email(self, email: str) -> User | None:
        result = await self._session.execute(
            select(UserORM).where(UserORM.email == email)
        )
        orm = result.scalar_one_or_none()
        return _to_domain(orm) if orm else None
```

### Fase 4 — Swap en main.py

```python
# main.py — reemplazar MemoryXxx por PostgresXxx
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    engine = create_async_engine(settings.database_url)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)  # solo en dev
    async with AsyncSessionLocal(engine) as session:
        app.state.user_repo     = PostgresUserRepository(session)
        app.state.property_repo = PostgresPropertyRepository(session)
        # ...
        yield
    await engine.dispose()
```

### Fase 5 — Seed data

Crear `app/db/seed.py` que inserte los mismos datos que `mock_data/` actual. Ejecutar una sola vez al arrancar la DB por primera vez:

```bash
python -m app.db.seed
```

### Fase 6 — Alembic

```bash
alembic init alembic
# editar alembic/env.py para usar AsyncEngine y apuntar a app.db.models.Base
alembic revision --autogenerate -m "initial_schema"
alembic upgrade head
```

---

## Diferencias con el schema Oracle legacy

| Entidad | Oracle legacy | NexU PostgreSQL |
|---|---|---|
| Usuarios | Tabla `USERS` sin `role`, sin `lifestyle_preferences` | Agrega `role`, tabla `user_preferences` separada |
| Propiedades | Sin `room_type`, precio por noche | `room_type`, `price_per_month`, `availability_status`, `verified_host` |
| Reservas | Modelo por noches | `start_month` (YYYY-MM), `duration_months`, `resident_count` |
| Amenidades | No existe | Tablas `amenity_categories`, `amenities`, `property_amenities` |
| Mensajería | No existe | `conversations`, `conversation_participants`, `messages` |
| Notificaciones | No existe | `notifications` |

El schema Oracle legacy **no se usa como base** para esta migración. El contrato de la API (definido en `app/schemas/`) es la fuente de verdad.
