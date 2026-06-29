# NexU — Comparativa Oracle (Legacy) vs PostgreSQL (NexU v2)

*(Basado en `legacy/script_smart.sql` y `backend/docs/migracion-bd.md`)*

> Este documento mapea cada tabla del schema Oracle legacy con su equivalente en el nuevo diseño PostgreSQL, indicando qué se mantiene, qué se fusionó, qué se eliminó y qué es completamente nuevo.

---

## Resumen ejecutivo

| Categoría | Cantidad |
|---|---|
| Tablas Oracle eliminadas (ya no necesarias) | 8 |
| Tablas Oracle fusionadas en una sola tabla NexU | 5 → 2 |
| Tablas Oracle que se mantienen (renombradas/modificadas) | 9 |
| Tablas nuevas en NexU (no existen en Oracle) | 2 |
| Triggers Oracle eliminados | 5 |
| Paquetes PL/SQL Oracle eliminados | 4 |

---

## 1. Tablas eliminadas — ya no existen en NexU

Estas tablas del legacy **no tienen equivalente** en el nuevo schema PostgreSQL porque la plataforma cambió de modelo de negocio o simplificó el diseño.

### `USER_AUTH_IDENTITIES`

```sql
-- Oracle legacy
IDENTITY_ID, USER_ID, PROVIDER, PROVIDER_USER_ID, EMAIL,
EMAIL_VERIFIED, PASSWORD_HASH, LAST_LOGIN_AT, CREATED_AT
```

**Por qué se eliminó:** El legacy soportaba autenticación múltiple (credenciales + OAuth Google/GitHub). NexU v2 usa exclusivamente **JWT con email/password** (access token + refresh token). No hay OAuth social en esta versión. El `password_hash` pasa directamente a la tabla `users`.

---

### `PAYMENT_TYPES`, `USER_PAYMENT_METHODS`, `PAYMENTS`, `PAYMENT_DETAILS`

```sql
-- Oracle legacy
PAYMENT_TYPES(PAYMENT_TYPE_ID, NAME, DESCRIPTION)
USER_PAYMENT_METHODS(PAYMENT_METHOD_ID, USER_ID, PAYMENT_TYPE_ID, PROVIDER, ACCOUNT_REF, ...)
PAYMENTS(PAYMENT_ID, BOOKING_ID, PAYMENT_METHOD_ID, AMOUNT, STATUS, DIRECTION, EXTERNAL_ID, ...)
PAYMENT_DETAILS(DETAIL_ID, PAYMENT_ID, TOTAL_GROSS, HOST_PAYOUT, PLATFORM_FEE, TAX_IGV, ...)
```

**Por qué se eliminaron:** El legacy tenía un sistema de pagos completo (tarjetas, Yape, Plin, transferencias; split de plataforma, IGV, pago al host). NexU v2 **no procesa pagos reales** — los montos se calculan en el frontend como referencia pero el pago ocurre fuera de la plataforma (efectivo, transferencia directa). Cuando se integre una pasarela (Culqi, MercadoPago), estas tablas se recrearán.

---

### `CURRENCIES`, `FX_RATE_QUOTES`

```sql
-- Oracle legacy
CURRENCIES(CURRENCY_CODE CHAR(3), NAME, EXPONENT)
FX_RATE_QUOTES(FX_QUOTE_ID, BASE_CURRENCY, QUOTE_CURRENCY, RATE_DECIMAL, SOURCE, QUOTED_AT)
```

**Por qué se eliminaron:** El legacy soportaba múltiples monedas con tipos de cambio dinámicos. NexU v2 opera **solo en PEN** (soles peruanos) — el campo `currency` en `bookings` es un `CHAR(3)` con valor fijo `'PEN'`. No hay conversión de divisas.

---

### `AVAILABILITIES`

```sql
-- Oracle legacy
AVAILABILITY_ID, PROPERTY_ID, START_DATE, END_DATE,
KIND (reserved/blocked/maintenance/special/default), PRICE_PER_NIGHT
```

**Por qué se eliminó:** El legacy tenía un **calendario de disponibilidad por días** (check-in/check-out por fecha exacta). NexU v2 cambió a un **modelo de alquiler mensual** (`start_month`, `duration_months`). La disponibilidad ya no es un calendario de fechas sino un estado (`available/occupied/paused`) directamente en la propiedad. Esta es la diferencia de modelo de negocio más grande entre ambas versiones.

