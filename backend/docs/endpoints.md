# NexU API — Referencia de Endpoints

*(Versión: 1.0.0 — Base URL: `http://localhost:8000/api/v1`)*

> Docs interactivos disponibles en `http://localhost:8000/docs` (Swagger UI)
> y `http://localhost:8000/redoc` (ReDoc) cuando el servidor está corriendo.

---

## Convenciones

- **Auth requerida**: enviar `Authorization: Bearer <access_token>` en el header.
- **JSON**: request y response en camelCase (alias automático vía Pydantic).
- **Errores**: `{ "detail": "mensaje" }` con el HTTP status correspondiente.
- **204**: respuestas vacías — no devuelven body.

---

## Auth

### POST /auth/login

Autentica un usuario existente.

**Auth requerida:** No

**Request body:**
```json
{
  "email": "ana.garcia@pucp.pe",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "tokenType": "bearer",
  "user": {
    "id": 1,
    "email": "ana.garcia@pucp.pe",
    "firstName": "Ana",
    "lastName": "García",
    "role": "tenant",
    "avatarUrl": "https://i.pravatar.cc/150?img=47",
    "phone": "+51 987 654 321",
    "bio": "Estudiante de Ingeniería Civil en la PUCP...",
    "createdAt": "2025-03-10",
    "lifestylePreferences": {
      "sleepSchedule": "early",
      "studyHabits": "intense",
      "noiseLevel": "quiet",
      "cleanliness": "strict",
      "guestsPolicy": "occasionally",
      "smokingPolicy": "no",
      "petsPolicy": "no",
      "targetUniversity": "PUCP",
      "maxMonthlyBudget": 800.0
    }
  }
}
```

**Errores:**
- `401 Unauthorized` — email o password incorrectos.

---

### POST /auth/register

Registra un nuevo usuario.

**Auth requerida:** No

**Request body:**
```json
{
  "firstName": "María",
  "lastName": "López",
  "email": "maria.lopez@uni.pe",
  "password": "MiPassword123",
  "role": "tenant"
}
```

**Response 201:** igual a `/auth/login` pero con el nuevo usuario.

**Errores:**
- `400 Bad Request` — role inválido.
- `409 Conflict` — email ya registrado.

---

### POST /auth/refresh

Renueva el access token usando un refresh token.

**Auth requerida:** Sí (refresh token en Bearer header)

**Response 200:**
```json
{
  "accessToken": "eyJhbGci...",
  "tokenType": "bearer"
}
```

**Errores:**
- `401 Unauthorized` — refresh token inválido o expirado.

---

### GET /auth/me

Devuelve el usuario autenticado actual.

**Auth requerida:** Sí

**Response 200:** `AuthUser` (igual al campo `user` de login).

---

## Properties

### GET /properties

Devuelve todas las propiedades activas.

**Auth requerida:** No

**Response 200:** `Property[]`

```json
[
  {
    "id": 1,
    "hostId": 2,
    "title": "Habitación individual cerca de PUCP",
    "roomType": "room",
    "pricePerMonth": 550.0,
    "district": "San Miguel",
    "nearestUniversity": "PUCP",
    "distanceToUniversityMinutes": 10,
    "availabilityStatus": "available",
    "verifiedHost": true,
    "rating": 4.5,
    "reviewsCount": 2,
    ...
  }
]
```

---

### GET /properties/search

Busca propiedades con filtros.

**Auth requerida:** No

**Query params:**

| Param | Tipo | Descripción |
|---|---|---|
| `district` | string | Filtra por distrito (contains, case-insensitive) |
| `roomType` | string | `room` \| `apartment` \| `shared` \| `studio` |
| `nearestUniversity` | string | Código de universidad: `PUCP`, `UNI`, `UPC`, etc. |
| `minPricePerMonth` | float | Precio mínimo mensual en PEN |
| `maxPricePerMonth` | float | Precio máximo mensual en PEN |
| `capacity` | int | Capacidad mínima de personas |
| `amenities` | string[] | IDs de amenities requeridos (AND lógico) |
| `query` | string | Busca en title, district, university, description |
| `petsAllowed` | bool | `true` → requiere `PETS_ALLOWED` amenity |
| `quietHours` | bool | `true` → requiere `QUIET_HOURS` amenity |
| `hasWorkspace` | bool | `true` → requiere `WORKSPACE` amenity |

