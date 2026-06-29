# NexU Frontend — Guía de Integración con el Backend

*(Creado: 2026-06-28 — Paso 4 **completado** el 2026-06-28 vía PR #10)*

> **Estado actual (2026-06-28):** La integración está completa. Todos los `*.service.ts`
> ya usan `apiRequest` del cliente HTTP real. Este documento se conserva como referencia
> de las decisiones de diseño tomadas. Ver pendientes al final de la sección 7.
>
> Este documento describió qué cambios debía hacer el frontend para conectarse al
> backend FastAPI. El objetivo era que **ningún componente, página ni hook necesitara modificarse**:
> solo los `*.service.ts` y el nuevo cliente HTTP. ✅ Logrado.

---

## 0. Prerrequisitos

Antes de empezar este paso:
- El backend está corriendo: `uvicorn app.main:app --reload` desde `backend/`
- El backend responde en `http://localhost:8000`
- `GET http://localhost:8000/health` devuelve `{ "status": "ok" }`

---

## 1. Variable de entorno

Crear `frontend/.env.local` (no commitear):

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Para producción, crear `frontend/.env.production`:
```env
VITE_API_BASE_URL=https://api.nexu.pe/api/v1
```

---

## 2. Cliente HTTP (nuevo archivo)

Crear `src/core/http/client.ts`:

```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

const ACCESS_TOKEN_KEY = 'nextu_access_token'
const REFRESH_TOKEN_KEY = 'nextu_refresh_token'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (!refreshToken) return null
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
    return data.accessToken
  } catch {
    return null
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  // Token expirado — intentar refresh automático
  if (response.status === 401) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` }
      const retry = await fetch(`${BASE_URL}${path}`, { ...options, headers: retryHeaders })
      if (!retry.ok) {
        clearTokens()
        throw new Error(`${retry.status}: ${await retry.text()}`)
      }
      return retry.json() as Promise<T>
    }
    clearTokens()
    throw new Error('Session expired')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail ?? `HTTP ${response.status}`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
```

---

## 3. Reemplazar cada `*.service.ts`

La clave es que **solo cambia el interior de cada método**. Los hooks y componentes que llaman al service no tocan.

### 3.1 auth.service.ts

```typescript
// ANTES (mock):
login: async (email, password) => {
  await delay()
  const user = USERS_MOCK.find(u => u.email === email && u.password === password)
  if (!user) throw new Error('Invalid credentials')
  return user as AuthUser
}

// DESPUÉS (API):
import { apiRequest, setTokens } from '@/core/http/client'

login: async (email, password) => {
  const data = await apiRequest<{ accessToken: string; refreshToken: string; user: AuthUser }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) }
  )
  setTokens(data.accessToken, data.refreshToken)
  return data.user
},

register: async (payload) => {
  const data = await apiRequest<{ accessToken: string; refreshToken: string; user: AuthUser }>(
    '/auth/register',
    { method: 'POST', body: JSON.stringify(payload) }
  )
  setTokens(data.accessToken, data.refreshToken)
  return data.user
},

logout: async () => {
  clearTokens()
}
```

**Nota importante:** `AuthContext.tsx` actualmente guarda el usuario en localStorage con key `'nextu_user'`. Con el backend, el usuario puede obtenerse del token o de `GET /auth/me`. Se recomienda:
1. Al login: guardar `user` en `AuthContext` (como antes) + guardar tokens con `setTokens()`.
2. Al iniciar la app: si existe `nextu_access_token`, llamar `GET /auth/me` para restaurar la sesión.

### 3.2 property.service.ts

```typescript
import { apiRequest } from '@/core/http/client'

getAll: async () => {
  return apiRequest<Property[]>('/properties')
},

getById: async (id) => {
  return apiRequest<Property>(`/properties/${id}`)
},

search: async (filters) => {
  const params = new URLSearchParams()
  if (filters.district) params.set('district', filters.district)
  if (filters.roomType) params.set('roomType', filters.roomType)
  if (filters.nearestUniversity) params.set('nearestUniversity', filters.nearestUniversity)
  if (filters.minPricePerMonth != null) params.set('minPricePerMonth', String(filters.minPricePerMonth))
  if (filters.maxPricePerMonth != null) params.set('maxPricePerMonth', String(filters.maxPricePerMonth))
  if (filters.capacity != null) params.set('capacity', String(filters.capacity))
  if (filters.query) params.set('query', filters.query)
  if (filters.petsAllowed) params.set('petsAllowed', 'true')
  if (filters.quietHours) params.set('quietHours', 'true')
  if (filters.hasWorkspace) params.set('hasWorkspace', 'true')
  return apiRequest<Property[]>(`/properties/search?${params}`)
},

