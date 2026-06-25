# Contexto de Migración — Proyecto NexU (antes "Smart")

> **Nota de nomenclatura**: el proyecto fue renombrado de "Smart" a
> "NexU" durante el desarrollo. Este documento usa "NexU" en adelante;
> donde el código legacy o commits antiguos digan "Smart", es el mismo
> proyecto.

> **Este documento es la fuente de verdad de la migración.** Vive en
> `frontend/docs/contexto-migracion-nexu.md`. Cada vez que se audite
> el proyecto, este archivo se actualiza para reflejar el estado real
> del código — no lo que se planeó originalmente. Al final del archivo
> hay un prompt de auditoría reutilizable para mantenerlo al día.

---

## 1. Qué es NexU

Plataforma de reservas de recintos y espacios (modelo similar a
Airbnb). Originalmente construida como monorepo Next.js, está siendo
migrada a una arquitectura desacoplada frontend/backend.

### Stack original (legacy)
- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS 4
- NextAuth.js 4 (Google OAuth + credentials)
- Oracle Database 21c (`oracledb`) con stored procedures
- Google Cloud Storage para imágenes
- Leaflet + React Leaflet

### Dominios del sistema
Auth, Properties (con wizard de creación multi-paso), Bookings (con
estados PENDING/CONFIRMED/COMPLETED/CANCELLED), Reviews, Host
Dashboard (métricas), Account (perfil, notificaciones, mensajes),
Amenities (catálogo de servicios).

### Roles
**Tenant** (huésped que busca y reserva) y **Host** (anfitrión que
publica y gestiona propiedades).

---

## 2. Por qué se decidió migrar

El monorepo Next.js tenía a UI, lógica de negocio y acceso a datos
fuertemente acoplados. Se decidió separar en:

- **Frontend**: React + Vite + TypeScript, desacoplado de cualquier
  framework fullstack
- **Backend**: Python + FastAPI, API REST independiente

### Reglas que siguen vigentes para toda la migración

1. **Eliminar Oracle por completo** — no se migra, se descarta.
2. **No implementar PostgreSQL todavía** — el backend debe quedar
   arquitectónicamente listo (capa de repositorio con interfaz
   abstracta) pero sin conectar ninguna base de datos real por ahora.
3. **Frontend independiente del backend, primero** — se construyó con
   datos mock internos (arrays TypeScript dentro del propio proyecto),
   sin esperar a que el backend exista.
4. **El backend se construye después**, usando los mismos contratos
   de datos que el frontend ya validó con sus mocks.
5. **No hacer commits automáticos** — cualquier agente de IA que
   trabaje en este repo deja los cambios en el working tree, nunca
   ejecuta `git commit`/`push`/`merge`/`rebase` (regla del `AGENTS.md`
   del repositorio).
6. **No modificar `legacy/`** — es solo consulta de referencia.

---

## 3. Plan de migración — Estado por paso

> Esta sección se actualiza cada vez que se ejecuta una auditoría
> (ver prompt en la sección 6). El campo **Estado real verificado**
> es el único confiable; lo demás es lo que se planeó originalmente.

### Paso 1 — Archivar el proyecto legacy

**Estado planeado:** ✅ Ejecutado

Reorganización del repositorio:

```
nexu/  (antes "smart/")
├── legacy/          ← proyecto Next.js + Oracle original completo
├── frontend/        ← nuevo proyecto React + Vite
├── backend/         ← carpeta reservada para el futuro backend
└── README.md
```

- `legacy/` se mantiene de solo lectura, sin secretos reales
  (`.env.example` en vez de `.env`/`.env.local` con valores).
- No se eliminó ningún archivo del proyecto original.

**Estado real verificado:** ✅ Confirmado sin cambios.

- `legacy/` existe y contiene el proyecto Next.js original completo
  (páginas, API routes, componentes, docs, config).
- Solo existe `legacy/.env.example`. No hay `.env` ni `.env.local`
  con valores reales dentro de `legacy/`.
- El directorio es de solo lectura para fines prácticos — no se han
  hecho modificaciones desde el archivado.

---

### Paso 2 — Construir el frontend React + Vite

**Estado planeado:** ✅ Ejecutado

**Stack**: React 18, Vite 5, TypeScript 5 (strict), React Router v6,
Tailwind CSS 3, Zustand, Lucide React, Leaflet + React Leaflet,
date-fns.

**Arquitectura**: feature-based con barrel exports.

```
frontend/src/
├── core/              # router, auth context, store global (Zustand)
├── mock/              # arrays TS estáticos — fuente de datos actual
│   ├── users.mock.ts
│   ├── properties.mock.ts
│   ├── bookings.mock.ts
│   ├── reviews.mock.ts
│   ├── amenities.mock.ts
│   ├── notifications.mock.ts
│   └── messages.mock.ts
├── features/
│   ├── auth/
│   ├── properties/
│   ├── bookings/
│   ├── reviews/
│   ├── host/          # incluye wizard de creación de propiedad
│   └── account/
└── shared/            # componentes UI base, layouts, utils
```

