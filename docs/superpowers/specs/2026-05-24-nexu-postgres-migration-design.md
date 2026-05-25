# NexU — Migración de Oracle a Supabase (Postgres) + División en módulos

**Fecha:** 2026-05-24
**Autor:** Mathias Torres
**Estado:** Spec aprobada — pendiente de plan de implementación

---

## 1. Contexto y objetivo

NexU es un fork del proyecto Smart (Next.js 15 + Oracle DB) cuyo propósito es ayudar a estudiantes universitarios a encontrar habitaciones cerca de sus universidades. Esta spec define la migración completa de la capa de datos de **Oracle a Supabase Postgres**, el refactor de la lógica de negocio (hoy embebida en packages PL/SQL y triggers) a TypeScript, y la **división del trabajo en 6 módulos paralelos** para un equipo de 6 personas.

### Estado actual del proyecto

- **Stack:** Next.js 15.5.9 (App Router), React 19, TypeScript, NextAuth, `oracledb` 6.10.
- **Base de datos:** Oracle en `34.56.183.89:1521/XEPDB1` (instancia "SMART").
- **Lógica de negocio:** 8 packages PL/SQL + 5 triggers + 2 vistas (~3.148 líneas SQL).
- **Capa de datos TS:** `src/lib/database.ts` (pool oracledb) + 10 services en `src/services/` + ~30 endpoints en `src/app/api/`.
- **Storage actual:** `@google-cloud/storage` para imágenes de propiedades.

### Diagnóstico (cruce dump SQL vs código)

Tablas del dump efectivamente usadas por el código TS: `USERS`, `USER_AUTH_IDENTITIES`, `TENANTS`, `HOSTS`, `PROPERTIES`, `PROPERTY_DETAILS`, `PROPERTY_IMAGES`, `AVAILABILITIES`, `BOOKINGS`, `REVIEWS`, `CONVERSATIONS`, `CONVERSATION_PARTICIPANTS`, `MESSAGES`, `AMENITIES`, `AMENITIES_CATEGORIES`, `PREFERENCES`, `PAYMENTS`. Los 8 packages PL/SQL y las 2 vistas se invocan desde el código.

Tablas del dump **no usadas** por el código (sólo referenciadas por FK o triggers): `PAYMENT_TYPES`, `USER_PAYMENT_METHODS`, `PAYMENT_DETAILS`, `FX_RATE_QUOTES`, `AUDIT_LOGS`, `TENANT_PREFERENCES` (sólo SP), `PROPERTY_AMENITIES` (sólo SP), `CURRENCIES` (sólo FK).

**Brecha crítica para NexU:** el dump no contiene ninguna entidad `UNIVERSITIES`. Esta es la funcionalidad nueva núcleo del fork.

---

## 2. Decisiones técnicas

| Decisión | Elección | Razón |
|---|---|---|
| Base de datos | Supabase Postgres + extensión PostGIS | Hosting gratis, PostGIS nativo, integra con Storage/Auth |
| ORM | Prisma (`prisma migrate dev`) | Schema-as-code, tipos auto, migraciones declarativas. PostGIS vía `$queryRaw` |
| Auth | NextAuth (sin cambios) | Cambio mínimo, sigue con Google OAuth + credentials |
| Storage | Supabase Storage | Reemplaza `@google-cloud/storage` |
| Lógica de negocio | 100% en TS/services | Reemplaza packages PL/SQL y triggers; testeable y visible |
| Geo search | PostGIS `geography(Point,4326)` + índices GIST | Estándar para "cerca de" |
| Datos legacy | **Base vacía** + seeds | No nos conectamos a Oracle; arrancamos limpio |
| IDs | `bigserial` autoincrement | Equivalente a `NUMBER ... generated as identity` |
| Validación | Zod en bordes de service | Antes de tocar DB |
| Tablas eliminadas | `payment_types`, `user_payment_methods`, `payment_details`, `fx_rate_quotes`, `audit_logs` | YAGNI para MVP NexU |

