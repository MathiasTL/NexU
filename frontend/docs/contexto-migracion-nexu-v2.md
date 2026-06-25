# NexU — Contexto de Migración v2

*(Actualizado: 2026-06-25 — Refleja el estado real del código auditado en esta fecha)*

> **Este documento es la fuente de verdad de la migración.** Reemplaza completamente la v1
> (`contexto-migracion-nexu.md`). Cada sección refleja lo que realmente existe en el
> repositorio, no lo que se planeó. Para futuras auditorías, ver la sección 6.

---

## 1. Visión general del proyecto

**NexU** es una plataforma de alojamiento universitario en Lima, Perú. Los estudiantes
encuentran habitaciones, departamentos y estudios cerca de sus universidades; los
propietarios publican y gestionan sus espacios.

Fue originalmente construida como "Smart" (monorepo Next.js + Oracle). Está siendo
migrada a una arquitectura desacoplada frontend/backend, con un cambio de dominio:
de alquiler turístico por noches a alquiler estudiantil por meses.

### Stack original (legacy — solo referencia, no se modifica)

- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- NextAuth.js 4 (Google OAuth + credentials)
- Oracle Database 21c con stored procedures
- Google Cloud Storage para imágenes
- Leaflet + React Leaflet

### Reglas vigentes para toda la migración

1. **Eliminar Oracle por completo** — no se migra, se descarta.
2. **No implementar PostgreSQL todavía** — el backend debe quedar con capa de repositorio
   abstracta pero sin base de datos real por ahora.
3. **Frontend independiente del backend, primero** — construido con datos mock internos.
4. **El backend se construye después**, usando los contratos de datos que el frontend ya validó.
5. **No hacer commits automáticos** — los agentes de IA dejan cambios en el working tree.
6. **No modificar `legacy/`** — es solo consulta de referencia.

---

## 2. Estado de la migración por pasos

### Paso 1 — Legacy archivado

**Estado:** ✅ Completo y confirmado.

```
nexu/
├── legacy/          ← proyecto Next.js + Oracle original (solo lectura)
├── frontend/        ← nuevo proyecto React + Vite (activo)
├── backend/         ← placeholder (.gitkeep únicamente)
└── README.md
```

- `legacy/` contiene el proyecto Next.js completo sin modificaciones.
- Solo existe `legacy/.env.example`. No hay `.env` ni `.env.local` con valores reales.
- El directorio es de solo lectura en la práctica.

---

### Paso 2 — Frontend (React + Vite)

**Estado:** ✅ Implementado con alcance ampliado respecto a la v1.

El frontend fue extendido significativamente más allá de lo documentado en la v1 para
cubrir el dominio estudiantil universitario (Plan UX/Semiótica, fases 1–6).

#### Stack confirmado (package.json real)

| Dependencia | Versión |
|---|---|
| react | 18.3.0 |
| vite | 5.3.0 |
| typescript | 5.5.0 |
| react-router-dom | 6.24.0 |
| tailwindcss | 3.4.0 |
| zustand | 4.5.0 |
| leaflet + react-leaflet | 1.9.4 + 4.2.1 |
| lucide-react | 0.383.0 |
| date-fns | 3.6.0 |
| clsx | 2.1.1 |
| tailwind-merge | 2.3.0 |

No se agregaron dependencias nuevas de UI ni de fetching HTTP. No hay testing framework instalado.

#### Paleta de colores (tailwind.config.ts)

La paleta fue extendida con tokens semánticos para NexU:

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#E8813A` (coral) | CTAs, acentos, estados activos |
| `secondary` | `#1A3C6E` (azul institucional) | Navbar, cabeceras, confianza |
| `success` | `#16A34A` | Disponibilidad, verificación |
| `warning` | `#F59E0B` | Baja disponibilidad, advertencias |
| `danger` | `#DC2626` | Errores, no disponible |

Escala completa 50–900 para `primary` y `secondary`. Todas las referencias `blue-*` heredadas
fueron migradas a `primary-*` / `secondary-*`.

#### Auth simulado (AuthContext.tsx)

- Sistema: `localStorage` + React Context ✅
- Storage key: `'nextu_user'` ✅ (corregida desde `'smart_user'` de la v1)
- `ProtectedRoute` acepta `requiredRole?: string` para rutas de host.
- El contexto expone `setAuthUser(user)` — permite actualizar perfil sin re-login.
- `lifestylePreferences` se persiste como parte del objeto `AuthUser` en localStorage.

#### Favoritos (favorites.store.ts)

- Implementado con Zustand + `persist` middleware.
- Key de localStorage: `'nextu_favorites_v1'`.
- Expone `toggle(id)`, `isFavorite(id)`, `ids[]`.

#### Patrón de servicios — confirmado y extendido

Todos los `*.service.ts` siguen el patrón con `delay()` como única capa que toca `src/mock/`.
Servicios existentes: `auth.service`, `property.service`, `booking.service`, `account.service`,
`host.service`, `review.service`. Ningún componente o hook importa mocks directamente.

#### Rutas registradas (router/index.tsx)

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | PropertiesHomePage | público |
| `/search` | SearchPage | público |
| `/properties/:id` | PropertyDetailPage | público |
| `/login` | LoginPage | público |
| `/register` | RegisterPage | público |
| `/recommendations` | RecommendationsPage | público |
| `/account` | AccountLayout (ProtectedRoute) | autenticado |
| `/account/profile` | ProfilePage | autenticado |
| `/account/personal-info` | PersonalInfoPage | autenticado |
| `/account/bookings` | MyBookingsPage | autenticado |
| `/account/notifications` | NotificationsPage | autenticado |
| `/account/messages` | MessagesPage | autenticado |
| `/account/favorites` | FavoritesPage | autenticado |
| `/account/preferences` | PreferencesPage | autenticado |
| `/host` | HostDashboardPage (ProtectedRoute rol=host) | host |
| `/host/properties` | HostPropertiesPage | host |
| `/host/reservations` | HostReservationsPage | host |
| `/host/reviews` | HostReviewsPage | host |
| `/host/new-property` | NewPropertyWizard | host |