**Patrón de servicios (pieza clave de la arquitectura):**

Cada feature tiene un `*.service.ts` que es la única capa que importa
de `src/mock/`. Hooks y componentes nunca tocan los mocks directamente.

```ts
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms))

export const propertyService = {
  getAll: async (): Promise<Property[]> => {
    await delay()
    return PROPERTIES_MOCK.filter(p => p.status === 'active')
  },
}
```

Cuando exista el backend, solo se reemplaza el contenido de cada
`*.service.ts` por llamadas HTTP. Hooks, componentes y páginas no
deberían necesitar cambios.

**Auth simulado**: login contra `USERS_MOCK`, persistencia en
`localStorage`, sin JWT real.

**Flujos implementados originalmente**: búsqueda con mapa interactivo,
detalle de propiedad → checkout (14% comisión de servicio) →
confirmación, dashboard de host con métricas calculadas desde mocks,
wizard multi-paso para publicar propiedad, gestión de reservas con
filtros por estado y tiempo.

**Estado real verificado:** ✅ Ejecutado — con diferencias respecto a
lo planeado. Detalles a continuación.

#### Stack (package.json) — confirmado con adiciones

| Dependencia | Versión planificada | Versión real |
|---|---|---|
| react | 18 | 18.3.0 ✅ |
| vite | 5 | 5.3.0 ✅ |
| typescript | 5 | 5.5.0 ✅ |
| react-router-dom | v6 | 6.24.0 ✅ |
| tailwindcss | 3 | 3.4.0 ✅ |
| zustand | ✓ | 4.5.0 ✅ |
| lucide-react | ✓ | 0.383.0 ✅ |
| leaflet + react-leaflet | ✓ | 1.9.4 + 4.2.1 ✅ |
| date-fns | ✓ | 3.6.0 ✅ |
| **clsx** | no documentado | **2.1.1 ← agregado** |
| **tailwind-merge** | no documentado | **2.3.0 ← agregado** |

`clsx` y `tailwind-merge` se usan juntos en `shared/utils/cn.ts` para
componer clases Tailwind de forma segura. No cambian la arquitectura.

#### Estructura real de `frontend/src/`

```
frontend/src/
├── types/
│   └── global.types.ts          ← nuevo; contiene Role y PaginatedResponse<T>
├── core/
│   ├── auth/
│   │   ├── AuthContext.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── useAuth.ts
│   ├── router/
│   │   └── index.tsx
│   └── store/
│       └── ui.store.ts          ← único store Zustand (isNavOpen, activeModal)
├── mock/
│   ├── users.mock.ts
│   ├── properties.mock.ts
│   ├── bookings.mock.ts
│   ├── reviews.mock.ts
│   ├── amenities.mock.ts
│   ├── notifications.mock.ts
│   └── messages.mock.ts
├── features/
│   ├── auth/
│   │   ├── components/  LoginForm.tsx, RegisterForm.tsx
│   │   ├── pages/       LoginPage.tsx, RegisterPage.tsx
│   │   ├── services/    auth.service.ts
│   │   ├── types/       auth.types.ts
│   │   └── index.ts
│   ├── properties/
│   │   ├── components/  PropertyCard, PropertyGallery, PropertyBasicInfo,
│   │   │                PropertyAmenities, PropertyHouseRules, PropertyReviews,
│   │   │                PropertyHostInfo, PropertyBookingCard, CheckoutModal,
│   │   │                SuccessModal, PropertySearchMap
│   │   ├── pages/       PropertiesHomePage, SearchPage, PropertyDetailPage
│   │   ├── services/    property.service.ts
│   │   ├── types/       property.types.ts
│   │   └── index.ts
│   ├── bookings/
│   │   ├── components/  BookingStatusBadge, BookingCard, BookingDetailModal
│   │   ├── pages/       MyBookingsPage
│   │   ├── services/    booking.service.ts
│   │   ├── types/       booking.types.ts
│   │   └── index.ts
│   ├── reviews/
│   │   ├── components/  StarRating, ReviewCard, ReviewStats
│   │   ├── pages/       HostReviewsPage
│   │   ├── services/    review.service.ts
│   │   ├── types/       review.types.ts
│   │   └── index.ts
│   ├── host/
│   │   ├── components/  DashboardStats, ActivityFeed, HostPropertyCard,
│   │   │                ReservationDetailPanel
│   │   ├── pages/       HostDashboardPage, HostPropertiesPage,
│   │   │                HostReservationsPage
│   │   ├── wizard/      NewPropertyWizard, WizardNav,
│   │   │                Step1PropertyType … Step9Review  (9 pasos)
│   │   ├── services/    host.service.ts
│   │   ├── types/       host.types.ts
│   │   └── index.ts
│   └── account/
│       ├── components/  ProfileForm, PersonalInfoForm
│       ├── pages/       ProfilePage, PersonalInfoPage, NotificationsPage,
│       │                MessagesPage
│       ├── services/    account.service.ts
│       ├── types/       account.types.ts
│       └── index.ts
└── shared/
    ├── components/
    │   ├── ui/          Button, Input, Modal, Badge, Spinner, Avatar,
    │   │                StepHeader
    │   ├── feedback/    EmptyState, ErrorMessage, LoadingSkeleton
    │   └── layout/      MainLayout, Navbar, AccountLayout, AccountSidebar,
    │                    HostLayout, HostSidebar, HostNavbar
    ├── hooks/
    │   ├── useDebounce.ts
    │   └── usePagination.ts
    └── utils/
        ├── cn.ts         ← clsx + twMerge combinados
        ├── formatters.ts
        └── constants.ts  ← BOOKING_STATUS_LABELS/COLORS, PROPERTY_TYPES,
                             LIMA_CENTER
```

