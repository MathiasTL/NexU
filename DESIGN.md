---
name: NexU
description: Plataforma de alojamiento universitario en Lima — matching estudiante ↔ habitación ↔ roommate
colors:
  primary: "#E8813A"
  primary-600: "#C96920"
  primary-200: "#FBCAA6"
  primary-50: "#FEF3EA"
  secondary: "#1A3C6E"
  secondary-600: "#1A3C6E"
  secondary-300: "#7EA2DC"
  secondary-50: "#EEF3FC"
  ink: "#111827"
  muted: "#6B7280"
  surface: "#FFFFFF"
  border: "#F3F4F6"
  success: "#16A34A"
  warning: "#F59E0B"
  danger: "#DC2626"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  md: "0.75rem"
  lg: "1rem"
  pill: "9999px"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-600}"
    textColor: "{colors.surface}"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1rem"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  badge:
    rounded: "{rounded.pill}"
    padding: "0.125rem 0.625rem"
---

# Design System: NexU

## 1. Overview

**Creative North Star: "El Conserje de Confianza"**

NexU es la herramienta que ordena el caos de buscar dónde vivir en la universidad.
La interfaz se comporta como un buen conserje: cálida al recibir, clara al
señalar, y sólida cuando importa. El **naranja** (`#E8813A`) es el gesto de
bienvenida — acción, calidez, "empieza por aquí" — y el **azul marino**
(`#1A3C6E`) es el respaldo que da seguridad: navegación, encabezados, texto de
estructura. Esa pareja carga la personalidad; el layout y la tipografía Inter
cargan la claridad.

El sistema es **denso pero respirado**: mucha información por pantalla (precio,
distancia al campus, rating, verificación, compatibilidad) organizada con
espaciado consistente y jerarquía tipográfica antes que con líneas y cajas. La
decisión que acompaña es emocional y con peso económico, así que el diseño
prioriza **reducir ansiedad** — cercanía, precio y "quién es el host/roommate"
legibles de un vistazo — sobre empujar el CTA.

Rechaza explícitamente dos cosas: el **look de SaaS/plantilla AI** (cards
idénticas en grilla infinita, gradientes decorativos, hero-metric templates) y
el **exceso juvenil** (saturación de color, stickers, ruido visual). Soporta
modo claro y oscuro de primera clase.

**Key Characteristics:**
- Naranja cálido de acción + azul marino de confianza, sobre lienzo blanco/limpio.
- Una sola familia (Inter) en varios pesos; jerarquía por tamaño y peso, no por fuentes.
- Redondeo suave y generoso (`xl`/`2xl`), sombras mínimas que aparecen en estado.
- Móvil de primera clase: nav inferior, targets amplios, densidad que colapsa con gracia.
- Dark mode completo con `darkMode: 'class'`.

## 2. Colors

Una paleta de dos protagonistas cálido/frío sobre neutros grises, con tres
semánticos de estado.

### Primary
- **Naranja Bienvenida** (`#E8813A`): color de marca y de acción. Botones
  primarios, foco (`:focus-visible` a 2px), enlaces activos, acentos de
  matching. Rampa completa 50→900; `primary-600` (`#C96920`) es el hover.

### Secondary
- **Azul Confianza** (`#1A3C6E`): estructura y respaldo. Texto de navegación,
  encabezados, badges de verificación (`secondary-50`/`secondary-600`). Da la
  sensación institucional-amable sin caer en corporativo frío.

### Neutral
- **Tinta** (`#111827` / gray-900): texto principal sobre blanco.
- **Muted** (`#6B7280` / gray-500): metadatos, ubicación, distancia, subtítulos.
- **Superficie** (`#FFFFFF`): fondo de página y de tarjetas.
- **Borde** (`#F3F4F6` / gray-100): divisores y contornos sutiles de tarjeta.
- Dark mode: superficies en `gray-900`/`gray-800`, bordes en `gray-700/800`.

### Estado (semánticos)
- **Success** (`#16A34A`, bg `#F0FDF4`): disponible, confirmado.
- **Warning** (`#F59E0B`, bg `#FFFBEB`): reservado, pendiente.
- **Danger** (`#DC2626`, bg `#FEF2F2`): no disponible, error, cerrar sesión.

### Named Rules
**La Regla del Naranja Medido.** El naranja de marca es para acción y foco, no
para baño de color. En cualquier pantalla, la calidez se dosifica: un CTA, un
acento, un estado — no fondos naranjas ni bloques grandes. Su escasez es lo que
lo hace leer como "toca aquí".

## 3. Typography

**Display / Body / Label Font:** Inter (con `-apple-system, BlinkMacSystemFont,
Segoe UI, sans-serif`). Pesos 400/500/600/700, cargada desde Google Fonts.

**Character:** Un solo grotesco humanista, neutro y altamente legible, que hace
todo el trabajo. La jerarquía nace del tamaño y el peso, nunca de mezclar
familias. Es la decisión correcta para una herramienta densa en datos: la
tipografía desaparece y deja leer la información.

### Hierarchy
- **Display** (700, `clamp(1.75rem, 4vw, 2.5rem)`, lh 1.15, `-0.02em`): títulos
  de página / hero de sección.
- **Headline** (600, `1.5rem`, lh 1.25): encabezados de sección, títulos de modal.
- **Title** (600, `0.875rem`, lh 1.375): títulos de tarjeta (property, booking),
  labels de formulario.
- **Body** (400, `0.875rem`, lh 1.5): texto general. Cap 65–75ch en prosa larga
  (descripciones, explicación de matching).