---

### `AUDIT_LOGS`

```sql
-- Oracle legacy (trigger TRG_AUDIT_BOOKINGS)
LOG_ID, TABLE_NAME, OPERATION, BOOKING_ID, OLD_STATUS, NEW_STATUS, CHANGED_BY, CHANGED_AT
```

**Por qué se eliminó:** NexU v2 no requiere auditoría de base de datos en esta fase. Si se necesita, se puede recuperar con PostgreSQL usando `pgaudit` o una tabla similar.

---

### `PROPERTY_DETAILS`

```sql
-- Oracle legacy (1:1 con PROPERTIES)
PROPERTY_ID, DESCRIPTION_LONG, HOUSE_RULES, CHECKIN_TIME, CHECKOUT_TIME,
CAPACITY, BEDROOMS, BATHROOMS, BEDS, AREA_M2, FLOOR_NUMBER,
MAX_ADULTS, MAX_CHILDREN, MAX_BABY, MAX_PETS
```

**Por qué se eliminó:** El legacy separó los detalles en una tabla aparte (posiblemente por el tamaño de `CLOB`). En PostgreSQL, los `TEXT` no tienen el problema de los `CLOB` de Oracle. Todos los campos de `PROPERTY_DETAILS` se **fusionaron directamente en `properties`**, con excepción de los que no aplican al modelo NexU.

**Campos fusionados en `properties`:** `description`, `capacity`, `bedrooms`, `bathrooms`, `beds`.

**Campos eliminados:** `house_rules`, `checkin_time`, `checkout_time`, `area_m2`, `floor_number`, `max_adults`, `max_children`, `max_baby`, `max_pets` — no aplican al modelo de alquiler mensual universitario de NexU.

---

## 2. Tablas fusionadas — varias Oracle → una en NexU

### `USERS` + `TENANTS` + `HOSTS` → `users`

**Oracle:** Tres tablas separadas con un patrón de herencia de tabla concreta.
- `USERS` — datos base (nombre, email, DNI, teléfono)
- `TENANTS` — extensión para inquilinos (bio, average_rating, reviews_count)
- `HOSTS` — extensión para propietarios (description, is_verified, average_rating, reviews_count)
- Un trigger `TRG_AUTO_CREATE_TENANT` creaba automáticamente la fila en `TENANTS` al hacer INSERT en `USERS`
- Un procedimiento `SP_BECOME_HOST` creaba la fila en `HOSTS` cuando el usuario quería publicar

**NexU PostgreSQL:** Una sola tabla `users` con columna `role VARCHAR(20) CHECK (role IN ('tenant', 'host'))`.

| Campo Oracle | En NexU | Nota |
|---|---|---|
| `USERS.USER_ID` | `users.id` | Renombrado |
| `USERS.FIRST_NAME` | `users.first_name` | Igual |
| `USERS.LAST_NAME` | `users.last_name` | Igual |
| `USERS.EMAIL` | `users.email` | Igual |
| `USERS.PHONE_NUMBER` | `users.phone` | Renombrado |
| `USERS.CREATED_AT` | `users.created_at` | Igual |
| `USERS.STATUS` | *(eliminado)* | NexU no bloquea usuarios por ahora |
| `USERS.DNI` | *(eliminado)* | No requerido en NexU v2 |
| `USERS.BIRTH_DATE` | *(eliminado)* | No requerido en NexU v2 |
| `USERS.BLOCKED_UNTIL` | *(eliminado)* | Sin sistema de bloqueo |
| `TENANTS.BIO` | `users.bio` | Fusionado en users |
| `TENANTS.AVERAGE_RATING` | *(eliminado)* | NexU no califica a inquilinos |
| `TENANTS.REVIEWS_COUNT` | *(eliminado)* | NexU no califica a inquilinos |
| `HOSTS.IS_VERIFIED` | `users.verified_host`→`properties.verified_host` | Movido a la propiedad |
| `HOSTS.DESCRIPTION` | `users.bio` | Fusionado |
| `HOSTS.AVERAGE_RATING` | *(calculado)* | Calculado desde reviews |
| — | `users.role` | **Nuevo** — no existía en Oracle |
| — | `users.avatar_url` | **Nuevo** — Oracle no tenía fotos de perfil |