#### Diferencias respecto a lo documentado originalmente

**Agregado (existía en el código pero no estaba documentado):**
- `frontend/src/types/global.types.ts` — tipos globales (`Role`,
  `PaginatedResponse<T>`)
- `shared/hooks/` — `useDebounce.ts`, `usePagination.ts`
- `shared/utils/` — `cn.ts`, `formatters.ts`, `constants.ts`
- `shared/components/feedback/` — `EmptyState`, `ErrorMessage`,
  `LoadingSkeleton`
- `shared/components/layout/` — `MainLayout`, `Navbar`, `HostNavbar`
  (el original solo mencionaba la carpeta genéricamente)
- `shared/components/ui/StepHeader.tsx` — componente de navegación de
  pasos del wizard
- Wizard con **9 pasos** explícitos (`Step1PropertyType` →
  `Step9Review`), no documentados en detalle
- `SuccessModal.tsx` en `features/properties/components/` — modal de
  confirmación post-checkout

**Nota de duplicación de tipos:** Las interfaces `Property`,
`Booking`/`BookingStatus`, y `Review` están definidas tanto en sus
respectivos archivos `mock/*.mock.ts` como en sus `types/*.ts`. Son
estructuralmente idénticas — TypeScript no lo detecta como error — pero
es una deuda técnica menor a limpiar antes del Paso 3.

#### Auth simulado

- Sistema: `localStorage` + React Context (`AuthContext`) ✅ Confirmado
- La clave de almacenamiento es `'smart_user'` (herencia del nombre
  anterior), no `'nexu_user'`. Sin impacto funcional, pero a corregir
  antes del Paso 3.
- `ProtectedRoute` acepta un prop `requiredRole?: string` para proteger
  rutas exclusivas de host (`/host/*`).
- Registro no acepta el rol `'both'` — solo `'tenant'` o `'host'`.

#### Rutas registradas (React Router v6)

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | PropertiesHomePage | público |
| `/search` | SearchPage | público |
| `/properties/:id` | PropertyDetailPage | público |
| `/login` | LoginPage | público |
| `/register` | RegisterPage | público |
| `/account` | AccountLayout | autenticado |
| `/account/profile` | ProfilePage | autenticado |
| `/account/personal-info` | PersonalInfoPage | autenticado |
| `/account/bookings` | MyBookingsPage | autenticado |
| `/account/notifications` | NotificationsPage | autenticado |
| `/account/messages` | MessagesPage | autenticado |
| `/host` | HostDashboardPage | host |
| `/host/properties` | HostPropertiesPage | host |
| `/host/reservations` | HostReservationsPage | host |
| `/host/reviews` | HostReviewsPage | host |
| `/host/new-property` | NewPropertyWizard | host |

#### Flujos funcionales — estado real

| Flujo | Estado |
|---|---|
| Auth (login / register / logout / persistencia) | ✅ Completo |
| Home con listado de propiedades activas | ✅ Completo |
| Búsqueda con filtros (district, precio, capacidad, amenidades) y mapa Leaflet | ✅ Completo |
| Detalle de propiedad (galería, info, amenidades, reglas, host, reviews) | ✅ Completo |
| Checkout (cálculo 14% serviceFee, reserva, SuccessModal) | ✅ Completo |
| Mis Reservas (lista + filtros por estado/tiempo + BookingDetailModal) | ✅ Completo |
| Host Dashboard (DashboardStats + ActivityFeed) | ✅ Completo |
| Host — mis propiedades | ✅ Completo |
| Host — reservaciones con panel de detalle y cambio de estado | ✅ Completo |
| Host — reseñas recibidas | ✅ Completo |
| Wizard nueva propiedad (9 pasos) | ✅ Completo |
| Account — perfil y datos personales editables | ✅ Completo |
| Account — notificaciones con marcar como leída | ✅ Completo |
| Account — mensajería (lista de conversaciones + envío de mensaje) | ✅ Completo |