**Diferencia respecto a v1:** se agregaron `/recommendations`, `/account/favorites`,
`/account/preferences`.

#### Flujos funcionales — estado real

| Flujo | Estado |
|---|---|
| Auth (login / register / logout / persistencia) | ✅ Completo |
| Registro 2-pasos: RoleSelector → RegisterForm (con PasswordInput + GoogleButton placeholder) | ✅ Completo |
| Home con hero, búsqueda, filtros rápidos por tipo, CTA recomendaciones | ✅ Completo |
| Búsqueda con mapa Leaflet, chips de tipo, filtros avanzados (AdvancedFilters modal) | ✅ Completo |
| Detalle de propiedad (galería, badges, disponibilidad, distancia a universidad, booking card) | ✅ Completo |
| Checkout y confirmación (14% tarifa de servicio, SuccessModal) | ✅ Completo |
| Mis Reservas (lista + filtros por estado + BookingDetailModal) | ✅ Completo |
| Favoritos persistentes con Zustand + localStorage | ✅ Completo |
| Página /account/favorites con listado y estado vacío | ✅ Completo |
| Preferencias de convivencia (/account/preferences) | ✅ Completo |
| Score de compatibilidad en PropertyCard (cuando hay prefs guardadas) | ✅ Completo |
| Wizard recomendaciones guiadas /recommendations (4 pasos, resultados ordenados) | ✅ Completo |
| Mapa con pins por disponibilidad (verde/ámbar/rojo) y capa de universidades | ✅ Completo |
| Host Dashboard (DashboardStats + ActivityFeed) | ✅ Completo |
| Host — mis propiedades | ✅ Completo |
| Host — reservaciones con panel de detalle y cambio de estado | ✅ Completo |
| Host — reseñas recibidas | ✅ Completo |
| Wizard nueva propiedad (9 pasos) | ⚠️ Parcial — ver nota wizard |
| Account — perfil y datos personales editables | ✅ Completo |
| Account — notificaciones con marcar como leída | ✅ Completo |
| Account — mensajería (lista + envío) | ✅ Completo |
| Modo oscuro | ❌ No implementado |
| Persistencia de filtros de búsqueda entre sesiones | ❌ No implementado |
| Push notifications | ❌ No implementado (ni planeado para frontend) |

**Nota wizard:** El wizard de 9 pasos funciona y publica propiedades. El Step5 (fotos)
es un placeholder — acepta URLs de imagen en texto pero no sube archivos reales.
`CreatePropertyDraft` no incluye `pricePerMonth`, `nearestUniversity`,
`distanceToUniversityMinutes` ni `availabilityStatus` — la propiedad creada recibe
defaults del `property.service.create()`.

---

### Paso 3 — Backend (FastAPI)

**Estado:** ⏳ No iniciado.

`backend/` contiene únicamente `.gitkeep`. No hay código de backend de ningún tipo.

Diseño previsto: Python 3.12+, FastAPI, arquitectura `routers → controllers →
services → repositories`, con interfaz abstracta de repositorio para facilitar
la migración posterior a PostgreSQL. Ver sección 5 para los endpoints propuestos.

---

### Paso 4 — Integración frontend ↔ backend

**Estado:** ⏳ No iniciado — depende del Paso 3.

Alcance: reemplazar cada `*.service.ts` del frontend por llamadas HTTP al backend.
Los componentes y páginas **no deben requerir cambios** gracias al patrón de servicios.

Tareas pendientes de este paso:
- Agregar cliente HTTP (fetch nativo o axios).
- Reemplazar `delay()` + arrays mock por `fetch('/api/...')` en cada `*.service.ts`.
- Gestión de tokens JWT (backend → localStorage o cookie httpOnly).
- Manejo de errores HTTP en los servicios.
- Eliminar `src/mock/` una vez conectados todos los servicios.

---

## 3. Estructura real de frontend/src/