**Razón de la fusión:** El modelo de Oracle de "user puede ser tenant y/o host" asumía que un usuario podría tener ambos roles simultáneamente. NexU simplifica: cada usuario tiene un rol fijo al registrarse. Elimina la complejidad de los triggers y los JOINs a tres tablas.

---

### `PREFERENCES` + `TENANT_PREFERENCES` → `user_preferences`

**Oracle:** Patrón EAV (Entity-Attribute-Value).
- `PREFERENCES` — catálogo de tipos de preferencia (INTERESTS, PETS, LOCATION, WORK, LANGUAGE, SCHOOL)
- `TENANT_PREFERENCES` — tabla pivote con el valor de cada preferencia por tenant

**NexU PostgreSQL:** Una sola tabla `user_preferences` con columnas fijas por cada preferencia.

| Campo Oracle (EAV) | En NexU (columna fija) |
|---|---|
| `CODE='SCHOOL'` / `VALUE_TEXT` | `user_preferences.target_university` |
| `CODE='PETS'` / `VALUE_TEXT` | `user_preferences.pets_policy` |
| `CODE='LOCATION'` / `VALUE_TEXT` | *(no directo — reemplazado por district en búsqueda)* |
| `CODE='WORK'` / `VALUE_TEXT` | *(no directo)* |
| `CODE='INTERESTS'` / `VALUE_TEXT` | *(no directo)* |
| `CODE='LANGUAGE'` / `VALUE_TEXT` | *(no directo)* |
| — | `user_preferences.sleep_schedule` | **Nuevo** |
| — | `user_preferences.study_habits` | **Nuevo** |
| — | `user_preferences.noise_level` | **Nuevo** |
| — | `user_preferences.cleanliness` | **Nuevo** |
| — | `user_preferences.guests_policy` | **Nuevo** |
| — | `user_preferences.smoking_policy` | **Nuevo** |
| — | `user_preferences.max_monthly_budget` | **Nuevo** |

**Razón del cambio:** El patrón EAV del legacy es flexible pero dificulta queries (un `JOIN` o `PIVOT` por preferencia). Las preferencias de NexU son un conjunto fijo y bien conocido, por lo que columnas fijas son más simples, más rápidas y más fáciles de validar con Pydantic.

---

## 3. Tablas modificadas — existen en ambos pero con cambios

### `PROPERTIES`

| Campo Oracle | Campo NexU | Estado |
|---|---|---|
| `PROPERTY_ID` | `id` | Renombrado |
| `HOST_ID` | `host_id` | Igual (FK a `users.id` en vez de `hosts.host_id`) |
| `TITLE` | `title` | Igual |
| `PROPERTY_TYPE` | `room_type` | Renombrado + valores cambiados |
| `BASE_PRICE_NIGHT` | `price_per_month` | **Modelo de precio cambiado** (noche → mes) |
| `CURRENCY_CODE` | *(eliminado)* | Solo PEN, hardcodeado en bookings |
| `ADDRESS_TEXT` | `location` | Renombrado |
| `FORMATTED_ADDRESS` | *(eliminado)* | Generado si es necesario |
| `CITY` | *(eliminado)* | Reemplazado por `district` |
| `STATE_REGION` | *(eliminado)* | Siempre Lima |
| `COUNTRY` | *(eliminado)* | Siempre Perú |
| `POSTAL_CODE` | *(eliminado)* | No usado en NexU |
| `LATITUDE` | `lat` | Renombrado |
| `LONGITUDE` | `lng` | Renombrado |
| `STATUS` | `availability_status` | Renombrado + valores: available/occupied/paused |
| `AVERAGE_RATING` | *(calculado)* | **Calculado** en tiempo real, no almacenado |
| `REVIEWS_COUNT` | *(calculado)* | **Calculado** en tiempo real, no almacenado |
| `CREATED_AT` | `created_at` | Igual |
| — | `description` | Fusionado desde `PROPERTY_DETAILS.DESCRIPTION_LONG` |
| — | `short_description` | **Nuevo** (resumen ≤120 chars para cards) |
| — | `capacity`, `bedrooms`, `beds`, `bathrooms` | Fusionado desde `PROPERTY_DETAILS` |
| — | `nearest_university` | **Nuevo** — clave de negocio NexU |
| — | `distance_to_university_minutes` | **Nuevo** |
| — | `verified_host` | **Nuevo** (antes en `HOSTS.IS_VERIFIED`) |