---

### Paso 3 — Backend FastAPI

**Estado planeado:** ⏳ Pendiente — no iniciado al momento de redactar
este documento.

**Diseño original previsto:**
- Python 3.12+ con FastAPI
- Arquitectura: `routers → controllers → services → repositories`
- Repositorios con interfaz abstracta (`Protocol`/`ABC`) para que
  cambiar a PostgreSQL después sea solo escribir una nueva
  implementación, sin tocar servicios ni endpoints
- Datos estáticos también en el backend (`mock_data/` por dominio),
  coherentes con los contratos que ya usa el frontend
- Sin conectar PostgreSQL todavía
- Endpoints reflejando los mismos dominios del frontend: auth,
  properties, bookings, reviews, host dashboard, account, amenities

**Estado real verificado:** ⏳ No iniciado — confirmado.

La carpeta `backend/` contiene únicamente un archivo `.gitkeep`. No
hay código de backend de ningún tipo.

**Viabilidad:** Ver sección 5.

---

### Paso 4 — Integración frontend ↔ backend

**Estado planeado:** ⏳ Pendiente — comienza una vez que el Paso 3
(backend FastAPI + mocks) esté funcional.

**Alcance definido (2026-06-25):**

Reemplazar cada `*.service.ts` del frontend por llamadas HTTP reales
al backend FastAPI. Los componentes, páginas y hooks **no deben
requerir cambios** — esa es la garantía del patrón de servicios
establecido en el Paso 2.

Tareas concretas de este paso:
- Agregar cliente HTTP al frontend (fetch nativo o axios).
- Reemplazar `delay()` + arrays de mock por `fetch('/api/...')` en
  cada `*.service.ts`.
- Gestión de tokens de auth (JWT del backend → localStorage o cookie).
- Manejo de errores HTTP en los servicios (actualmente no existe
  porque los mocks nunca fallan).
- Eliminar `src/mock/` una vez que todos los servicios estén
  conectados (o mantenerlos como fallback de desarrollo).

**Principio clave:** este no es un porting 1:1 del legacy. El frontend
ya define contratos diferentes al sistema Oracle original, y el backend
debe implementar exactamente esos contratos nuevos — no los
procedimientos almacenados del legacy.

**Estado real verificado:** ⏳ No iniciado — depende del Paso 3.

---

### Paso 5 — Migración a PostgreSQL

**Estado planeado:** ⏳ Pendiente — comienza una vez que el Paso 4
(integración) esté funcionando en desarrollo.

**Alcance definido (2026-06-25):**

Reemplazar los `mock_data/` del backend por una base de datos
PostgreSQL real. Por el diseño de repositorios con interfaz abstracta
del Paso 3, este cambio debe ser **localizado en la capa de
repositorio** — sin tocar routers, controllers ni servicios del
backend.

**Este no es un dump del schema Oracle.** El schema PostgreSQL se
derivará de los contratos de datos validados en el frontend (sección
4 de este documento), con las modificaciones que se hayan acumulado
en los Pasos 3 y 4. Diferencias respecto al legacy previsibles:
- Tablas renombradas / restructuradas (ej: stored procedures → tablas
  normalizadas con lógica en Python).
- `property.rating` y `property.reviewsCount` computados en query
  (no almacenados como en el mock).
- `review.reviewerFirstName/LastName/Avatar` posiblemente
  normalizados (JOIN a users en vez de copia desnormalizada).
- Nuevo campo `property.type` (del wizard) sin equivalente en Oracle.
- Gestión de imágenes por definir (¿URLs externas, storage propio?).
- Sistema de auth con JWT/sessions propio, sin NextAuth.

**Estado real verificado:** ⏳ No iniciado.

---

## 4. Contratos de datos actuales

> Extraídos de `frontend/src/mock/*.ts` y
> `frontend/src/features/*/types/*.ts` en la auditoría del
> 2026-06-25. Esta sección reemplaza completa a la anterior en cada
> auditoría.

### Entidades principales

