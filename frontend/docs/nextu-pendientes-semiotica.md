# NexU — Pendientes de Semiótica y 5W

*(Creado: 2026-06-25 — Basado en auditoría del plan `nextu-ux-semiotica-plan-tecnico.md`)*

> Este documento recoge las brechas semióticas y de experiencia 5W detectadas tras completar
> el Paso 2 del frontend. Todas las funcionalidades core están implementadas; lo que sigue
> aquí mejora la **comunicación** entre la plataforma y el usuario, que es el núcleo de la
> ingeniería semiótica: cada signo (badge, precio, botón) debe corresponder exactamente con
> su referente en el mundo del estudiante universitario limeño.

---

## Resumen ejecutivo

| ID | Ítem | Impacto semiótico | Esfuerzo | Prioridad |
|---|---|---|---|---|
| S1 | Razones de compatibilidad visibles | Alto | Bajo | Alta |
| S2 | Flujo de booking mensual (no por noches) | Alto | Alto | Media |
| S3 | Capa de transporte en mapa | Medio | Medio | Media |
| S4 | Áreas táctiles ≥ 44px en mobile | Bajo | Bajo | Baja |

---

## S1 — Razones de compatibilidad visibles

**Por qué es un problema semiótico:**
El badge `85% compatible` sin explicación es una caja negra. El usuario no puede decodificar
ese signo — no sabe *por qué* es compatible ni si confiar en él. El plan (sección 6.10)
exige mostrar razones con lenguaje humano: *"Cerca de PUCP · Dentro de tu presupuesto · Espacio sin humo"*.

**Estado actual:**
`calcCompatibility()` en `src/features/properties/utils/compatibility.ts` ya calcula y
devuelve `{ score, reasons: string[] }`. Las `reasons` están generadas pero se descartan:

- `PropertyCard.tsx:40` llama `calcCompatibility(prefs, property)` pero solo usa `.score`.
- `RecommendationsPage.tsx:74` llama `calcCompatibility(prefs, p).score` — `.reasons` nunca se extrae.

**Cambios requeridos:**

### S1-A — Tooltip de razones en `PropertyCard.tsx`

**Archivo:** `src/features/properties/components/PropertyCard.tsx`

Donde hoy dice:
```tsx
{compat && (
  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', compatBadgeClass(compat.score))}>
    {compat.score}% compatible
  </span>
)}
```

Reemplazar por un contenedor con `title` (tooltip nativo, sin dependencia nueva) y,
opcionalmente, una lista de reasons visible en hover/focus:

```tsx
{compat && compat.score > 0 && (
  <span
    title={compat.reasons.join(' · ')}
    className={cn('cursor-help rounded-full px-2.5 py-0.5 text-xs font-semibold', compatBadgeClass(compat.score))}
  >
    {compat.score}% compatible
  </span>
)}
```

El `title` nativo muestra el tooltip en desktop sin añadir ninguna dependencia.
Para mobile, agregar debajo del badge una línea de razones colapsada:

```tsx
{compat && compat.reasons.length > 0 && (
  <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
    {compat.reasons.join(' · ')}
  </p>
)}
```

### S1-B — Razones en `RecommendationsPage.tsx`

**Archivo:** `src/features/recommendations/pages/RecommendationsPage.tsx`

En el estado de resultados, guardar también `reasons`:
```tsx
// Cambiar:
const [results, setResults] = useState<{ property: Property; score: number }[]>([])

// Por:
const [results, setResults] = useState<{ property: Property; score: number; reasons: string[] }[]>([])
```

Al mapear:
```tsx
// Cambiar:
.map(p => ({ property: p, score: calcCompatibility(prefs, p).score }))

// Por:
.map(p => {
  const { score, reasons } = calcCompatibility(prefs, p)
  return { property: p, score, reasons }
})
```

Mostrar las razones debajo del badge en la lista de resultados:
```tsx
{score > 0 && (
  <div className="mt-1">
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', ...)}>
      {score}% compatible
    </span>
    {reasons.length > 0 && (
      <p className="mt-1 text-xs text-gray-500">{reasons.join(' · ')}</p>
    )}
  </div>
)}
```

**Validación:** `npx tsc --noEmit` sin errores. Verificar visualmente que el tooltip
aparece en desktop y las razones en mobile.

---

## S2 — Flujo de booking mensual (no por noches)

**Por qué es un problema semiótico:**
El usuario ve `S/680 / mes` en la tarjeta de propiedad, pero al iniciar el flujo de
reserva se encuentra con `S/150 × 3 noches`. El signo "precio mensual" no corresponde
a la operación que el sistema ejecuta. Es la contradicción semiótica más grave del frontend.

**Estado actual — inconsistencia detectada:**

| Componente | Qué muestra | Referente real |
|---|---|---|
| `PropertyBookingCard.tsx:43` | `S/680 / mes` | Precio mensual ✅ |
| `PropertyBookingCard.tsx:47` | `S/150/noche para estadías cortas` | Precio por noche ❌ |
| `PropertyBookingCard.tsx:113` | `S/150 × 3 noches` | Cálculo por noches ❌ |
| `CheckoutModal.tsx:30-33` | `nights × pricePerNight + 14% fee` | Todo por noches ❌ |