**Ejemplo:** `GET /properties/search?nearestUniversity=PUCP&maxPricePerMonth=700`

**Response 200:** `Property[]`

---

### GET /properties/{id}

Obtiene una propiedad por ID.

**Auth requerida:** No

**Response 200:** `Property`

**Errores:**
- `404 Not Found` — propiedad no encontrada.

---

### POST /properties

Crea una nueva propiedad.

**Auth requerida:** Sí (el `hostId` se toma del token)

**Request body:**
```json
{
  "title": "Mi habitación cerca de la UPC",
  "description": "Descripción larga...",
  "shortDescription": "Resumen corto",
  "roomType": "room",
  "pricePerMonth": 600.0,
  "location": "Av. Primavera 123",
  "district": "Santiago de Surco",
  "lat": -12.1465,
  "lng": -76.9934,
  "images": ["https://..."],
  "amenities": ["WIFI", "WORKSPACE"],
  "capacity": 1,
  "bedrooms": 1,
  "beds": 1,
  "bathrooms": 1,
  "nearestUniversity": "UPC",
  "distanceToUniversityMinutes": 7,
  "availabilityStatus": "available"
}
```

**Response 201:** `Property`

---

### POST /properties/upload-images

Sube imágenes para una propiedad. Acepta `multipart/form-data`.

**Auth requerida:** Sí

**Request:** `files` (lista de archivos de imagen)

**Response 200:**
```json
{
  "urls": [
    "https://nexu-storage-placeholder.local/images/abc123_foto.jpg"
  ]
}
```

> En la implementación actual (memory), las URLs son placeholders. Con S3/GCS, serán URLs reales.

---

### GET /users/{hostId}/properties

Propiedades publicadas por un host específico.

**Auth requerida:** No

**Response 200:** `Property[]`

---

## Bookings

### GET /bookings

Devuelve reservas. Requiere `tenantId` o `hostId` como query param.

**Auth requerida:** Sí

**Query params:**
- `tenantId` (int) — reservas del inquilino
- `hostId` (int) — reservas del propietario

**Ejemplo:** `GET /bookings?tenantId=1`

**Response 200:** `Booking[]`

```json
[
  {
    "id": 1,
    "propertyId": 1,
    "tenantId": 1,
    "hostId": 2,
    "startMonth": "2026-03",
    "durationMonths": 6,
    "residentCount": 1,
    "pricePerMonth": 550.0,
    "serviceFee": 462.0,
    "totalAmount": 3762.0,
    "currency": "PEN",
    "status": "confirmed",
    "guestMessage": "Hola...",
    "hostNote": null,
    "createdAt": "2026-02-10"
  }
]
```

**Errores:**
- `400 Bad Request` — ni `tenantId` ni `hostId` provistos.

---

### POST /bookings

Crea una nueva reserva.

**Auth requerida:** Sí

**Request body:**
```json
{
  "propertyId": 1,
  "tenantId": 1,
  "hostId": 2,
  "startMonth": "2026-08",
  "durationMonths": 3,
  "residentCount": 1,
  "pricePerMonth": 550.0,
  "serviceFee": 231.0,
  "totalAmount": 1881.0,
  "currency": "PEN",
  "guestMessage": "Hola, soy estudiante..."
}
```

> `serviceFee = pricePerMonth × durationMonths × 0.14`
> `totalAmount = pricePerMonth × durationMonths + serviceFee`
> El frontend calcula estos valores antes de enviar.

**Response 201:** `Booking` (con `status: "confirmed"`)

---

### PATCH /bookings/{id}/status

Actualiza el estado de una reserva.

**Auth requerida:** Sí

**Request body:**
```json
{ "status": "cancelled" }
```

Valores válidos: `pending`, `confirmed`, `completed`, `cancelled`

**Response 204** (sin body)

**Errores:**
- `400 Bad Request` — status inválido.
- `404 Not Found` — reserva no encontrada.

---

## Reviews

### GET /properties/{id}/reviews

Reseñas de una propiedad. El reviewer's name y avatar se obtienen por JOIN.

**Auth requerida:** No

**Response 200:**
```json
[
  {
    "id": 1,
    "propertyId": 1,
    "bookingId": 1,
    "reviewerId": 1,
    "reviewerFirstName": "Ana",
    "reviewerLastName": "García",
    "reviewerAvatar": "https://i.pravatar.cc/150?img=47",
    "rating": 5,
    "comment": "Excelente habitación...",
    "createdAt": "2026-01-15"
  }
]
```