```typescript
// ─── Auth ──────────────────────────────────────────────────────────────────

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'tenant' | 'host'   // 'both' no es seleccionable en registro
}

// AuthUser = User sin el campo password (lo que devuelve el backend)
interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'tenant' | 'host' | 'both'
  avatarUrl: string
  phone: string
  bio: string
  createdAt: string          // 'YYYY-MM-DD'
}

// ─── User (entidad completa, solo en mock — password nunca viaja a cliente) ─

interface User {
  id: number
  email: string
  password: string           // ⚠ solo en mock; el backend NUNCA lo expone
  firstName: string
  lastName: string
  role: 'tenant' | 'host' | 'both'
  avatarUrl: string
  phone: string
  bio: string
  createdAt: string          // 'YYYY-MM-DD'
}

// ─── Property ───────────────────────────────────────────────────────────────

interface Property {
  id: number
  hostId: number             // → User.id
  title: string
  description: string
  shortDescription: string
  pricePerNight: number      // en PEN
  currency: 'PEN'
  location: string           // dirección textual ('Av. Larco 1150')
  district: string           // 'Miraflores', 'Barranco', etc.
  city: string               // siempre 'Lima' en mock
  country: string            // siempre 'Perú' en mock
  lat: number
  lng: number
  images: string[]           // URLs de imágenes
  amenities: string[]        // IDs de Amenity ('WIFI', 'POOL', etc.)
  capacity: number           // huéspedes máximos
  bedrooms: number
  beds: number
  bathrooms: number
  rating: number             // ⚠ denormalizado — calculado del promedio de Review.rating
  reviewsCount: number       // ⚠ denormalizado — el backend debe calcularlo
  checkinTime: string        // 'HH:MM' (ej: '15:00')
  checkoutTime: string       // 'HH:MM'
  houseRules: string[]       // textos libres
  status: 'active' | 'inactive'
  createdAt: string          // 'YYYY-MM-DD'
}

interface PropertySearchFilters {
  district?: string
  minPrice?: number
  maxPrice?: number
  capacity?: number
  amenities?: string[]       // IDs de amenidad; se aplica lógica AND (todas deben estar)
  query?: string             // filtra por title o district (case-insensitive)
}

interface BookingDraft {     // estado transitorio en UI durante checkout
  checkinDate: string        // 'YYYY-MM-DD'
  checkoutDate: string       // 'YYYY-MM-DD'
  guestCount: number
}

// ─── Booking ────────────────────────────────────────────────────────────────

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

interface Booking {
  id: number
  propertyId: number         // → Property.id
  tenantId: number           // → User.id
  hostId: number             // → User.id
  checkinDate: string        // 'YYYY-MM-DD'
  checkoutDate: string       // 'YYYY-MM-DD'
  guestCount: number
  nightCount: number
  pricePerNight: number
  serviceFee: number         // 14% de (pricePerNight × nightCount)
  totalAmount: number        // pricePerNight × nightCount + serviceFee
  currency: 'PEN'
  status: BookingStatus
  guestMessage: string | null
  hostNote: string | null
  createdAt: string          // 'YYYY-MM-DD'
}

interface CreateBookingPayload {
  propertyId: number
  tenantId: number
  hostId: number
  checkinDate: string
  checkoutDate: string
  guestCount: number
  nightCount: number
  pricePerNight: number
  serviceFee: number
  totalAmount: number
  currency: 'PEN'
  guestMessage?: string
}

// ─── Review ─────────────────────────────────────────────────────────────────

interface Review {
  id: number
  propertyId: number         // → Property.id
  bookingId: number          // → Booking.id
  reviewerId: number         // → User.id
  reviewerFirstName: string  // ⚠ desnormalizado — copiado de User al crear
  reviewerLastName: string   // ⚠ desnormalizado
  reviewerAvatar: string     // ⚠ desnormalizado
  rating: number             // 1–5 (entero)
  comment: string
  createdAt: string          // 'YYYY-MM-DD'
}

// ─── Notification ───────────────────────────────────────────────────────────

type NotificationType =
  | 'new_booking'
  | 'booking_confirmed'
  | 'new_review'
  | 'checkin_reminder'

interface Notification {
  id: number
  userId: number             // → User.id (destinatario)
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string          // ISO datetime 'YYYY-MM-DDTHH:MM:SS'
}

// ─── Messaging ──────────────────────────────────────────────────────────────

interface Message {
  id: number
  senderId: number           // → User.id
  text: string
  createdAt: string          // ISO datetime
}

interface Conversation {
  id: number
  participants: number[]     // [User.id, User.id] — siempre 2 participantes en mock
  propertyId: number         // → Property.id (conversación asociada a una propiedad)
  messages: Message[]
  lastMessageAt: string      // ISO datetime — usado para ordenar
}

// ─── Amenities ──────────────────────────────────────────────────────────────

interface Amenity {
  id: string                 // 'WIFI' | 'POOL' | 'PARKING' | ... (ver catálogo abajo)
  name: string               // nombre en español
  icon: string               // nombre de ícono Lucide React
}

interface AmenityCategory {
  title: string
  amenities: Amenity[]
}

// IDs de amenidad disponibles (del catálogo en amenities.mock.ts):
// Destacados: WIFI, POOL, PARKING, AIR_CONDITIONING, KITCHEN, WASHER
// Baño:       BATHTUB, HOT_WATER
// Entrete.:   TV, NETFLIX, SOUND_SYSTEM
// Trabajo:    WORKSPACE, PRINTER
// Cocina:     MICROWAVE, DISHWASHER, COFFEE_MAKER, GRILL, BREAKFAST
// Familia:    FAMILY_FRIENDLY, BABY_FRIENDLY, CRIB, PETS_ALLOWED
// Seguridad:  SMOKE_DETECTOR, CO_DETECTOR, WHEELCHAIR_ACCESSIBLE
// Extras:     EV_CHARGER, KING_BED, SMOKING_ALLOWED, QUIET_HOURS

// ─── Host Dashboard ─────────────────────────────────────────────────────────

interface DashboardStats {
  totalBookings: number      // reservas no canceladas del host
  totalRevenue: number       // suma de totalAmount de reservas completadas
  averageRating: number      // promedio de rating de todas las propiedades del host
  averageTicket: number      // totalRevenue / reservas completadas
}

// ─── Wizard nueva propiedad ─────────────────────────────────────────────────

interface CreatePropertyDraft {  // estado interno del wizard (9 pasos)
  type: string               // ID de PROPERTY_TYPES ('apartment', 'house', etc.)
  location: string
  district: string
  address: string
  capacity: number
  bedrooms: number
  beds: number
  bathrooms: number
  amenities: string[]        // IDs de Amenity seleccionados
  title: string
  description: string
  pricePerNight: number
}

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

// ─── Account ────────────────────────────────────────────────────────────────

interface ProfileUpdatePayload {
  firstName: string
  lastName: string
  phone: string
  bio: string
}

interface PersonalInfoPayload {
  email: string
  phone: string
}

// ─── Paginación (global) ────────────────────────────────────────────────────

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
// Nota: PaginatedResponse<T> está definida pero no se usa en los servicios mock
// actuales. Está disponible para cuando se conecte el backend real.
```