**Alcance del cambio — es el más invasivo de la lista:**

Este cambio afecta tipos, mocks, servicios, y tres componentes de UI. Debe coordinarse
con el diseño del endpoint `POST /bookings` del backend (Paso 3) para no hacer el
trabajo dos veces.

### Archivos a modificar

#### 1. `src/features/properties/types/property.types.ts`

```ts
// Reemplazar BookingDraft:
export interface BookingDraft {
  startMonth: string      // 'YYYY-MM' — mes de inicio
  durationMonths: number  // 1, 2, 3, 6, 12
  residentCount: number   // número de personas (no "guests")
}
```

#### 2. `src/features/bookings/types/booking.types.ts`

```ts
export interface Booking {
  id: number
  propertyId: number
  tenantId: number
  hostId: number
  startMonth: string         // 'YYYY-MM'
  durationMonths: number
  residentCount: number
  pricePerMonth: number
  serviceFee: number         // 14% de (pricePerMonth × durationMonths)
  totalAmount: number
  currency: 'PEN'
  status: BookingStatus
  guestMessage: string | null
  hostNote: string | null
  createdAt: string
}

export interface CreateBookingPayload {
  propertyId: number
  tenantId: number
  hostId: number
  startMonth: string
  durationMonths: number
  residentCount: number
  pricePerMonth: number
  serviceFee: number
  totalAmount: number
  currency: 'PEN'
  guestMessage?: string
}
```

#### 3. `src/features/properties/components/PropertyBookingCard.tsx`

- Reemplazar los date pickers de check-in/check-out por:
  - Selector de mes de inicio (`startMonth`) — puede ser un `<select>` con los 6 meses siguientes.
  - Selector de duración en meses: 1, 2, 3, 6, 12.
  - Input de número de residentes (1–6).
- Eliminar `calcNights`, `formatNights`, `pricePerNight`.
- Calcular: `subtotal = pricePerMonth × durationMonths`, `fee = subtotal × 0.14`, `total = subtotal + fee`.
- Eliminar la línea `S/150/noche para estadías cortas`.

#### 4. `src/features/properties/components/CheckoutModal.tsx`

- Recibir `draft: BookingDraft` con la nueva interfaz.
- Mostrar: `Inicio: agosto 2026 · 3 meses · 1 residente`.
- Calcular: `pricePerMonth × durationMonths + 14% = total`.
- Eliminar `calcNights`, `formatNights`, `pricePerNight`.

#### 5. `src/mock/bookings.mock.ts`

Adaptar los bookings mock para que usen `startMonth`, `durationMonths`,
`residentCount`, `pricePerMonth` en lugar de `checkinDate`, `checkoutDate`,
`nightCount`, `pricePerNight`.

#### 6. `src/features/bookings/components/BookingDetailModal.tsx` y `BookingCard.tsx`

Actualizar el display para mostrar `startMonth`, duración en meses y precio mensual.

#### 7. `src/features/host/pages/HostReservationsPage.tsx` y `ReservationDetailPanel.tsx`

Adaptar el panel de host para mostrar la misma información mensual.

**Orden de ejecución recomendado:**
1. Tipos (`BookingDraft`, `Booking`, `CreateBookingPayload`)
2. Mock (`bookings.mock.ts`)
3. `PropertyBookingCard` + `CheckoutModal` (UI del tenant)
4. `BookingCard` + `BookingDetailModal` (historial del tenant)
5. `ReservationDetailPanel` + `HostReservationsPage` (panel del host)
6. `booking.service.ts` (adaptar `create()` al nuevo payload)

**⚠️ Nota:** No hacer este cambio hasta tener definido el contrato del endpoint
`POST /bookings` del backend. El mock puede migrar antes, pero los tipos deben
ser los definitivos para evitar retrabajo en la integración.

---

## S3 — Capa de transporte en el mapa

**Por qué es un problema semiótico:**
Para un estudiante limeño, la pregunta *"¿cuánto tardo en llegar?"* no tiene solo una
respuesta a pie — también depende del Metropolitano, el Tren Eléctrico y los combis.
Sin esta capa, el mapa comunica geografía pero no viabilidad cotidiana. El plan (6.7)
pide específicamente esta capa como elemento de confianza.

**Cambios requeridos:**

### S3-A — Datos mock de transporte

**Archivo nuevo:** `src/shared/data/limaTransport.ts`