**Dependencias a agregar:** `prisma`, `@prisma/client`, `@supabase/supabase-js`, `zod` (ya presente).
**Dependencias a quitar:** `oracledb`, `@types/oracledb`, `@google-cloud/storage`.

---

## 3. Esquema Postgres

### 3.1 Tablas migradas (renombradas a snake_case)

| Oracle | Postgres | Cambios |
|---|---|---|
| USERS | `users` | `user_id bigserial pk`, `created_at timestamptz`, columna nueva `image_url text` |
| USER_AUTH_IDENTITIES | `user_auth_identities` | igual; índice único `(provider, provider_user_id)` |
| TENANTS | `tenants` | igual; columna nueva `university_id bigint NULL references universities` |
| HOSTS | `hosts` | igual |
| PREFERENCES | `preferences` | igual |
| TENANT_PREFERENCES | `tenant_preferences` | igual; pk compuesta `(tenant_id, preference_id)` |
| PROPERTIES | `properties` | columna calculada `location geography(Point,4326) generated always as (ST_MakePoint(longitude, latitude)::geography) stored` + índice GIST |
| PROPERTY_DETAILS | `property_details` | igual; `CLOB → text` |
| PROPERTY_IMAGES | `property_images` | `url` apunta a Supabase Storage |
| AMENITIES, AMENITIES_CATEGORIES, PROPERTY_AMENITIES | igual | tal cual |
| AVAILABILITIES | `availabilities` | `EXCLUDE USING gist (property_id WITH =, daterange(start_date, end_date) WITH &&)` |
| BOOKINGS | `bookings` | `status` como ENUM Postgres (`booking_status`), mismo `EXCLUDE` por property+fechas para estados activos |
| REVIEWS | `reviews` | igual; **sin triggers** |
| CONVERSATIONS, CONVERSATION_PARTICIPANTS, MESSAGES | igual | `content text` (sin CLOB) |
| CURRENCIES | `currencies` | igual (catálogo) |
| PAYMENTS | `payments` | versión mínima, sin `payment_details`/`methods`/`fx` |

### 3.2 Tabla nueva: `universities`

```
university_id bigserial primary key
name          varchar(200) not null
short_name    varchar(50)
city          varchar(120) not null
country       varchar(120) not null
latitude      numeric(9,6) not null
longitude     numeric(9,6) not null
location      geography(Point, 4326) generated always as (...) stored
created_at    timestamptz default now()

índice: GIST (location)
```

Cardinalidad: `tenants.university_id → universities.university_id` (opcional, 1 universidad principal por estudiante). Las propiedades **no** se ligan a una universidad: el match es por distancia geográfica al buscar.

### 3.3 Vistas / lógica reemplazada

| Antes (Oracle) | Después (Postgres + TS) |
|---|---|
| `V_HOST_REVIEW_STATS` | función en `review.service.ts` (agregación con Prisma) |
| `V_HOST_REVIEWS_DETAIL` | query Prisma con `include` |
| `TRG_AUTO_CREATE_TENANT` | `auth.service.createUser` lo crea en la misma transacción (`prisma.$transaction`) |
| `TRG_BOOKING_COMPLETED_REVIEWS` | `booking.service.markCompleted` crea los placeholders de reviews |
| `TRG_UPDATE_TENANT_STATS`, `TRG_UPDATE_PROPERTY_STATS` | `review.service.publishReview` recalcula `average_rating` y `reviews_count` |
| `TRG_AUDIT_BOOKINGS` | **eliminado** (sin `audit_logs` en MVP) |
| 8 packages PL/SQL | 8 servicios TS (uno por dominio), ver §4 |

### 3.4 Mapeo de tipos

- `NUMBER` → `bigint` (PK/FK) o `numeric(12,2)` (precios)
- `NUMBER(1)` → `boolean`
- `VARCHAR2` → `varchar` o `text`
- `CLOB` → `text`
- `DATE` → `timestamptz`
- `CHAR(3)` → `char(3)` (códigos de moneda)
- `SYSDATE` → `now()`
- `NVL` → `coalesce`
- `:bindVar` → `$1, $2, ...`
- `FROM DUAL` → se elimina

---

## 4. Arquitectura de la capa de datos