**Tipo de propiedad:**

| Oracle `PROPERTY_TYPE` | NexU `room_type` |
|---|---|
| No definido (libre text) | `room` / `apartment` / `shared` / `studio` |

---

### `PROPERTY_IMAGES`

Prácticamente igual. Cambios menores:

| Campo Oracle | Campo NexU | Nota |
|---|---|---|
| `IMAGE_ID` | `id` | Renombrado |
| `PROPERTY_ID` | `property_id` | Igual |
| `URL` | `url` | Igual |
| `CAPTION` | *(eliminado)* | No usado en NexU UI |
| `SORT_ORDER` | `position` | Renombrado |

---

### `AMENITIES_CATEGORIES`

| Campo Oracle | Campo NexU | Nota |
|---|---|---|
| `CATEGORY_ID` | `id` | Renombrado |
| `NAME` | `title` | Renombrado (el frontend usa "title") |
| — | `position` | **Nuevo** — orden de visualización |

---

### `AMENITIES`

| Campo Oracle | Campo NexU | Nota |
|---|---|---|
| `AMENITY_ID` (NUMBER) | `id` (VARCHAR, ej. `'WIFI'`) | **Tipo cambiado** — NexU usa el CODE como PK |
| `CODE` | *(fusionado en id)* | Eliminado como campo separado |
| `NAME` | `name` | Igual |
| `DESCRIPTION` | *(eliminado)* | No mostrado en UI |
| `DISPLAY_ORDER` | *(eliminado)* | El orden lo maneja `amenity_categories.position` |
| `AMENITY_CATEGORY_ID` | `category_id` | Renombrado |
| — | `icon` | **Nuevo** — nombre del ícono Lucide |

**Razón del cambio de PK:** En Oracle, `PROPERTY_AMENITIES` usa `AMENITY_ID NUMBER`. En NexU, `property_amenities.amenity_id VARCHAR(30)` = `'WIFI'`, `'PETS_ALLOWED'`, etc. Esto hace los filtros de búsqueda (`?amenities=WIFI,WORKSPACE`) naturales sin lookup adicional.

---

### `PROPERTY_AMENITIES`

| Campo Oracle | Campo NexU | Nota |
|---|---|---|
| `PROPERTY_ID` | `property_id` | Igual |
| `AMENITY_ID` (NUMBER) | `amenity_id` (VARCHAR) | Tipo cambiado (FK al nuevo PK de amenities) |

---

### `BOOKINGS`

Esta tabla tuvo los cambios más profundos porque el **modelo de negocio cambió de alquiler por noches a alquiler por meses**.

| Campo Oracle | Campo NexU | Nota |
|---|---|---|
| `BOOKING_ID` | `id` | Renombrado |
| `PROPERTY_ID` | `property_id` | Igual |
| `TENANT_ID` | `tenant_id` | Igual (FK a `users.id`) |
| — | `host_id` | **Nuevo** — desnormalizado para query rápida |
| `CHECKIN_DATE` (DATE) | `start_month` (CHAR 'YYYY-MM') | **Cambiado** — ya no es fecha exacta |
| `CHECKOUT_DATE` (DATE) | *(eliminado)* | Calculado: start_month + duration_months |
| `NIGHT_COUNT` | `duration_months` | **Cambiado** — unidad: meses |
| `GUEST_COUNT` | `resident_count` | Renombrado |
| `PRICE_NIGHTS` | `price_per_month` | Renombrado + unidad cambiada |
| `CLEANING_FEE` | *(eliminado)* | NexU no cobra limpieza |
| `SERVICE_FEE` | `service_fee` | Renombrado (14% NexU, vs variable Oracle) |
| `TAXES` | *(eliminado)* | Incluido implícitamente en el servicio |
| `TOTAL_AMOUNT` | `total_amount` | Igual |
| `CURRENCY_CODE` | `currency` | Renombrado (siempre `'PEN'`) |
| `STATUS` PENDING/COMPLETED/CANCELLED/ACCEPTED/DECLINED | `status` pending/confirmed/completed/cancelled | **Simplificado** — ACCEPTED→confirmed, DECLINED→cancelled, sin ACCEPTED_AT/DECLINED_AT |
| `ACCEPTED_AT`, `DECLINED_AT`, `COMPLETED_AT` | *(eliminados)* | No rastreados en NexU v2 |
| `CHECKIN_CODE` | *(eliminado)* | No hay código de check-in |
| `HOST_NOTE` | `host_note` | Igual |
| `TENANT_NOTE` | `guest_message` | Renombrado |
| `CREATED_AT` | `created_at` | Igual |