### Relaciones entre entidades

```
Property.hostId          → User.id
Booking.propertyId       → Property.id
Booking.tenantId         → User.id
Booking.hostId           → User.id
Review.propertyId        → Property.id
Review.bookingId         → Booking.id
Review.reviewerId        → User.id
Notification.userId      → User.id       (destinatario)
Conversation.participants[*] → User.id
Conversation.propertyId  → Property.id
Message.senderId         → User.id
Property.amenities[*]    → Amenity.id
```

### Notas para el backend

1. **`Property.rating` y `Property.reviewsCount`** son campos
   denormalizados en el mock. El backend deberá calcularlos
   dinámicamente desde la tabla de reviews o mantener contadores
   actualizados en la tabla de propiedades.
2. **`Review.reviewerFirstName/LastName/Avatar`** están copiados al
   crear la reseña (desnormalizados). El backend puede elegir
   normalizar (solo guardar `reviewerId` y hacer JOIN) o mantener la
   misma estrategia. La UI los consume directamente de la reseña, sin
   otro lookup.
3. **`Booking` inicia en `'confirmed'`** en el mock (el servicio
   ignora el estado `'pending'`). El flujo real de aprobación por el
   host existe en el legacy pero no fue portado al nuevo frontend aún.
4. **`CreatePropertyDraft`** no incluye `images`, `lat`, ni `lng` — el
   wizard actual no tiene paso de fotos reales ni geolocalización
   manual. El `property.service.create()` rellena esos campos con
   defaults. Esto deberá resolverse en el wizard antes del Paso 3.

---

## 5. Viabilidad del Paso 3 — Última evaluación

> Esta sección contiene siempre el resultado de la auditoría más
> reciente. Se sobrescribe completa cada vez que se vuelve a evaluar.

**Fecha de última evaluación:** 2026-06-25

**Veredicto:** Viable parcialmente

**Razones:**

Los contratos de datos están estables y completos para la mayoría de
los flujos. El patrón de servicios es consistente en el 100% del
código — reemplazar cada `*.service.ts` por llamadas HTTP es una
operación quirúrgica y predecible. Los flujos de UI están todos
implementados y funcionando contra los mocks.

Sin embargo, hay tres puntos de fricción que conviene resolver antes
o durante el Paso 3 para evitar retrabajo:

1. **`Property.rating` / `reviewsCount` denormalizados** — el backend
   necesita una estrategia clara (calculado en query vs. contadores
   mantenidos), porque el frontend los consume como campos de
   `Property`. Si el backend elige normalizar, los contratos no
   cambian; si elige no incluirlos, la UI se rompe.