```
frontend/src/
├── core/
│   ├── auth/
│   │   ├── AuthContext.tsx            ← storage key 'nextu_user', expone setAuthUser()
│   │   ├── ProtectedRoute.tsx
│   │   └── useAuth.ts
│   ├── router/
│   │   └── index.tsx                  ← 19 rutas registradas
│   └── store/
│       ├── ui.store.ts                ← isNavOpen, activeModal
│       └── favorites.store.ts         ← Zustand + persist, key 'nextu_favorites_v1'
├── mock/
│   ├── users.mock.ts                  ← 3 usuarios con lifestylePreferences opcionales
│   ├── properties.mock.ts             ← 8 propiedades universitarias Lima
│   ├── bookings.mock.ts
│   ├── reviews.mock.ts
│   ├── amenities.mock.ts
│   ├── notifications.mock.ts
│   └── messages.mock.ts
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx          ← PasswordInput + GoogleButton + demo hints
│   │   │   ├── RegisterForm.tsx       ← role prop, terms checkbox, PasswordInput, GoogleButton
│   │   │   └── RoleSelector.tsx       ← cards Estudiante / Propietario (paso 1 del registro)
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx       ← flujo 2 pasos: RoleSelector → RegisterForm
│   │   ├── services/ auth.service.ts
│   │   └── types/ auth.types.ts       ← AuthUser incluye lifestylePreferences?
│   ├── properties/
│   │   ├── components/
│   │   │   ├── PropertyCard.tsx       ← badge compatibilidad + badge disponibilidad + favorito
│   │   │   ├── PropertyGallery.tsx
│   │   │   ├── PropertyBasicInfo.tsx  ← badges roomType, availability, verifiedHost + pricePerMonth
│   │   │   ├── PropertyAmenities.tsx
│   │   │   ├── PropertyHouseRules.tsx
│   │   │   ├── PropertyReviews.tsx
│   │   │   ├── PropertyHostInfo.tsx   ← copy "propietario"
│   │   │   ├── PropertyBookingCard.tsx ← pricePerMonth, warning disponibilidad
│   │   │   ├── CheckoutModal.tsx      ← copy "personas", "propietario"
│   │   │   ├── SuccessModal.tsx
│   │   │   ├── PropertySearchMap.tsx  ← pins por disponibilidad, capa universidades, leyenda
│   │   │   └── AdvancedFilters.tsx    ← modal 4 secciones, z-index 1101, backdrop 1100
│   │   ├── pages/
│   │   │   ├── PropertiesHomePage.tsx ← hero, quick filters, CTA /recommendations
│   │   │   ├── SearchPage.tsx         ← integra AdvancedFilters, chips de tipo, mapa
│   │   │   └── PropertyDetailPage.tsx
│   │   ├── services/ property.service.ts
│   │   ├── types/ property.types.ts   ← Property con campos universitarios
│   │   └── utils/
│   │       └── compatibility.ts       ← calcCompatibility() + hasPreferences()
│   ├── bookings/
│   │   ├── components/ BookingStatusBadge, BookingCard, BookingDetailModal
│   │   ├── pages/ MyBookingsPage
│   │   ├── services/ booking.service.ts
│   │   └── types/ booking.types.ts
│   ├── reviews/
│   │   ├── components/ StarRating, ReviewCard, ReviewStats
│   │   ├── pages/ HostReviewsPage
│   │   ├── services/ review.service.ts
│   │   └── types/ review.types.ts
│   ├── host/
│   │   ├── components/ DashboardStats, ActivityFeed, HostPropertyCard, ReservationDetailPanel
│   │   ├── pages/ HostDashboardPage, HostPropertiesPage, HostReservationsPage
│   │   ├── wizard/ NewPropertyWizard + WizardNav + Step1…Step9 (9 pasos)
│   │   ├── services/ host.service.ts
│   │   └── types/ host.types.ts       ← CreatePropertyDraft, DashboardStats, WizardStep
│   ├── account/
│   │   ├── components/ ProfileForm, PersonalInfoForm, LifestylePreferencesForm
│   │   ├── pages/ ProfilePage, PersonalInfoPage, NotificationsPage, MessagesPage,
│   │   │         FavoritesPage, PreferencesPage
│   │   ├── services/ account.service.ts
│   │   └── types/ account.types.ts    ← LifestylePreferences, DEFAULT_LIFESTYLE
│   └── recommendations/
│       └── pages/ RecommendationsPage.tsx  ← wizard 4 pasos + resultados por score
└── shared/
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx, Input.tsx, Modal.tsx, Badge.tsx, Spinner.tsx, Avatar.tsx
    │   │   ├── StepHeader.tsx
    │   │   ├── PasswordInput.tsx       ← show/hide + medidor de fortaleza
    │   │   ├── GoogleButton.tsx        ← placeholder "Próximamente disponible"
    │   │   └── UniversityCombobox.tsx  ← portal dropdown, 14 universidades Lima
    │   ├── feedback/ EmptyState, ErrorMessage, LoadingSkeleton
    │   └── layout/ MainLayout, Navbar, MobileBottomNav,
    │               AccountLayout, AccountSidebar,
    │               HostLayout, HostSidebar, HostNavbar
    ├── constants/
    │   └── universities.ts             ← LIMA_UNIVERSITIES (14 universidades)
    ├── hooks/ useDebounce.ts, usePagination.ts
    └── utils/ cn.ts, formatters.ts, constants.ts
```

**Diferencias vs. v1:**

| Nuevo en v2 | Descripción |
|---|---|
| `features/recommendations/` | Feature completa: RecommendationsPage (wizard 4 pasos) |
| `features/properties/utils/compatibility.ts` | Algoritmo compatibilidad 0-100 pts |
| `features/account/components/LifestylePreferencesForm.tsx` | Formulario 9 preferencias de convivencia |
| `features/account/pages/PreferencesPage.tsx` | Página /account/preferences |
| `features/account/pages/FavoritesPage.tsx` | Página /account/favorites |
| `features/auth/components/RoleSelector.tsx` | Cards de selección de rol en registro |
| `shared/components/ui/PasswordInput.tsx` | Input con show/hide y medidor de fortaleza |
| `shared/components/ui/GoogleButton.tsx` | Botón Google (placeholder) |
| `shared/components/ui/UniversityCombobox.tsx` | Selector de universidad con portal |
| `shared/constants/universities.ts` | 14 universidades Lima |
| `features/properties/components/AdvancedFilters.tsx` | Modal filtros avanzados 4 secciones |
| `core/store/favorites.store.ts` | Store Zustand para favoritos persistentes |

---

## 4. Contratos de datos (interfaces TypeScript reales)

> Extraídos directamente de `frontend/src/features/*/types/*.ts` y `frontend/src/mock/*.ts`.
> Esta sección es la fuente de verdad para el diseño del backend FastAPI.

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
  role: 'tenant' | 'host'   // 'both' no es seleccionable al registrarse
}

interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'tenant' | 'host' | 'both'
  avatarUrl: string
  phone: string
  bio: string
  createdAt: string                          // 'YYYY-MM-DD'
  lifestylePreferences?: LifestylePreferences // opcional; se persiste en localStorage
}

// ─── User (mock completo — password NUNCA viaja al cliente) ─────────────────

interface User {
  id: number
  email: string
  password: string                           // ⚠ solo en mock
  firstName: string
  lastName: string
  role: 'tenant' | 'host' | 'both'
  avatarUrl: string
  phone: string
  bio: string
  createdAt: string
  lifestylePreferences?: LifestylePreferences
}

// ─── Property ───────────────────────────────────────────────────────────────

type RoomType = 'room' | 'apartment' | 'shared' | 'studio'
// Nota: el legacy y la v1 usaban 'shared_room'; ahora es 'shared'.

type AvailabilityStatus = 'available' | 'reserved' | 'unavailable'
// Nota: la v1 documentaba 'few_left' | 'occupied' | 'new'; el código real usa este enum.

