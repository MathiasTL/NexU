# Tests — NexU Backend

## Stack de testing

| Herramienta | Versión | Rol |
|---|---|---|
| `pytest` | ≥8.0 | Runner y framework de assertions |
| `httpx` | ≥0.27 | Cliente HTTP para `TestClient` de FastAPI |
| `fastapi.testclient.TestClient` | (incluido en FastAPI) | Simula peticiones HTTP sin levantar servidor real |

Instalar dependencias de desarrollo:

```bash
pip install -r requirements-dev.txt
```

## Ejecutar los tests

```bash
# Desde backend/ con el venv activo
pytest

# Modo verbose (ya incluido en pytest.ini)
pytest -v

# Un módulo específico
pytest tests/test_auth.py

# Una clase o test específico
pytest tests/test_properties.py::TestPropertySearch::test_search_max_price
```

## Estructura

```
backend/
  tests/
    conftest.py              # Fixtures compartidos: client, tokens, payloads
    test_auth.py             # Login, register, refresh, /me
    test_properties.py       # CRUD + búsqueda con filtros
    test_bookings.py         # CRUD + cambio de estado
    test_reviews.py          # Por propiedad y por múltiples propiedades
    test_users.py            # Perfil, info personal, preferencias
    test_host.py             # Stats del dashboard y actividad reciente
    test_notifications.py    # Listado y marcar como leída
    test_messages.py         # Conversaciones y envío de mensajes
    test_amenities.py        # Categorías públicas
  pytest.ini                 # Configuración de pytest
  requirements-dev.txt       # Dependencias de testing
```

## Fixtures (conftest.py)

| Fixture | Scope | Descripción |
|---|---|---|
| `client` | `session` | `TestClient` con lifespan activo (repos en memoria inicializados) |
| `tenant_token` | `session` | Access token de Ana García (`tenant`, `id=1`) |
| `host_token` | `session` | Access token de Carlos Mendoza (`host`, `id=2`) |
| `tenant_headers` | `session` | `{"Authorization": "Bearer <token>"}` del tenant |
| `host_headers` | `session` | `{"Authorization": "Bearer <token>"}` del host |

El scope `session` significa que el cliente se inicializa **una sola vez** para toda la ejecución, lo que permite que los tests de mutación (crear booking, actualizar perfil) persistan entre tests.

## Cobertura por módulo

### Auth (26 tests)
- **Login**: credenciales correctas (tenant y host), contraseña incorrecta, email desconocido, campos faltantes, formato inválido, tokens son strings no vacíos
- **Register**: nuevo tenant, nuevo host, email duplicado → 409, rol inválido → 400, email inválido → 422, campos obligatorios, contraseña nunca expuesta en respuesta
- **Refresh**: token de refresco válido → nuevo accessToken, usar accessToken para refresh → 401, sin token → 401
- **Me**: usuario autenticado → datos correctos, sin token → 401, token inválido → 401

### Properties (28 tests)
- **Listado**: 200 OK, 8 propiedades en mock, campos `rating`/`reviewsCount` presentes, sin contraseña expuesta, campos obligatorios
- **Detalle**: propiedad 1 con rating=4.5 y reviewsCount=2 (calculado), propiedad 2 con 1 reseña, propiedad 3 sin reseñas → rating=0, 404 para ID inexistente
- **Búsqueda**: por roomType, por universidad, por precio máximo/mínimo, rango de precios, por distrito, por texto libre, filtros combinados, sin coincidencias → `[]`, sin filtros → todos activos
- **Creación**: requiere auth → 401, crea con host del token, `hostId` asignado del JWT, campo obligatorio faltante → 422, nueva propiedad aparece en listado

### Bookings (17 tests)
- **Listado**: por tenantId, por hostId, sin auth → 401, sin parámetros → 400, campos obligatorios, formato YYYY-MM del startMonth
- **Creación**: crea con status=confirmed, requiere auth → 401, con mensaje de huésped, campo faltante → 422, aparece en lista del tenant
- **Cambio de estado**: cancelar → 204, cambio persiste en lista, completar → 204, estado inválido → 400, ID inexistente → 404, sin auth → 401

### Reviews (14 tests)
- **Por propiedad**: reseñas de propiedad 1 (count=2), JOIN con nombre del reviewer, reviewerId > 0, sin contraseña expuesta, rating en rango 1-5, propiedad 2 (count=1, rating=5), propiedad 3 (sin reseñas → []), propiedad inexistente → [], campos obligatorios
- **Por múltiples IDs**: propertyIds=1,2,3 devuelve ≥3 reseñas, IDs correctos en respuesta, propertyId único, sin coincidencias → [], sin parámetro → 422

### Users (11 tests)
- **Perfil**: actualiza firstName/phone/bio, persiste en /me, requiere auth, campos faltantes → 422, sin contraseña en respuesta
- **Info personal**: actualiza email y teléfono, email inválido → 422, requiere auth
- **Preferencias**: actualiza lifestylePreferences, persiste en /me, requiere auth

### Host (12 tests)
- **Stats**: 200 OK, campos totalBookings/totalRevenue/averageRating/averageTicket, totalBookings ≥ 0, averageRating en 0-5, totalRevenue ≥ 0, requiere auth, sin hostId → 422, host sin reservas → zeros
- **Actividad**: 200 OK, lista de bookings, campos obligatorios, requiere auth, sin hostId → 422, host sin reservas → []

### Notifications (8 tests)
- **Listado**: 200 OK, al menos 1 notificación, campos obligatorios, userId correcto, requiere auth, host también puede consultar
- **Marcar leída**: 204 OK, `read=True` persiste en siguiente consulta, requiere auth, ID inexistente → 404

### Messages (11 tests)
- **Conversaciones**: 200 OK, tiene mensajes, campos obligatorios, usuario es participante, requiere auth, host también puede consultar
- **Enviar mensaje**: 201 con id/senderId/text/createdAt, aparece en conversación siguiente, actualiza lastMessageAt, requiere auth, sin texto → 422, conversación inexistente → 404

### Amenities (6 tests)
- 200 OK, 8 categorías exactas, campos title y amenities[], ítems con id y name, sin auth requerida, sin IDs duplicados

## Resultado actual

```
131 passed, 0 failed, 1 warning — 2.56s
```

El warning es un aviso cosmético de `httpx`/`starlette` sobre la futura migración a `httpx2`. No afecta el funcionamiento.

## Decisiones de diseño de los tests

**Scope session para el cliente**: El TestClient con scope `session` carga los repositorios en memoria una sola vez. Los tests que crean datos (bookings, propiedades, usuarios) modifican ese estado compartido. Los tests de conteo usan `>= N` en lugar de `== N` exacto para ser resilientes a este orden de ejecución.

**Datos únicos**: Los tests de registro usan `time.time()` para generar emails únicos y evitar conflictos entre runs o entre tests del mismo módulo.

**Verificar persistencia**: Los tests de mutación siempre hacen una segunda llamada para confirmar que el cambio persistió en el estado en memoria (ej. `test_update_profile_persists`, `test_cancel_reflects_in_list`).

**Sin mocks internos**: Se testea contra el stack real (FastAPI + servicios + repositorios en memoria), no contra mocks de los servicios. Esto garantiza que la cadena completa funciona.