2. **Wizard de nueva propiedad incompleto** — `CreatePropertyDraft` no
   incluye `images`, coordenadas (`lat`/`lng`) ni todos los campos que
   `Property` requiere. El servicio mock los rellena con defaults. El
   backend necesitará un contrato de creación más completo, lo que
   puede implicar cambios en el wizard (Step5 de fotos es un
   placeholder).

3. **Tipos duplicados en mock y en `types/`** — `Property`, `Booking`
   y `Review` están definidos en dos lugares. Antes de conectar el
   backend, conviene eliminar la definición del mock y dejar solo la
   del archivo `types/`, para que el `*.service.ts` importe el tipo y
   los datos por separado sin ambigüedad.

**Qué falta resolver antes de avanzar:**

- [ ] Definir la estrategia de `rating`/`reviewsCount` en el modelo de
  datos del backend (calculado o denormalizado).
- [ ] Completar el wizard: Step5 con soporte real de fotos y Step2 con
  geolocalización o coordenadas manuales.
- [ ] Limpiar la duplicación de tipos (editorial, 30 min de trabajo).
- [ ] Corregir la storage key `'smart_user'` a `'nexu_user'` (o lo
  que se decida), para consistencia antes de conectar auth real.

**Endpoints propuestos y sus schemas (basados en contratos reales)**

```
──────────────────────────────────────────────────────────────────────────────
POST   /auth/login
  Request:  LoginCredentials { email, password }
  Response: AuthUser

POST   /auth/register
  Request:  RegisterData { firstName, lastName, email, password, role }
  Response: AuthUser

──────────────────────────────────────────────────────────────────────────────
GET    /properties
  Response: Property[]   (solo status='active')

GET    /properties/:id
  Response: Property | 404

GET    /properties/search?district=&minPrice=&maxPrice=&capacity=&amenities=&query=
  Response: Property[]

GET    /users/:hostId/properties
  Response: Property[]

POST   /properties
  Request:  { hostId, title, description, shortDescription, pricePerNight,
              location, district, lat, lng, images, amenities, capacity,
              bedrooms, beds, bathrooms, checkinTime, checkoutTime, houseRules }
  Response: Property

──────────────────────────────────────────────────────────────────────────────
GET    /bookings?tenantId=:id
  Response: Booking[]

GET    /bookings?hostId=:id
  Response: Booking[]

POST   /bookings
  Request:  CreateBookingPayload
  Response: Booking

PATCH  /bookings/:id/status
  Request:  { status: BookingStatus }
  Response: 204 No Content

──────────────────────────────────────────────────────────────────────────────
GET    /properties/:id/reviews
  Response: Review[]

GET    /reviews?propertyIds=1,2,3
  Response: Review[]

──────────────────────────────────────────────────────────────────────────────
GET    /host/stats?hostId=:id
  Response: DashboardStats { totalBookings, totalRevenue, averageRating,
                             averageTicket }

GET    /host/activity?hostId=:id
  Response: Booking[]  (últimas 4, ordenadas por createdAt desc)

──────────────────────────────────────────────────────────────────────────────
PATCH  /users/:id/profile
  Request:  ProfileUpdatePayload { firstName, lastName, phone, bio }
  Response: AuthUser

GET    /users/:id/notifications
  Response: Notification[]

PATCH  /notifications/:id/read
  Response: 204 No Content

GET    /users/:id/conversations
  Response: Conversation[]

POST   /conversations/:id/messages
  Request:  { senderId: number; text: string }
  Response: Message

──────────────────────────────────────────────────────────────────────────────
GET    /amenities
  Response: AmenityCategory[]
```

---

## 6. Prompt de auditoría — usar para mantener este documento al día

> Copia el siguiente bloque completo y pégalo en una IA con acceso de
> lectura al repositorio (incluyendo `legacy/`, `frontend/` completo, y
> este mismo archivo). El resultado de ejecutarlo es una versión
> actualizada de este `.md` completo, lista para reemplazar el archivo
> en `frontend/docs/contexto-migracion-nexu.md`.

````markdown
Actúa como un ingeniero de software senior haciendo auditoría de
arquitectura. Tienes acceso de lectura a todo el repositorio del
proyecto NexU, incluyendo `legacy/`, `frontend/` completo, y el
archivo `frontend/docs/contexto-migracion-nexu.md` (que es la versión
anterior de este mismo documento — tu input base).

## Tu tarea

Revisa el código real del repositorio y produce una **versión
actualizada completa** del archivo `contexto-migracion-nexu.md`,
manteniendo exactamente su misma estructura de secciones (1 a 6),
pero corrigiendo cada sección para reflejar el estado real del código
en lugar de lo que se planeó.

## Qué debes verificar específicamente

### Para el Paso 1 (legacy)
- Confirma que `legacy/` existe y contiene el proyecto Next.js
  original sin modificaciones.