create: async (hostId, draft) => {
  return apiRequest<Property>('/properties', {
    method: 'POST',
    body: JSON.stringify({ ...draft, hostId })
  })
},

uploadImages: async (files) => {
  const form = new FormData()
  files.forEach(f => form.append('files', f))
  // No usar Content-Type: el browser lo pone automáticamente con boundary
  return apiRequest<{ urls: string[] }>('/properties/upload-images', {
    method: 'POST',
    body: form,
    headers: {} // sobrescribe el Content-Type del cliente para multipart
  })
}
```

### 3.3 booking.service.ts

```typescript
getByTenant: async (tenantId) => {
  return apiRequest<Booking[]>(`/bookings?tenantId=${tenantId}`)
},

getByHost: async (hostId) => {
  return apiRequest<Booking[]>(`/bookings?hostId=${hostId}`)
},

create: async (payload) => {
  return apiRequest<Booking>('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
},

updateStatus: async (bookingId, status) => {
  return apiRequest<void>(`/bookings/${bookingId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
}
```

### 3.4 review.service.ts

```typescript
getByPropertyId: async (propertyId) => {
  return apiRequest<Review[]>(`/properties/${propertyId}/reviews`)
},

getByPropertyIds: async (ids) => {
  return apiRequest<Review[]>(`/reviews?propertyIds=${ids.join(',')}`)
}
```

### 3.5 account.service.ts

```typescript
updateProfile: async (userId, payload) => {
  return apiRequest<AuthUser>(`/users/${userId}/profile`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })
},

updatePersonalInfo: async (userId, payload) => {
  return apiRequest<AuthUser>(`/users/${userId}/personal-info`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })
},

updatePreferences: async (userId, prefs) => {
  return apiRequest<AuthUser>(`/users/${userId}/preferences`, {
    method: 'PATCH',
    body: JSON.stringify({ lifestylePreferences: prefs })
  })
},

getNotifications: async (userId) => {
  return apiRequest<Notification[]>(`/users/${userId}/notifications`)
},

markNotificationRead: async (notificationId) => {
  return apiRequest<void>(`/notifications/${notificationId}/read`, { method: 'PATCH' })
},

getConversations: async (userId) => {
  return apiRequest<Conversation[]>(`/users/${userId}/conversations`)
},

sendMessage: async (conversationId, payload) => {
  return apiRequest<Message>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}
```

### 3.6 host.service.ts

```typescript
getStats: async (hostId) => {
  return apiRequest<DashboardStats>(`/host/stats?hostId=${hostId}`)
},

getActivity: async (hostId) => {
  return apiRequest<Booking[]>(`/host/activity?hostId=${hostId}`)
},

getProperties: async (hostId) => {
  return apiRequest<Property[]>(`/users/${hostId}/properties`)
}
```

---

## 4. Tabla resumen de servicios → endpoints

| Service | Método actual | Endpoint backend | Notas |
|---|---|---|---|
| `auth.service` | `login()` | `POST /auth/login` | Guardar tokens con `setTokens()` |
| `auth.service` | `register()` | `POST /auth/register` | Ídem |
| `auth.service` | `logout()` | — | Solo `clearTokens()` |
| `property.service` | `getAll()` | `GET /properties` | |
| `property.service` | `getById(id)` | `GET /properties/:id` | |
| `property.service` | `search(filters)` | `GET /properties/search` | Mapear filtros a query params |
| `property.service` | `create(draft)` | `POST /properties` | Requiere auth |
| `booking.service` | `getByTenant(id)` | `GET /bookings?tenantId=` | |
| `booking.service` | `getByHost(id)` | `GET /bookings?hostId=` | |
| `booking.service` | `create(payload)` | `POST /bookings` | |
| `booking.service` | `updateStatus()` | `PATCH /bookings/:id/status` | |
| `review.service` | `getByPropertyId()` | `GET /properties/:id/reviews` | |
| `review.service` | `getByPropertyIds()` | `GET /reviews?propertyIds=` | |
| `account.service` | `updateProfile()` | `PATCH /users/:id/profile` | |
| `account.service` | `updatePersonalInfo()` | `PATCH /users/:id/personal-info` | |
| `account.service` | `updatePreferences()` | `PATCH /users/:id/preferences` | |
| `account.service` | `getNotifications()` | `GET /users/:id/notifications` | |
| `account.service` | `markRead()` | `PATCH /notifications/:id/read` | |
| `account.service` | `getConversations()` | `GET /users/:id/conversations` | |
| `account.service` | `sendMessage()` | `POST /conversations/:id/messages` | |
| `host.service` | `getStats()` | `GET /host/stats?hostId=` | |
| `host.service` | `getActivity()` | `GET /host/activity?hostId=` | |
| `host.service` | `getProperties()` | `GET /users/:id/properties` | |

---

## 5. Cambios en AuthContext.tsx

`AuthContext` actualmente:
- Almacena usuario en `localStorage` key `'nextu_user'`.
- Hace login contra el mock directamente.

Con el backend:
1. **Al login/register**: el servicio devuelve `user` y los tokens ya están guardados en localStorage por `setTokens()`. El contexto solo actualiza su estado con `user`.
2. **Al iniciar la app (hidratación)**: verificar si existe `nextu_access_token` y llamar `GET /auth/me` para restaurar la sesión. Si el token expiró, `clearTokens()`.
3. **La key `nextu_user`** puede mantenerse como cache del objeto usuario para evitar llamadas adicionales al recargar.

```typescript
// En AuthContext.tsx — efecto de hidratación
useEffect(() => {
  const token = getAccessToken()
  if (!token) return
  authService.me()
    .then(user => setAuthUser(user))
    .catch(() => { clearTokens(); setAuthUser(null) })
}, [])
```

---

## 6. Orden de integración recomendado

Integrar un servicio a la vez para validar que no hay regresiones:

1. `auth.service.ts` — login/register/logout (base de todo lo demás)
2. `property.service.ts` — `getAll()` y `getById()` (flujo de lectura, sin auth)
3. `property.service.ts` — `search()` (validar que los filtros se mapean bien)
4. `booking.service.ts` — `getByTenant()` y `create()` (flujo de reserva)
5. `review.service.ts` — verificar que los campos enriched llegan bien
6. `account.service.ts` — perfil, preferencias, notificaciones, mensajes
7. `host.service.ts` — dashboard, reservaciones, propiedades del host

---

## 7. Eliminar `src/mock/`

**Estado (2026-06-28): ⏳ Pendiente.**

Los servicios ya no consumen datos de mock, pero `account.service.ts` importa tipos
desde `src/mock/notifications.mock` y `src/mock/messages.mock` porque `Notification`,
`Conversation` y `Message` no tienen archivos `types/` propios en `features/account/`.

**Para completar:**
1. Mover `Notification` a `features/account/types/account.types.ts`.
2. Mover `Message` y `Conversation` a `features/account/types/account.types.ts` (o a `features/messages/types/`).
3. Actualizar el import en `account.service.ts`.
4. Verificar que ningún otro archivo importe desde `src/mock/`.
5. Eliminar `src/mock/` completo.
6. Ejecutar `npx tsc --noEmit` — no debe haber errores.

---

## 8. Manejo de errores en servicios

Actualmente los mocks nunca fallan. Con el backend real, agregar manejo de errores en cada service:

```typescript
// Opción A: propagar el error (el componente lo captura con try/catch o ErrorBoundary)
getAll: async () => {
  return apiRequest<Property[]>('/properties')  // lanza si 5xx/4xx
}

// Opción B: devolver null/[] con log (más defensivo)
getAll: async () => {
  try {
    return await apiRequest<Property[]>('/properties')
  } catch (err) {
    console.error('[PropertyService.getAll]', err)
    return []
  }
}
```

Se recomienda **Opción A** para errores de autenticación (401/403) y **Opción B** para errores de datos no críticos.

---

## 9. Variables de entorno necesarias

| Variable | Valor dev | Valor prod |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | `https://api.nexu.pe/api/v1` |

Agregar a `.gitignore`: `.env.local`, `.env.production`
Agregar a `.env.example` (si no existe):
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```