---

### `REVIEWS`

En Oracle, `REVIEWS` era bidireccional: el tenant opina sobre la propiedad (`FOR_HOST=0`) y el host opina sobre el tenant (`FOR_HOST=1`). En NexU, las reviews son **solo de propiedad** (tenant → propiedad).

| Campo Oracle | Campo NexU | Nota |
|---|---|---|
| `REVIEW_ID` | `id` | Renombrado |
| `BOOKING_ID` | `booking_id` | Igual |
| `PROPERTY_ID` | `property_id` | Igual |
| `AUTHOR_USER_ID` | `reviewer_id` | Renombrado |
| `TARGET_USER_ID` | *(eliminado)* | NexU no califica a usuarios |
| `FOR_HOST` (0/1) | *(eliminado)* | Solo existe el tipo "sobre propiedad" |
| `RATING` | `rating` | Igual |
| `COMMENTS` | `comment` | Renombrado |
| `IS_PUBLISHED`, `PUBLISHABLE_AT`, `PUBLISHED_AT` | *(eliminados)* | NexU publica reviews inmediatamente |
| `CREATED_AT` | `created_at` | Igual |

---

### `CONVERSATIONS`

| Campo Oracle | Campo NexU | Nota |
|---|---|---|
| `CONVERSATION_ID` | `id` | Renombrado |
| `PROPERTY_ID` | `property_id` | Igual |
| `BOOKING_ID` | *(eliminado)* | NexU no vincula chat a una reserva específica |
| `STATUS` (open/closed) | *(eliminado)* | NexU no cierra conversaciones |
| `CLOSED_AT` | *(eliminado)* | Idem |
| `CREATED_AT` | `created_at` | Igual |
| — | `last_message_at` | **Nuevo** — para ordenar conversaciones por actividad |

---

### `CONVERSATION_PARTICIPANTS`

| Campo Oracle | Campo NexU | Nota |
|---|---|---|
| `CONVERSATION_ID` | `conversation_id` | Igual |
| `USER_ID` | `user_id` | Igual |
| `ROLE` (VARCHAR) | *(eliminado)* | NexU no diferencia rol en el chat |
| `JOINED_AT` | *(eliminado)* | No relevante |

---

### `MESSAGES`

| Campo Oracle | Campo NexU | Nota |
|---|---|---|
| `MESSAGE_ID` | `id` | Renombrado |
| `CONVERSATION_ID` | `conversation_id` | Igual |
| `AUTHOR_USER_ID` | `sender_id` | Renombrado |
| `CONTENT` (CLOB) | `text` (TEXT) | Renombrado + tipo PostgreSQL |
| `IS_READ` (NUMBER 0/1) | *(eliminado)* | NexU no rastrea lectura por mensaje |
| `READ_AT` | *(eliminado)* | Idem |
| `SENT_AT` | `created_at` | Renombrado |

---

## 4. Tablas nuevas — solo existen en NexU

### `notifications`

No existe en Oracle. El legacy no tenía sistema de notificaciones in-app.

Soporta tipos: `new_booking`, `booking_confirmed`, `booking_cancelled`, `new_review`, `booking_completed`.

---

### `user_preferences` (forma plana)

Aunque el legacy tenía `PREFERENCES` + `TENANT_PREFERENCES` (EAV), el nuevo `user_preferences` es una tabla completamente diferente con columnas de convivencia universitaria específicas de NexU: `sleep_schedule`, `study_habits`, `noise_level`, `cleanliness`, `guests_policy`, `smoking_policy`, `pets_policy`, `target_university`, `max_monthly_budget`.