- Confirma que no hay secretos reales (`.env` con valores) dentro
  de `legacy/`.
- Si encuentras algo distinto a lo documentado, indícalo en
  "Estado real verificado" de esa sección.

### Para el Paso 2 (frontend)
- Compara la estructura de carpetas real de `frontend/src/` contra
  la documentada en la sección 3 de este archivo.
- Lista cualquier feature, página, componente o carpeta que exista
  en el código pero no esté documentada aquí.
- Lista cualquier cosa documentada aquí que ya no exista en el código
  (renombrada, eliminada, o reemplazada por otro enfoque).
- Verifica si el patrón de servicios (`*.service.ts` con `delay()`
  como única capa que toca `src/mock/`) sigue siendo el patrón real
  usado en todo el código, o si cambió.
- Verifica si el stack de dependencias (`package.json`) sigue siendo
  el mismo (React 18, Vite 5, Zustand, etc.) o si se agregaron/
  quitaron librerías.
- Revisa si el sistema de auth simulado sigue igual (localStorage +
  Context) o cambió de enfoque.
- Lista los flujos funcionales que SÍ están completos y funcionando
  hoy, distinguiéndolos de los que están a medias o no se hicieron.

### Para el Paso 3 (backend)
- Confirma si la carpeta `backend/` sigue vacía o si ya se empezó
  algo ahí.
- Si hay código de backend, descríbelo igual que el frontend: stack,
  estructura, qué endpoints existen.

### Para el Paso 4
- Si encuentras evidencia en el código, commits, o documentación de
  qué se planeó como "Paso 4" (puede ser integración real con backend,
  PostgreSQL, deployment, testing, CI/CD), documéntalo en su sección.
- Si no encuentras evidencia, deja la sección como "no definido
  todavía" pero pregunta explícitamente al usuario al final de tu
  respuesta cuál es el alcance del Paso 4.

### Sección 4 — Contratos de datos
- Extrae los tipos reales de TODAS las entidades desde
  `frontend/src/mock/*.ts` y los `types/*.ts` de cada feature.
- Documéntalos como interfaces TypeScript completas, igual de
  detalladas que estarían en un schema de API.
- Indica explícitamente las relaciones entre entidades (qué campo
  referencia a qué otra entidad, ej: `Booking.propertyId → Property.id`).

### Sección 5 — Viabilidad del Paso 3
Responde con un veredicto claro, una de estas tres opciones:
- **Viable ahora** — el frontend tiene contratos de datos estables y
  completos, los flujos funcionan, no hay bloqueos.
- **Viable parcialmente** — se puede empezar el backend pero hay
  partes del frontend que aún están cambiando y podrían requerir
  ajustar los contratos después.
- **No viable todavía** — hay features incompletas, tipos inconsistentes,
  o decisiones de arquitectura sin tomar que deben resolverse antes.

Para cualquier veredicto, lista los endpoints concretos y sus
schemas de request/response basados en los contratos reales
encontrados (no en los planeados).

## Restricciones de tu respuesta

- No elimines ninguna sección del documento original, aunque esté
  vacía — complétala o actualízala, no la borres.
- Mantén el mismo formato Markdown, mismos títulos de sección.
- Donde algo siga igual a lo planeado, simplemente confírmalo en
  "Estado real verificado: ✅ Confirmado sin cambios".
- Donde algo cambió, sé específico: qué decía antes, qué es ahora.
- Al final de tu respuesta completa, antes de cerrar, deja un changelog
  corto fuera del documento (no dentro del .md) resumiendo en 3-5 viñetas
  qué fue lo que cambió desde la última versión de este archivo.
- No toques `legacy/` ni hagas commits — solo lectura y la entrega
  de este `.md` actualizado.

## Entregable

El archivo `.md` completo y actualizado, listo para reemplazar
`frontend/docs/contexto-migracion-nexu.md`.
````

---

## Historial de versiones de este documento

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | Inicial | Documento base creado a partir del plan de migración acordado en conversación. Pasos 1 y 2 documentados como "planeados/ejecutados" sin auditoría de código todavía. Pasos 3 y 4 marcados como pendientes. |
| 2.0 | 2026-06-25 | Primera auditoría de código completa. Pasos 1–3 verificados contra el repositorio real. Sección 4 poblada con 16 interfaces/tipos reales. Sección 5 con primer veredicto ("Viable parcialmente") y endpoints concretos. Identificadas: 2 dependencias no documentadas (clsx, tailwind-merge), storage key legacy ('smart_user'), duplicación de tipos en mock vs types/, y wizard sin soporte real de fotos ni coordenadas. Paso 4 definido (integración FE↔BE). Paso 5 agregado (PostgreSQL como rediseño, no port de Oracle). |