---

### GET /reviews

Reseñas de múltiples propiedades.

**Auth requerida:** No

**Query params:**
- `propertyIds` (string) — IDs separados por coma: `1,2,3`

**Ejemplo:** `GET /reviews?propertyIds=1,2,5`

**Response 200:** `Review[]`

---

## Host Dashboard

### GET /host/stats

Estadísticas del panel de propietario.

**Auth requerida:** Sí

**Query params:**
- `hostId` (int, requerido)

**Response 200:**
```json
{
  "totalBookings": 3,
  "totalRevenue": 15624.0,
  "averageRating": 4.7,
  "averageTicket": 5208.0
}
```

> `totalBookings`: reservas no canceladas
> `totalRevenue`: suma de `totalAmount` de reservas `completed`
> `averageRating`: promedio de todas las reviews de propiedades del host
> `averageTicket`: `totalRevenue / completedBookings`

---

### GET /host/activity

Últimas 4 reservas del propietario (para `ActivityFeed`).

**Auth requerida:** Sí

**Query params:**
- `hostId` (int, requerido)

**Response 200:** `Booking[]` (máx 4, ordenadas por `createdAt` desc)

---

## Users

### PATCH /users/{id}/profile

Actualiza el perfil público del usuario.

**Auth requerida:** Sí

**Request body:**
```json
{
  "firstName": "Ana",
  "lastName": "García Ríos",
  "phone": "+51 987 654 321",
  "bio": "Estudiante de la PUCP, ciclo 2026-2."
}
```

**Response 200:** `AuthUser`

---

### PATCH /users/{id}/personal-info

Actualiza email y teléfono.

**Auth requerida:** Sí

**Request body:**
```json
{
  "email": "ana.garcia2@pucp.pe",
  "phone": "+51 999 888 777"
}
```

**Response 200:** `AuthUser`

**Errores:**
- `409 Conflict` — email ya usado por otro usuario.

---

### PATCH /users/{id}/preferences

Guarda las preferencias de convivencia del estudiante.

**Auth requerida:** Sí

**Request body:**
```json
{
  "lifestylePreferences": {
    "sleepSchedule": "early",
    "studyHabits": "intense",
    "noiseLevel": "quiet",
    "cleanliness": "strict",
    "guestsPolicy": "occasionally",
    "smokingPolicy": "no",
    "petsPolicy": "no",
    "targetUniversity": "PUCP",
    "maxMonthlyBudget": 800.0
  }
}
```

**Response 200:** `AuthUser` (con `lifestylePreferences` actualizado)

---

### GET /users/{id}/notifications

Notificaciones del usuario.

**Auth requerida:** Sí

**Response 200:**
```json
[
  {
    "id": 1,
    "userId": 2,
    "type": "new_booking",
    "title": "Nueva solicitud de alquiler",
    "message": "Ana García quiere alquilar tu habitación...",
    "read": false,
    "createdAt": "2026-02-10T09:30:00"
  }
]
```

---

### PATCH /notifications/{id}/read

Marca una notificación como leída.

**Auth requerida:** Sí

**Response 204** (sin body)

---

### GET /users/{id}/conversations

Conversaciones del usuario con sus mensajes.

**Auth requerida:** Sí

**Response 200:** `Conversation[]`

---

### POST /conversations/{id}/messages

Envía un mensaje en una conversación.

**Auth requerida:** Sí

**Request body:**
```json
{
  "senderId": 1,
  "text": "Hola, ¿sigue disponible la habitación?"
}
```

**Response 201:** `Message`

---

## Amenities

### GET /amenities

Catálogo completo de amenidades agrupadas por categoría.

**Auth requerida:** No

**Response 200:**
```json
[
  {
    "title": "Destacados",
    "amenities": [
      { "id": "WIFI", "name": "WiFi de alta velocidad", "icon": "Wifi" },
      { "id": "POOL", "name": "Piscina", "icon": "Waves" }
    ]
  }
]
```

---

## Health

### GET /health

Verificación de estado del servidor.

**Auth requerida:** No

**Response 200:**
```json
{ "status": "ok", "version": "1.0.0" }
```