interface Property {
  id: number
  hostId: number                             // → User.id
  title: string
  description: string
  shortDescription: string
  roomType: RoomType                         // ← NUEVO vs. v1
  pricePerMonth: number                      // ← NUEVO vs. v1 (precio principal en UI)
  pricePerNight: number                      // mantenido por compatibilidad con booking/wizard
  currency: 'PEN'
  location: string
  district: string
  city: string
  country: string
  lat: number
  lng: number
  images: string[]
  amenities: string[]                        // IDs de Amenity
  capacity: number
  bedrooms: number
  beds: number
  bathrooms: number
  rating: number                             // ⚠ denormalizado
  reviewsCount: number                       // ⚠ denormalizado
  checkinTime: string                        // 'HH:MM'
  checkoutTime: string
  houseRules: string[]
  status: 'active' | 'inactive'
  availabilityStatus: AvailabilityStatus     // ← NUEVO vs. v1
  verifiedHost: boolean                      // ← NUEVO vs. v1
  nearestUniversity: string                  // ← NUEVO vs. v1 (ej: 'PUCP', 'UNI')
  distanceToUniversityMinutes: number        // ← NUEVO vs. v1
  createdAt: string
}

interface PropertySearchFilters {
  district?: string
  roomType?: RoomType                        // ← NUEVO vs. v1
  nearestUniversity?: string                 // ← NUEVO vs. v1
  minPricePerMonth?: number                  // ← NUEVO vs. v1
  maxPricePerMonth?: number                  // ← NUEVO vs. v1
  minPrice?: number                          // precio por noche (mantiene compat.)
  maxPrice?: number
  capacity?: number
  amenities?: string[]
  query?: string                             // busca en title, district, nearestUniversity, description
}

// ─── AdvancedFilterValues (filtros avanzados del modal de búsqueda) ──────────
// Nota: estos valores se mapean a PropertySearchFilters en SearchPage.tsx

interface AdvancedFilterValues {
  housingType:      string          // → roomType
  bedrooms:         number | null
  bathrooms:        number | null
  nearUniversity:   string          // → nearestUniversity
  district:         string
  travelTime:       number          // minutos (UI solamente, no filtra en service)
  roommatesCount:   number | null
  sleepSchedule:    'morning' | 'night' | ''
  noiseLevel:       'low' | 'medium' | 'high' | ''
  petsAllowed:      boolean | null
  cleanliness:      'low' | 'medium' | 'high' | ''
  studyHabits:      'rarely' | 'sometimes' | 'often' | ''
  maxPrice:         number | null   // → maxPricePerMonth
  expenseSplit:     'equal' | 'per-room' | ''
  includedServices: string[]
}

// ─── LifestylePreferences ───────────────────────────────────────────────────

interface LifestylePreferences {
  sleepSchedule:    'early' | 'night' | ''
  studyHabits:      'light' | 'moderate' | 'intense' | ''
  noiseLevel:       'quiet' | 'moderate' | 'lively' | ''
  cleanliness:      'relaxed' | 'average' | 'strict' | ''
  guestsPolicy:     'never' | 'occasionally' | 'often' | ''
  smokingPolicy:    'no' | 'outside' | ''
  petsPolicy:       'no' | 'yes' | ''
  targetUniversity: string          // nombre corto: 'PUCP', 'UNI', etc.
  maxMonthlyBudget: number          // en PEN
}

// ─── Booking ────────────────────────────────────────────────────────────────

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

interface Booking {
  id: number
  propertyId: number                         // → Property.id
  tenantId: number                           // → User.id
  hostId: number                             // → User.id
  checkinDate: string                        // 'YYYY-MM-DD'
  checkoutDate: string
  guestCount: number
  nightCount: number
  pricePerNight: number
  serviceFee: number                         // 14% de (pricePerNight × nightCount)
  totalAmount: number
  currency: 'PEN'
  status: BookingStatus
  guestMessage: string | null
  hostNote: string | null
  createdAt: string
}

interface BookingDraft {                     // estado transitorio durante checkout en UI
  checkinDate: string
  checkoutDate: string
  guestCount: number
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
  propertyId: number                         // → Property.id
  bookingId: number                          // → Booking.id
  reviewerId: number                         // → User.id
  reviewerFirstName: string                  // ⚠ desnormalizado
  reviewerLastName: string                   // ⚠ desnormalizado
  reviewerAvatar: string                     // ⚠ desnormalizado
  rating: number                             // 1–5
  comment: string
  createdAt: string
}

// ─── Notification ───────────────────────────────────────────────────────────

type NotificationType = 'new_booking' | 'booking_confirmed' | 'new_review' | 'checkin_reminder'

interface Notification {
  id: number
  userId: number                             // → User.id (destinatario)
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string                          // ISO datetime
}

// ─── Messaging ──────────────────────────────────────────────────────────────

interface Message {
  id: number
  senderId: number                           // → User.id
  text: string
  createdAt: string
}

interface Conversation {
  id: number
  participants: number[]                     // [User.id, User.id]
  propertyId: number                         // → Property.id
  messages: Message[]
  lastMessageAt: string
}

// ─── Host Dashboard ─────────────────────────────────────────────────────────

interface DashboardStats {
  totalBookings: number
  totalRevenue: number
  averageRating: number
  averageTicket: number
}

// ─── Wizard nueva propiedad ─────────────────────────────────────────────────
// ⚠ Pendiente de extensión: no incluye pricePerMonth, nearestUniversity,
//   distanceToUniversityMinutes, availabilityStatus. El service.create() usa defaults.