### 4.1 Estructura de carpetas

```
prisma/
  schema.prisma              # fuente de verdad del esquema
  migrations/                # generadas por prisma migrate
  seed.ts                    # seeds: currencies, amenities, universities, preferences
src/
  lib/
    db.ts                    # PrismaClient singleton (reemplaza database.ts)
    supabase.ts              # cliente Supabase (storage)
    postgis.ts               # helpers raw SQL geoespaciales
  services/
    auth.service.ts          # ex AUTH_PKG
    user.service.ts          # ex USER_PKG
    property.service.ts      # ex PROPERTY_PKG
    property-filter.service.ts # ex FILTER_PKG (PostGIS)
    booking.service.ts       # ex BOOKING_PKG
    availability.service.ts  # ex CALENDAR_AVAILABILITY_PKG
    review.service.ts        # ex REVIEW_PKG
    host-dashboard.service.ts # ex HOST_DASHBOARD_PKG
    university.service.ts    # NUEVO
    conversation.service.ts  # NUEVO (no había package)
  app/api/...                # rutas existentes, queries reescritas
  types/dtos/...             # un archivo de DTOs por módulo
```

### 4.2 Patrón de servicio

- Cada servicio exporta funciones `async function nombreAccion(input): Promise<output>`.
- Validación Zod en el borde (antes de tocar DB).
- Prisma para CRUD normal; `prisma.$queryRaw` sólo para PostGIS y queries complejas (agregaciones de stats).
- Stats que antes hacían los triggers se recalculan dentro de `prisma.$transaction` en el service que modifica la entidad.

### 4.3 Búsqueda geoespacial (ejemplo)

```sql
SELECT p.*, ST_Distance(p.location, u.location) AS distance_m
FROM properties p, universities u
WHERE u.university_id = $1
  AND ST_DWithin(p.location, u.location, $2)  -- radio en metros
ORDER BY distance_m
LIMIT 20;
```

### 4.4 Auth (NextAuth se conserva)

- Callback `jwt()` invoca `auth.service.findOrCreateUserOAuth(...)` (equivalente TS de `AUTH_PKG.SP_FIND_OR_CREATE_USER_OAUTH`).
- `signIn()` con credentials → `auth.service.loginWithCredentials(email, password)` validando con `bcryptjs` (ya en el proyecto).
- Creación de usuario crea su `tenant` en la misma transacción (reemplaza `TRG_AUTO_CREATE_TENANT`).

### 4.5 Variables de entorno

**Se quitan:** `DB_HOST`, `DB_PORT`, `DB_SID`, `DB_USERNAME`, `DB_PASSWORD`, `DB_USER_PACKAGE`.