```ts
export interface TransportStop {
  id: string
  name: string
  type: 'metropolitano' | 'tren' | 'corredor'
  lat: number
  lng: number
}

export const LIMA_TRANSPORT_STOPS: TransportStop[] = [
  // Metropolitano — troncal
  { id: 'met-javier-prado',   name: 'Javier Prado',    type: 'metropolitano', lat: -12.0864, lng: -77.0428 },
  { id: 'met-angamos',        name: 'Angamos',          type: 'metropolitano', lat: -12.1100, lng: -77.0270 },
  { id: 'met-canada',         name: 'Canadá',           type: 'metropolitano', lat: -12.0935, lng: -77.0327 },
  { id: 'met-canaval',        name: 'Canaval y Moreyra',type: 'metropolitano', lat: -12.0985, lng: -77.0373 },
  { id: 'met-petit-thouars',  name: 'Petit Thouars',    type: 'metropolitano', lat: -12.0820, lng: -77.0319 },
  // Tren Eléctrico — Línea 1
  { id: 'tren-la-cultura',    name: 'La Cultura',       type: 'tren',          lat: -12.0863, lng: -77.0006 },
  { id: 'tren-arriola',       name: 'Arriola',          type: 'tren',          lat: -12.0726, lng: -77.0106 },
  { id: 'tren-san-borja',     name: 'San Borja Sur',    type: 'tren',          lat: -12.1053, lng: -76.9986 },
  { id: 'tren-villa-maria',   name: 'Villa María',      type: 'tren',          lat: -12.1588, lng: -76.9648 },
  // Corredor Azul
  { id: 'cor-jockey-plaza',   name: 'Jockey Plaza',     type: 'corredor',      lat: -12.0888, lng: -76.9792 },
]
```

### S3-B — Toggle de capa y marcadores en `PropertySearchMap.tsx`

**Archivo:** `src/features/properties/components/PropertySearchMap.tsx`

1. Agregar estado `showTransport: boolean` (default `false` para no saturar el mapa al abrir).
2. Agregar botón toggle sobre el mapa: `🚌 Transporte` que activa/desactiva la capa.
3. Cuando `showTransport === true`, renderizar un `<Marker>` por cada parada con un
   `divIcon` minimalista diferenciado por tipo:
   - Metropolitano: círculo rojo pequeño con `M`
   - Tren: círculo azul con `T`
   - Corredor: círculo verde con `C`
4. Popup de cada parada: nombre y tipo de transporte.

**Ejemplo de divIcon para parada de Metropolitano:**
```ts
const transportIcon = (type: TransportStop['type']) => L.divIcon({
  className: '',
  html: `<div style="
    background: ${type === 'metropolitano' ? '#DC2626' : type === 'tren' ? '#1A3C6E' : '#16A34A'};
    color: white; border-radius: 50%; width: 20px; height: 20px;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; font-family: system-ui;
    box-shadow: 0 1px 3px rgba(0,0,0,.4);
  ">${type === 'metropolitano' ? 'M' : type === 'tren' ? 'T' : 'C'}</div>`,
  iconSize: [0, 0],
  iconAnchor: [10, 10],
})
```

5. Actualizar la leyenda del mapa para incluir los iconos de transporte cuando la capa esté activa.

**Validación:** Verificar que el toggle funciona, que los marcadores no bloquean los pins
de propiedades, y que el mapa no se siente sobrecargado con ambas capas visibles.

---

## S4 — Áreas táctiles ≥ 44px en mobile

**Por qué es un problema:**
El plan (sección 4, principios técnicos) requiere áreas táctiles mínimas de 44px.
El `Button` en tamaño `md` actual tiene `py-2` (16px padding) + `text-sm` (~20px) ≈ 36px,
por debajo del mínimo. Afecta botones de filtro, acciones secundarias y chips de tipo en
`SearchPage`.

**Archivo:** `src/shared/components/ui/Button.tsx`

```ts
// Cambiar:
const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

// Por:
const sizes = {
  sm: 'px-3 py-1.5 text-sm',          // ~32px — aceptable para acciones secundarias pequeñas
  md: 'px-4 py-2.5 text-sm',          // ~40px — próximo al mínimo
  lg: 'px-6 py-3 text-base',          // ~48px — cumple 44px ✅
}
```

Adicionalmente, los chips de tipo en `SearchPage.tsx` (`px-3 py-1 rounded-full`) tienen
altura ~30px. Aumentar a `py-2` para llevarlos a ~36–38px, aceptable para elementos
secundarios.

**Validación:** Probar en Chrome DevTools con simulación de iPhone 390px. Usar la herramienta
de accesibilidad para verificar que los targets son >= 40px.

---

## Checklist de cierre de semiótica

Marcar como ✅ cuando esté implementado y verificado visualmente:

- [x] S1-A — Razones de compatibilidad visibles en `PropertyCard` (tooltip + texto)
- [x] S1-B — Razones de compatibilidad en `RecommendationsPage`
- [x] S2 — Flujo de booking migrado a `startMonth + durationMonths`
- [x] S3-A — Datos mock de transporte en `limaTransport.ts`
- [x] S3-B — Capa de transporte toggle en `PropertySearchMap`
- [x] S4 — Tamaños de `Button` y chips ajustados para touch targets

---

## Relación con el documento de migración

Estos ítems corresponden a los pendientes de baja prioridad (B2, B3) y a brechas
detectadas en la auditoría semiótica post-Paso 2. Una vez completados S1 y S3, el
frontend habrá cubierto todas las 7 fases del plan UX/semiótica excepto el modo oscuro.
S2 debe coordinarse con el Paso 3 (backend) para no migrar los tipos dos veces.

Actualizar `contexto-migracion-nexu-v2.md` a medida que se completen estos ítems.