interface CreatePropertyDraft {
  type: string                               // ID de tipo ('apartment', 'house', etc.)
  location: string
  district: string
  address: string
  capacity: number
  bedrooms: number
  beds: number
  bathrooms: number
  amenities: string[]
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

// ─── Paginación (global — disponible pero no usada en servicios mock) ────────

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
```

### Relaciones entre entidades

```
Property.hostId                  → User.id
Booking.propertyId               → Property.id
Booking.tenantId                 → User.id
Booking.hostId                   → User.id
Review.propertyId                → Property.id
Review.bookingId                 → Booking.id
Review.reviewerId                → User.id
Notification.userId              → User.id     (destinatario)
Conversation.participants[*]     → User.id
Conversation.propertyId          → Property.id
Message.senderId                 → User.id
Property.amenities[*]            → Amenity.id
AuthUser.lifestylePreferences    → LifestylePreferences (embebido)
```

### Notas para el backend

1. **`Property.rating` / `reviewsCount`** son denormalizados en el mock. El backend
   debe calcularlos en query o mantener contadores. Si elige no devolverlos, la UI se rompe.
2. **`Review.reviewerFirstName/LastName/Avatar`** están copiados al crear. El backend
   puede normalizar (solo `reviewerId` + JOIN) o mantener la copia — la UI los consume
   directamente del objeto Review.
3. **`Booking.status`** inicia en `'confirmed'` en el mock (se omite el flujo de aprobación
   pending → confirmed del legacy). El backend puede implementar ese flujo si se desea.
4. **`CreatePropertyDraft`** no incluye los campos universitarios nuevos de `Property`
   (`nearestUniversity`, `distanceToUniversityMinutes`, `availabilityStatus`,
   `pricePerMonth`). El wizard debe extenderse antes de conectar el backend.
5. **`AdvancedFilterValues`** vs. **`PropertySearchFilters`**: hay una capa de mapeo en
   `SearchPage.tsx` (`housingType → roomType`, `nearUniversity → nearestUniversity`,
   `maxPrice → maxPricePerMonth`). Los campos de convivencia (sleepSchedule, noiseLevel,
   etc.) del modal avanzado **no se aplican al service** todavía — solo están en UI.

---

## 5. Viabilidad del Paso 3 — Evaluación actual

**Fecha:** 2026-06-25

**Veredicto: Viable parcialmente**

Los contratos de datos están estables y bien tipados en los dominios principales
(auth, properties, bookings, reviews, messaging, notifications). El patrón de
servicios es consistente al 100% — cada `*.service.ts` es el único punto de cambio
para conectar al backend. Los flujos de UI están completos y funcionando contra mocks.

**Puntos a resolver antes o durante el Paso 3:**

1. **Wizard incompleto para propiedades nuevas** — `CreatePropertyDraft` no incluye
   `pricePerMonth`, `nearestUniversity`, `distanceToUniversityMinutes` ni
   `availabilityStatus`. Si el backend los requiere al crear, el wizard debe extenderse.
2. **Filtros de convivencia del modal avanzado sin conectar** — `AdvancedFilterValues`
   tiene campos (sleepSchedule, noiseLevel, studyHabits, petsAllowed) que la UI recoge
   pero el `property.service.search()` no aplica. Decidir si filtrar en backend o
   mantenerlos solo para compatibilidad local.
3. **`Review` con campos desnormalizados** — definir estrategia de normalización.
4. **Step5 del wizard sin upload real** — solo acepta texto de URL; para producción
   se necesita endpoint de upload o integración con storage externo.

**Endpoints propuestos (basados en contratos reales)**

```
POST   /auth/login
  Request:  { email, password }
  Response: AuthUser

POST   /auth/register
  Request:  { firstName, lastName, email, password, role }
  Response: AuthUser

────────────────────────────────────────────────────────────
GET    /properties
  Response: Property[]   (solo status='active')

GET    /properties/:id
  Response: Property | 404

GET    /properties/search
  Query: district?, roomType?, nearestUniversity?, minPricePerMonth?, maxPricePerMonth?,
         minPrice?, maxPrice?, capacity?, amenities?, query?
  Response: Property[]

GET    /users/:hostId/properties
  Response: Property[]

POST   /properties
  Request:  CreatePropertyDraft + { hostId, nearestUniversity?, distanceToUniversityMinutes?,
            pricePerMonth?, images?, lat?, lng? }
  Response: Property

────────────────────────────────────────────────────────────
GET    /bookings?tenantId=:id
  Response: Booking[]

GET    /bookings?hostId=:id
  Response: Booking[]

POST   /bookings
  Request:  CreateBookingPayload
  Response: Booking

PATCH  /bookings/:id/status
  Request:  { status: BookingStatus }
  Response: 204

────────────────────────────────────────────────────────────
GET    /properties/:id/reviews
  Response: Review[]

GET    /reviews?propertyIds=1,2,3
  Response: Review[]

────────────────────────────────────────────────────────────
GET    /host/stats?hostId=:id
  Response: DashboardStats

GET    /host/activity?hostId=:id
  Response: Booking[]   (últimas 4, por createdAt desc)

────────────────────────────────────────────────────────────
PATCH  /users/:id/profile
  Request:  ProfileUpdatePayload
  Response: AuthUser

PATCH  /users/:id/preferences
  Request:  LifestylePreferences
  Response: AuthUser   (con lifestylePreferences actualizado)

GET    /users/:id/notifications
  Response: Notification[]

PATCH  /notifications/:id/read
  Response: 204

GET    /users/:id/conversations
  Response: Conversation[]

POST   /conversations/:id/messages
  Request:  { senderId: number; text: string }
  Response: Message

────────────────────────────────────────────────────────────
GET    /amenities
  Response: AmenityCategory[]
```

---

## 6. Fases del plan UX/semiótica — estado actual

El plan técnico `nextu-ux-semiotica-plan-tecnico.md` define 7 fases para transformar
el frontend de alquiler turístico a plataforma estudiantil universitaria.

| Fase | Objetivo | Estado | Notas |
|---|---|---|---|
| 1 | Rebranding y sistema visual | ✅ Completa | Paleta NexU coral/azul, copy "estudiante/propietario", Navbar centrada, footer actualizado |
| 2 | Marketplace estudiantil | ✅ Completa | 8 propiedades Lima, RoomType, pricePerMonth, distancia universidad, filtros por tipo/universidad |
| 3 | Confianza y mapa semántico | ✅ Completa | Pins por disponibilidad (verde/ámbar/rojo), capa universidades, badges verificado, popups con datos universitarios |
| 4 | Favoritos y persistencia | ✅ Completa | Favoritos: ✅ (Zustand + localStorage). Filtros de búsqueda persistentes: ✅ (key `nextu_search_filters_v1`) |
| 5 | Compatibilidad de roommates | ✅ Completa | LifestylePreferences, algoritmo 100 pts, badge en PropertyCard, PreferencesPage |
| 6 | Recomendación guiada tipo IA | ✅ Completa | Wizard 4 pasos en /recommendations, resultados ordenados por score de compatibilidad |
| 7 | Mejoras avanzadas | ❌ Pendiente | Modo oscuro, push notifications |

### Detalle por subsección del plan (6.1–6.14)

| Subsección | Descripción | Estado |
|---|---|---|
| 6.1 Identidad visual | NexU, paleta, copy estudiantil | ✅ Completa |
| 6.2 Home y propuesta de valor | Hero universitario, beneficios, filtros rápidos, CTA recomendaciones | ✅ Completa |
| 6.3 Modelo de datos propiedades | roomType, pricePerMonth, nearestUniversity, availabilityStatus, verifiedHost | ✅ Completa |
| 6.4 Búsqueda y filtros | Filtros universitarios, panel avanzado colapsable; convivencia (petsAllowed, quietHours, hasWorkspace) conectados al service | ✅ Completa |
| 6.5 Tarjeta de propiedad | Precio mensual, badge disponibilidad, badge verificado, distancia, compatibilidad | ✅ Completa |
| 6.6 Favoritos | localStorage, FavoritesPage, persistencia | ✅ Completa |
| 6.7 Mapa interactivo semiótico | Pins por disponibilidad, capa universidades, leyenda, popups | ✅ Completa |
| 6.8 Detalle de propiedad | Campos universitarios, badge disponibilidad, copy "propietario/personas" | ✅ Completa |
| 6.9 Publicación de propiedad | Step1 tipos estudiantiles (4 cards), Step2 con UniversityCombobox + slider distancia, Step8 con pricePerMonth + availabilityStatus, Step9 con resumen completo | ✅ Completa |
| 6.10 Perfil estudiantil y roommates | LifestylePreferences, algoritmo, PreferencesPage, score en cards | ✅ Completa |
| 6.11 Chat y notificaciones | Copy "propietarios/estudiantes" actualizado. Mocks de mensajes y notificaciones reescritos en contexto universitario (ciclos académicos, convivencia, alquiler mensual) | ✅ Completa |
| 6.12 Recomendación guiada | RecommendationsPage wizard 4 pasos, explicación de razones | ✅ Completa |
| 6.13 Modo oscuro | No implementado | ❌ Pendiente |
| 6.14 Offline parcial y rendimiento | Favoritos en localStorage ✅; filtros de búsqueda persistentes ✅ (key `nextu_search_filters_v1`); lazy loading imágenes ✅ | ✅ Completa |

---

## 7. Lo que falta para cerrar el frontend

> **Para la IA que continúe este trabajo:** El Paso 2 (frontend mock-first) está **completo**.
> Todos los ítems de prioridad alta y media están implementados. El frontend está en
> condiciones de conectarse al backend (Paso 3). Solo quedan los ítems de prioridad baja
> (modo oscuro, polígonos oficiales de campus, migración del flujo de booking a mensual),
> que no bloquean el Paso 3.
> Puedes leer las secciones 3 y 4 de este documento para entender la estructura de
> archivos y los contratos de datos exactos antes de tocar cualquier cosa.

---

### ✅ Completado — UX y responsive (ya implementado)

> Cambios implementados el 2026-06-25 adicionales a los de alta prioridad.

3. ~~**Navbar responsive: separar desktop y mobile**~~ — **HECHO.**
   - Desktop: navbar superior con 3 columnas centradas (Logo | Links | Cuenta). Sin hamburger.
   - Mobile: navbar superior simplificada (solo Logo + botón Acceder si no autenticado,
     o avatar si autenticado). El menú hamburger fue eliminado.
   - **Nuevo `MobileBottomNav.tsx`** (`src/shared/components/layout/MobileBottomNav.tsx`):
     bottom bar fijo en mobile con 5 tabs (Inicio, Explorar, Para ti, Guardados, Cuenta).
     Usa `NavLink` con indicador activo en color coral. Respeta `safe-area-inset-bottom`
     para notch de iPhone.
   - `MainLayout.tsx` actualizado: incluye `<MobileBottomNav />`, `pb-16 md:pb-0` en `<main>`,
     footer oculto en mobile (`hidden md:block`).

4. ~~**Mapa: tile revertido + tipografía mejorada + bordes de campus**~~ — **HECHO (tile) / ⚠️ PARCIAL (campus).**

   **Tile layer:** revertido a **OpenStreetMap estándar** (se descartó CartoDB Positron).

   **Tipografía de divIcons mejorada:**
   - Labels universitarios: `font-family: Inter/system`, `font-size: 10px`, `font-weight: 600`,
     `letter-spacing: .4px`. Antes: 9px sin font-family explícito.
   - Popups: `font-family` inline en el contenedor del popup.

   **Bordes de campus universitario — ⚠️ PARCIAL (polígonos aproximados, arquitectura lista):**

   **Arquitectura implementada:**
   - Datos centralizados en `src/shared/data/universityCampuses.ts` como GeoJSON
     `FeatureCollection` con interfaz `CampusFeature` tipada.
   - Componente usa `<GeoJSON>` de `react-leaflet`, que renderiza todos los polígonos
     en un único pase genérico; la lógica no conoce nombres de universidades.
   - Para agregar una universidad nueva: solo agregar una entrada al array `features`.
     No se modifica ningún otro archivo.
   - Para reemplazar un polígono aproximado por uno oficial: solo cambiar `geometry.coordinates`
     y `status: 'official'` en la entrada correspondiente.
   - Los polígonos `official` se muestran con borde sólido; los `approximate` con borde punteado
     (`dashArray: '6 4'`) — distinción visual automática.

   **Universidades cubiertas (10):** PUCP, UNMSM, UNI, UPC, ULIMA, UP, USIL, UNFV, UNAC, UPCH.

   **Corrección del ícono de label:**
   - Problema anterior: `iconAnchor: [20, 10]` era fijo e incorrecto para textos de distinta longitud.
   - Solución: `iconSize: [0, 0]` + `iconAnchor: [0, 0]` coloca el punto de anclaje en la coordenada;
     el div interior usa `position:absolute; transform:translate(-50%,-50%)` para autocentrarse
     sin depender del ancho del texto. Funciona para "UP" y "UNMSM" sin ajuste manual.

   **Por qué sigue siendo PARCIAL:**
   - Los polígonos son aproximaciones manuales basadas en coordenadas conocidas de cada campus.
     No reflejan el contorno exacto del terreno oficial.
   - Para precisión real se necesita GeoJSON oficial (ver ítem B4 en prioridad baja, actualizado).

---

### ✅ Completado — prioridad alta (ya implementado)

> Estos ítems estaban pendientes en la auditoría y fueron resueltos el 2026-06-25.
> No requieren trabajo adicional.

1. ~~**Extender `CreatePropertyDraft` y el wizard**~~ — **HECHO.**
   - `host.types.ts`: `CreatePropertyDraft` ahora incluye `roomType`, `pricePerMonth`,
     `nearestUniversity`, `distanceToUniversityMinutes`, `availabilityStatus`.
   - `Step1PropertyType.tsx`: 4 cards estudiantiles (Habitación / Compartido / Estudio /
     Departamento) con descripción, sets `draft.roomType` directamente.
   - `Step2Location.tsx`: añade `UniversityCombobox` + slider de minutos a pie.
   - `Step8Price.tsx`: `pricePerMonth` como precio principal, selector de `availabilityStatus`.
   - `Step9Review.tsx`: muestra todos los campos nuevos en la pantalla de revisión.
   - `NewPropertyWizard.tsx`: `INITIAL_DRAFT` y `handleSubmit` actualizados.

2. ~~**Conectar filtros de convivencia al service**~~ — **HECHO.**
   - `PropertySearchFilters` extendido con `petsAllowed?`, `quietHours?`, `hasWorkspace?`.
   - `property.service.search()` aplica los tres filtros contra amenities del mock.
   - `SearchPage.tsx` mapea: `petsAllowed===true → petsAllowed`, `noiseLevel==='low' → quietHours`,
     `studyHabits==='often' → hasWorkspace`.

---

### ✅ Completado — prioridad media (implementado 2026-06-25)

#### M1 — Persistencia de filtros de búsqueda entre sesiones — **HECHO.**

**Archivo modificado:** `src/features/properties/pages/SearchPage.tsx`

- Al montar: lee `nextu_search_filters_v1` de localStorage con IIFE + try/catch e inicializa
  `roomType`, `advFilters` y `query` desde ahí. El param URL `?q=` sigue como último fallback
  para `query`.
- `useEffect` dedicado (independiente del efecto de búsqueda) persiste los tres valores en
  cada cambio: `localStorage.setItem('nextu_search_filters_v1', JSON.stringify({ advFilters, roomType, query }))`.

---

#### M2 — Mocks de mensajes y notificaciones en contexto NexU — **HECHO.**

**Archivos modificados:** `src/mock/messages.mock.ts`, `src/mock/notifications.mock.ts`

- **Mensajes:** 3 conversaciones reescritas con contexto universitario — disponibilidad para
  ciclo 2026-2, servicios incluidos (agua/internet/luz), reglas de convivencia (silencio 11 pm,
  limpieza rotativa), contratos mensuales. Mismos IDs de usuario y propiedad.
- **Notificaciones:** 4 notificaciones reescritas — solicitud de alquiler mensual near PUCP,
  reseña de estudiante en estudio near ULIMA, cuarto compartido reservado para ciclo 2026-2,
  recordatorio de entrega de llaves. Sin rastro de terminología turística.
- Interfaces `Message`, `Conversation`, `Notification` sin cambios — solo el contenido de los arrays.

---

#### M3 — Step5 del wizard con previsualización local de fotos — **HECHO.**

**Archivos modificados:** `src/features/host/wizard/Step5Photos.tsx`, `src/features/host/types/host.types.ts`

- `CreatePropertyDraft` extendido con `images?: string[]`.
- `Step5Photos.tsx` reescrito: `<input type="file" accept="image/*" multiple>` oculto, activado
  por clic o drag & drop sobre el área de carga.
- Previsualización local con `URL.createObjectURL(file)` — sin servidor.
- Grilla de miniaturas (`grid-cols-3 sm:grid-cols-4`, `aspect-square`, `object-cover`) con
  botón × por foto para eliminar.
- Label del botón "Continuar" cambia: `"Continuar sin fotos"` si no hay fotos, `"Continuar"` si hay.
- Para conectar al backend: el `handleSubmit` del wizard deberá enviar los archivos a
  `POST /properties/upload-images` antes de crear la propiedad.

---

### 🔵 Pendiente — prioridad baja (opcional para esta etapa)

Estos ítems son mejoras de producto, no bloquean ni el backend ni la demo funcional.
**Implementar después del Paso 3 o cuando el producto lo requiera.**

#### B1 — Modo oscuro

- Habilitar `darkMode: 'class'` en `tailwind.config.ts`.
- Agregar `darkMode: boolean` al store `src/core/store/ui.store.ts` (Zustand + persist).
- Agregar toggle en Navbar (ícono sol/luna).
- Aplicar variantes `dark:` gradualmente: layout, cards, inputs, modales.
- **Riesgo:** requiere revisar contraste en textos secundarios y fondos claros.
- No mezclar con otros cambios grandes.

#### B2 — Explicación de razones de compatibilidad en resultados de búsqueda

- `calcCompatibility()` ya retorna `{ score, reasons[] }`. Las `reasons` no se muestran en
  ningún lugar actualmente.
- Agregar un tooltip o panel expandible en `PropertyCard` que muestre las razones cuando
  el badge de compatibilidad está visible.
- Ejemplo: `"✅ Cerca de PUCP · ✅ Dentro de tu presupuesto · ✅ Espacio sin humo"`.

#### B4 — Actualizar polígonos de campus a límites oficiales

**Estado de la arquitectura:** YA IMPLEMENTADA. El componente ya usa `<GeoJSON>` y la
estructura de datos está lista. Solo falta reemplazar las coordenadas aproximadas.

**Archivo a editar:** `src/shared/data/universityCampuses.ts`

**Qué hacer para cada universidad:**
1. Obtener datos GeoJSON de los límites reales. Fuentes recomendadas:
   - **Overpass API (OSM):**
     ```
     [out:json];
     (
       relation["amenity"="university"]["name"~"Universidad"]["addr:country"="PE"];
       way["amenity"="university"]["name"~"Universidad"]["addr:country"="PE"];
     );
     out geom;
     ```
     O buscar la universidad en https://www.openstreetmap.org y exportar el JSON de la relación.
   - **GeoJSON.io:** dibujar manualmente sobre satélite y exportar GeoJSON.
   - **Datos MINEDU / IDEP:** plataformas de datos abiertos del gobierno peruano.

2. En `universityCampuses.ts`, localizar la entrada correspondiente y:
   - Reemplazar `geometry.coordinates` con el anillo exterior del polígono oficial.
   - Cambiar `status: 'approximate'` → `status: 'official'`.
   - Actualizar `source` con la URL o referencia del dato.
   - Si el campus tiene múltiples áreas desconectadas, cambiar el tipo a
     `MultiPolygon` con `coordinates: [ring1, ring2, ...]` — el componente ya maneja
     ambos tipos porque `<GeoJSON>` de react-leaflet los soporta nativamente.

3. No se requiere ningún cambio en `PropertySearchMap.tsx`.

**Ejemplo de entrada actualizada:**
```ts
{
  type: 'Feature',
  properties: {
    id: 'pucp',
    abbr: 'PUCP',
    fullName: 'Pontificia Universidad Católica del Perú',
    status: 'official',                           // ← cambiar
    center: [-12.0702, -77.0803],
    source: 'OSM relation 1234567 — extraído 2026-07',  // ← actualizar
  },
  geometry: {
    type: 'Polygon',
    coordinates: [[ /* coordenadas oficiales */ ]],  // ← reemplazar
  },
},
```

---

#### B3 — Migrar `pricePerNight` del flujo de booking

- El flujo de reserva (`CheckoutModal`, `BookingDetailModal`, `booking.service`) aún calcula
  por noches. El modelo de alquiler universitario es mensual.
- Para migrar: cambiar `BookingDraft.checkinDate/checkoutDate` por `startDate` + `durationMonths`.
- Recalcular `totalAmount = pricePerMonth × durationMonths + serviceFee`.
- **Este es el cambio más invasivo de la lista** — afecta tipos, service, checkout y el panel
  de host. Hacerlo en coordinación con el diseño del endpoint `POST /bookings` del backend.

---

### 📋 Checklist de cierre del Paso 2

Marcar como ✅ cuando esté implementado y verificado con `npx tsc --noEmit`:

- [x] Rebranding NexU (paleta, copy, navbar)
- [x] Modelo de datos estudiantil (Property con campos universitarios)
- [x] Mock data (8 propiedades Lima con datos reales)
- [x] Búsqueda con filtros universitarios y de convivencia
- [x] Mapa con pins por disponibilidad y capa de universidades
- [x] Favoritos persistentes (Zustand + localStorage)
- [x] Compatibilidad de roommates (algoritmo + score en cards)
- [x] Wizard de publicación con campos universitarios
- [x] Página de preferencias de convivencia (/account/preferences)
- [x] Recomendaciones guiadas (/recommendations)
- [x] Registro 2 pasos (RoleSelector → RegisterForm)
- [x] Persistencia de filtros de búsqueda (M1)
- [x] Mocks de mensajes y notificaciones actualizados (M2)
- [x] Step5 wizard con previsualización de fotos (M3)

---

## Historial de versiones de este documento

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | (inicial) | Documento base a partir del plan de migración. Pasos 1–2 como planeados, Pasos 3–4 pendientes. |
| 2.0 | 2026-06-25 | Primera auditoría completa (v1). Pasos 1–3 verificados. 16 interfaces documentadas. Veredicto "Viable parcialmente". Storage key corregida. |
| 3.0 | 2026-06-25 | v2 inicial. Fases UX 1–6 documentadas. Nuevas entidades, rutas, endpoints propuestos. Alta prioridad identificada. |
| 4.0 | 2026-06-25 | Alta prioridad resuelta: wizard extendido (roomType, pricePerMonth, nearestUniversity, availabilityStatus, distancia), filtros convivencia conectados al service (petsAllowed/quietHours/hasWorkspace). Sección 7 reescrita con instrucciones para IA futura. Checklist de cierre agregado. |
| 5.0 | 2026-06-25 | Navbar responsive: desktop 3 columnas centradas, mobile con MobileBottomNav (5 tabs, bottom bar fijo). Hamburger eliminado. Mapa: tile CartoDB Positron (minimalista), tipografía Inter en divIcons y popups, zoomControl desactivado. |
| 6.0 | 2026-06-25 | Título de página corregido de "Smart" a "NexU" (index.html). Mapa revertido a OSM estándar. Tipografía mapa mejorada (Inter, 10px, 600). Bordes de campus universitario con Circle (aproximación circular, ⚠️ parcial — pendiente GeoJSON real en B4). |
| 7.0 | 2026-06-25 | Refactor completo de campus universitarios en mapa. Nuevo `src/shared/data/universityCampuses.ts` con GeoJSON FeatureCollection tipada para 10 universidades (PUCP, UNMSM, UNI, UPC, ULIMA, UP, USIL, UNFV, UNAC, UPCH). Arquitectura escalable: agregar universidad = 1 entrada en el array, sin tocar lógica. Polígonos distinguen 'official'/'approximate' visualmente. Ícono de label corregido con iconSize:[0,0]+CSS transform para autocentrado independiente del largo del texto. Sigue ⚠️ Parcial por coordenadas aproximadas. |
| 8.0 | 2026-06-25 | Prioridad media completada. M1: persistencia de filtros de búsqueda en localStorage (key `nextu_search_filters_v1`) en `SearchPage.tsx`. M2: mocks de mensajes y notificaciones reescritos en contexto universitario (ciclos académicos, convivencia, alquiler mensual). M3: `Step5Photos.tsx` reescrito con `<input type="file">`, drag & drop, previsualización local con `URL.createObjectURL` y grilla de miniaturas con botón de eliminación; `CreatePropertyDraft` extendido con `images?`. Paso 2 del frontend **completo**. |