**Se agregan:**
- `DATABASE_URL` (Postgres pooled, para queries)
- `DIRECT_URL` (sin pool, para `prisma migrate`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (sólo server, para Storage admin)

### 4.6 Storage

- `src/lib/storage.ts` se reescribe usando `supabase.storage.from('property-images')`.
- Bucket público `property-images` para fotos.
- Bucket privado `user-avatars` si surge la necesidad.

---

## 5. División en 6 módulos para el equipo

### 5.1 Módulo 0 — Fundación (tech lead, antes de repartir)

Pre-trabajo bloqueante para los 6:
1. Crear proyecto Supabase, activar extensión PostGIS.
2. `pnpm remove oracledb @types/oracledb @google-cloud/storage` + `pnpm add prisma @prisma/client @supabase/supabase-js`.
3. Escribir `prisma/schema.prisma` completo (21 tablas finales: las 17 migradas en uso + `currencies` + `payments` mínima + `universities` nueva).
4. Primera migración + seeds (currencies, amenities, universities iniciales, preferences).
5. `src/lib/db.ts`, `src/lib/supabase.ts`, `src/lib/postgis.ts` (skeletons).
6. Borrar `src/lib/database.ts`, `test-db-connection.ts`, limpiar `pnpm-workspace.yaml`.
7. Migrar `university.service` end-to-end como referencia para el resto.

### 5.2 Los 6 módulos

| # | Módulo | Tablas | Endpoints | Servicios | Complejidad |
|---|---|---|---|---|---|
| **1** | Auth & Users | `users`, `user_auth_identities`, `tenants`, `hosts`, `preferences`, `tenant_preferences` | `/api/auth/[...nextauth]`, `/api/user/profile`, `/api/user/profile-details`, `/api/user/become-host` | `auth.service`, `user.service` | Media-alta |
| **2** | Properties & Universities | `properties`, `property_details`, `property_images`, `amenities`, `amenities_categories`, `property_amenities`, `universities` | `/api/properties/*`, `/api/properties/search`, `/api/properties/upload-photos`, `/api/locations`, `/api/host/[hostId]/properties` | `property.service`, `property-filter.service`, `university.service` | **Alta** (PostGIS, Storage) |
| **3** | Availability & Calendar | `availabilities`, `bookings` (read) | `/api/host/properties/[propertyId]/availability`, `/api/properties/[id]/availability` | `availability.service` | Media |
| **4** | Bookings & Notifications | `bookings`, `properties`/`tenants` (read), `currencies` | `/api/bookings/*` (8 endpoints), `/api/account/notifications` | `booking.service` | Alta |
| **5** | Reviews & Host Dashboard | `reviews`, `bookings` (read), `properties` (update stats) | `/api/reviews/*` (3 endpoints), `/api/host/dashboard/stats` | `review.service`, `host-dashboard.service` | Media |
| **6** | Conversations & Messaging | `conversations`, `conversation_participants`, `messages` | `/api/conversations`, `/api/conversations/[id]/messages` | `conversation.service` (nuevo) | Media-baja |

### 5.3 Dependencias entre módulos

```
Módulo 0 (fundación) → bloquea TODO
       ↓
   ┌───┴───┬───────────┐
   ↓       ↓           ↓
Módulo 1  Módulo 2  Módulo 6 (independientes en paralelo)
   ↓       ↓
   └───┬───┘
       ↓
   Módulo 3
       ↓
   Módulo 4
       ↓
   Módulo 5
```

En la práctica los 6 arrancan el mismo día programando contra **interfaces de service** (Zod schemas de input/output) que cada responsable publica al grupo en el día 1. Esto les permite paralelizar antes de que las dependencias reales estén implementadas.

### 5.4 Reglas de juego

1. **Contratos primero**: cada módulo publica las firmas de su service en el día 1 antes de implementar.
2. **PRs chicos por endpoint**, no por módulo completo. Cada PR pasa lint + typecheck.
3. **Nada de PL/pgSQL**: la decisión es lógica de negocio en TS.
4. **Cambios al schema se coordinan** con el tech lead (Módulo 0). Editar `schema.prisma` regenera cliente para todos → PR aparte y mergea solo.
5. **Convención de DTOs**: cada módulo en su propio archivo dentro de `src/types/dtos/`.

---

## 6. Criterios de éxito

- [ ] `pnpm typecheck` y `pnpm lint` pasan en `main` al finalizar cada módulo.
- [ ] Todos los endpoints del proyecto actual responden contra Supabase (verificado manualmente en dev).
- [ ] Búsqueda de propiedades por proximidad a una universidad devuelve resultados ordenados por distancia.
- [ ] Login con Google y credentials funciona end-to-end, crea tenant automáticamente.
- [ ] Crear booking → marcar como completed → publicar reseña → `average_rating` de host y propiedad actualizados.
- [ ] Subir foto de propiedad va a Supabase Storage y se ve en el frontend.
- [ ] `oracledb` y `@google-cloud/storage` desinstalados; sin referencias en código.

---

## 7. Fuera de alcance (explícito)

- Migración de datos reales desde Oracle.
- Sistema de pagos real (Stripe, Mercado Pago).
- Multi-currency y conversión FX.
- Auditoría (`audit_logs`).
- Supabase Realtime para chats (Módulo 6 puede agregarlo después).
- Supabase Auth / RLS (puede evaluarse en una fase 2).
- Tests automatizados (este spec sólo cubre la migración; tests son un esfuerzo aparte).