- **Label** (500, `0.75rem`, lh 1.4): metadatos, badges, chips, texto auxiliar.

### Named Rules
**La Regla de Una Sola Voz Tipográfica.** Inter en varios pesos, nunca una
segunda familia. Si algo necesita destacar, sube el peso o el tamaño — no cambies
la fuente.

## 4. Elevation

Sistema **plano por defecto, sombra por estado**. Las superficies descansan sin
sombra o con una `shadow-sm` mínima; la profundidad aparece como respuesta a la
interacción (hover en tarjetas) o para elementos que flotan de verdad
(dropdowns, modales). La jerarquía la lleva el color de fondo y el borde, no la
sombra.

### Shadow Vocabulary
- **Reposo de tarjeta** (`shadow-sm`): contorno apenas perceptible en
  PropertyCard, navbar, badges flotantes sobre imagen.
- **Hover de tarjeta** (`shadow-md` vía `transition-shadow`): feedback al pasar
  sobre una tarjeta interactiva.
- **Flotante** (`shadow-xl`): dropdown de cuenta y menús que escapan el flujo.

### Named Rules
**La Regla Plano-por-Defecto.** Las tarjetas están planas en reposo; la sombra
es una respuesta al estado (hover, foco, flotar), nunca decoración fija. No
combinar borde de 1px + sombra ancha como adorno permanente.

## 5. Components

### Buttons
- **Shape:** `rounded-xl` (`0.75rem`), `font-medium`, `transition-colors`.
- **Primary:** `bg-primary text-white`, hover `bg-primary-600`, disabled
  `bg-primary-200`. Tamaños `sm` (`px-3 py-1.5`), `md` (`px-4 py-2.5`), `lg`
  (`px-6 py-3`). Estado `loading` con spinner de `border-current`.
- **Secondary:** `bg-gray-100 text-gray-900` hover `gray-200`.
- **Outline:** `border-gray-300 text-gray-700` hover `bg-gray-50`.
- **Ghost:** solo texto `gray-600`, hover `bg-gray-100`.
- **Danger:** `bg-red-600` hover `red-700`.

### Chips / Badges
- **Shape:** `rounded-full` (pill), `px-2.5 py-0.5 text-xs font-medium`.
- **Variantes:** default (gris), success (verde), warning (amarillo), danger
  (rojo), info (naranja/`primary-100`). Chips de tipo de propiedad usan
  `primary-50`/`primary-600`; verificación usa `secondary-50`/`secondary-600`.
- Los estados de disponibilidad **nunca dependen solo del color**: llevan texto
  ("Disponible", "Reservado", "No disponible").

### Cards / Containers
- **Corner:** `rounded-2xl` (`1rem`) en PropertyCard; `rounded-xl` en contenedores
  menores.
- **Background:** blanco / `gray-800` en dark.
- **Border:** `border-gray-100` (sutil), `gray-700` en dark.
- **Shadow:** `shadow-sm` → `hover:shadow-md`. Imagen con `group-hover:scale-105`.
- **Padding interno:** `p-4` (`1rem`).
- **Nunca anidar tarjetas.**

### Inputs / Fields
- **Style:** `rounded-xl border-gray-300 bg-white px-3 py-2 text-sm`.
- **Focus:** `border-primary` + `ring-2 ring-primary/20` (anillo naranja suave).
- **Error:** `border-red-400` + mensaje `text-xs text-red-500`.
- **Disabled:** `bg-gray-50`.
- **Label:** `text-sm font-medium text-gray-700` encima del campo.

### Navigation
- **Navbar:** `sticky top-0 z-40`, blanco con `border-b` y `shadow-sm`. Enlaces
  `text-secondary` hover `text-primary`. Dropdown de cuenta `rounded-xl
  shadow-xl` con overlay de cierre.
- **Móvil:** nav inferior fija (MobileBottomNav) y botón "Acceder" compacto.
- **Foco:** `:focus-visible` global con outline naranja de 2px, offset 2px.

## 6. Do's and Don'ts

### Do:
- **Do** usar el naranja para acción y foco, dosificado (Regla del Naranja Medido).
- **Do** apoyar la jerarquía en tamaño/peso de Inter, no en segundas fuentes.
- **Do** mantener tarjetas planas en reposo; sombra solo en hover/flotante.
- **Do** acompañar cada color de estado con texto/ícono (no solo tinte) — WCAG AA.
- **Do** verificar contraste ≥4.5:1: el texto `gray-500` sobre blanco es el límite;
  no bajar de ahí para metadatos importantes.
- **Do** diseñar primero para móvil (nav inferior, targets ≥44px, densidad que colapsa).
- **Do** respetar `prefers-reduced-motion` en toda animación (hover-scale, spinners, reveals).

### Don't:
- **Don't** caer en el look SaaS/plantilla AI: grillas de cards idénticas,
  gradientes decorativos, hero-metric templates.
- **Don't** recargar con exceso juvenil: saturación de color, stickers, ruido visual.
- **Don't** usar `border-left`/`border-right` >1px como franja de acento.
- **Don't** combinar `border 1px` + `box-shadow` ancho (≥16px) como adorno fijo.
- **Don't** redondear tarjetas más allá de `2xl`; los inputs/botones se quedan en `xl`.
- **Don't** usar gradient text (`background-clip: text`).
- **Don't** anidar tarjetas.
- **Don't** clonar literalmente el look de Airbnb/Booking ni el tono frío de un
  portal de clasificados.