---

## 5. Lógica eliminada — Triggers y Paquetes PL/SQL

El legacy usaba triggers y stored procedures para encapsular lógica de negocio. En NexU v2, **toda la lógica vive en la capa de servicios Python** (`app/services/`).

### Triggers Oracle eliminados

| Trigger | Qué hacía | Equivalente en NexU |
|---|---|---|
| `TRG_AUTO_CREATE_TENANT` | Crea fila en `TENANTS` al insertar usuario | No necesario — un solo registro en `users` con `role` |
| `TRG_BOOKING_COMPLETED_REVIEWS` | Crea placeholders de review al completar booking | No existe en NexU — las reviews se crean voluntariamente |
| `TRG_AUDIT_BOOKINGS` | Audita INSERT/UPDATE/DELETE en BOOKINGS | No existe en NexU v2 |
| `TRG_UPDATE_TENANT_STATS` | Recalcula rating del tenant al publicar review | No existe — NexU no califica inquilinos |
| `TRG_UPDATE_PROPERTY_STATS` | Recalcula rating de la propiedad al publicar review | NexU calcula rating en tiempo real sin almacenarlo |

### Paquetes PL/SQL Oracle eliminados

| Paquete | Qué hacía | Equivalente en NexU |
|---|---|---|
| `AUTH_PKG` | Login, OAuth, registro, actualizar last_login | `app/services/auth.py` + `app/core/security.py` |
| `USER_PKG` | Perfil, roles, become host, preferencias | `app/services/user.py` |
| `PROPERTY_PKG` | CRUD propiedad, calendario, disponibilidad | `app/services/property.py` |
| `FILTER_PKG` | Búsqueda de propiedades con filtros | `app/services/property.py` → `.search()` |
| `BOOKING_PKG` | Reservas por tenant/host, detalle | `app/services/booking.py` |

### Vistas Oracle eliminadas

| Vista | Equivalente en NexU |
|---|---|
| `V_HOST_REVIEW_STATS` | `HostService.get_stats()` calcula lo mismo en Python |
| `V_HOST_REVIEWS_DETAIL` | `ReviewService.get_by_property_id()` con JOIN |

---

## 6. Tabla resumen general

| Tabla Oracle | Estado en NexU | Tabla NexU |
|---|---|---|
| `USERS` | Fusionada | `users` |
| `USER_AUTH_IDENTITIES` | **Eliminada** | — |
| `TENANTS` | Fusionada con `USERS` | `users` (campo `bio`, `role='tenant'`) |
| `HOSTS` | Fusionada con `USERS` | `users` (campo `role='host'`) |
| `PREFERENCES` | Fusionada | `user_preferences` (columnas fijas) |
| `TENANT_PREFERENCES` | Fusionada | `user_preferences` |
| `PAYMENT_TYPES` | **Eliminada** | — |
| `USER_PAYMENT_METHODS` | **Eliminada** | — |
| `CURRENCIES` | **Eliminada** | — |
| `PROPERTIES` | Modificada | `properties` |
| `PROPERTY_DETAILS` | Fusionada con `PROPERTIES` | `properties` |
| `PROPERTY_IMAGES` | Modificada | `property_images` |
| `AVAILABILITIES` | **Eliminada** | — (reemplazada por `start_month`/`duration_months`) |
| `BOOKINGS` | Modificada (profundamente) | `bookings` |
| `PAYMENTS` | **Eliminada** | — |
| `PAYMENT_DETAILS` | **Eliminada** | — |
| `REVIEWS` | Modificada | `reviews` (unidireccional) |
| `CONVERSATIONS` | Modificada | `conversations` |
| `CONVERSATION_PARTICIPANTS` | Modificada | `conversation_participants` |
| `MESSAGES` | Modificada | `messages` |
| `FX_RATE_QUOTES` | **Eliminada** | — |
| `AMENITIES_CATEGORIES` | Modificada | `amenity_categories` |
| `AMENITIES` | Modificada (PK cambiado) | `amenities` |
| `PROPERTY_AMENITIES` | Modificada | `property_amenities` |
| `AUDIT_LOGS` | **Eliminada** | — |
| — | **Nueva** | `notifications` |
| — | **Nueva** | `user_preferences` (forma plana) |
