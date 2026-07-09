---
target: flujo estudiante (properties + matching)
total_score: 25
p0_count: 1
p1_count: 3
timestamp: 2026-07-09T04-21-53Z
slug: frontend-src-features-properties-flujo-estudiante
---
## Design Health Score

| # | Heurística | Score | Problema clave |
|---|-----------|-------|----------------|
| 1 | Visibilidad del estado | 3/4 | Buenos skeletons/contadores; checkout sin ruta de fallo visible |
| 2 | Match con el mundo real | 3/4 | Voz "Conserje" en español sólida; "Tarifa de servicio 14%" sin explicar |
| 3 | Control y libertad | 2/4 | Modal sin Escape ni focus-trap; "Reservar ahora" móvil salta el form |
| 4 | Consistencia y estándares | 2/4 | "Para ti" → dos destinos; colores de radar/mapa fuera de token |
| 5 | Prevención de errores | 2/4 | Checkout acepta cualquier tarjeta; móvil asume 1 mes/1 residente en silencio |
| 6 | Reconocer > recordar | 3/4 | Filtros persisten en localStorage, chips visibles, badge de filtros activos |
| 7 | Flexibilidad y eficiencia | 3/4 | Quick filters + modal avanzado, toggle mapa/lista, estado guardado |
| 8 | Estético y minimalista | 3/4 | Mayormente limpio; cards de matching densas (radar 9 ejes por card) + hero cargado |
| 9 | Recuperación de errores | 2/4 | Matching tiene retry; `CheckoutModal.onConfirm` no tiene rama de error |
| 10 | Ayuda y documentación | 2/4 | Sin explicar la comisión, sin tooltips en las 9 dimensiones, sin política de cancelación |
| **Total** | | **25/40** | **Aceptable** — base competente, faltan control/consistencia/manejo de errores |

## Veredicto anti-patrones

**¿Parece hecho por IA?** No de forma flagrante, pero un revisor agudo detectaría "olor a IA" por tres tells concretos, no por el conjunto:

- **Gradiente + glassmorphism decorativo** que tu propio `DESIGN.md` prohíbe: el hero pinta `bg-gradient-to-br from-secondary-700 via-secondary to-secondary-600 opacity-90` (`PropertiesHomePage.tsx:52`) y hay `backdrop-blur-sm` en 3 lugares (`PropertyCard.tsx:49`, `PropertyDetailPage.tsx:96`, `AdvancedFilters.tsx:114`).
- **Borde + sombra permanente** (rompe tu "Regla Plano-por-Defecto") en la card de reserva: `border border-gray-200 … shadow-md` fijo en reposo (`PropertyBookingCard.tsx:44`).
- **Deriva de color fuera de token**, señal típica de código generado: el radar hardcodea `#2563eb`/`#f59e0b` (`CompatibilityRadar.tsx:36-38`) en vez de tu naranja/azul de marca, y mapa/sliders usan `orange-500/600` (`#F97316`) — **un naranja distinto** al de marca `#E8813A`.

**A su favor:** evita gradient text, franjas laterales, over-rounding (nada supera `rounded-2xl`), marcadores numerados, y **mantiene los estados con texto+color** (no solo color). No es slop completo: es energía de plantilla competente con algunas violaciones reales del sistema.

**Scan determinista:** el detector corrió **limpio (`[]`, exit 0)** sobre properties + matching + shared (44 archivos). Ningún anti-patrón estructural. Las incidencias reales son de contraste, movimiento y a11y — cosas que el detector no mide y que la revisión de código sí encontró.

**Overlays visuales:** no disponibles — no hay herramienta de browser automation expuesta en esta sesión, así que no hubo inyección/medición de contraste renderizado (señal de fallback declarada, sin fabricar resultados).

## Impresión general

NexU tiene **buenos huesos**: mobile-first de verdad (safe-area en bottom nav, footer sticky de precio/CTA, galería con swipe), estados con texto (no solo color), y el matching cumple tu principio "se explica, no se impone". El problema no es cómo se ve en el happy path, sino que **la pantalla de mayor riesgo emocional — el checkout — es la que menos confianza transmite**, justo al revés de tu principio "confianza antes que conversión". Esa es la mayor oportunidad.

## Lo que funciona

1. **Los estados nunca dependen solo del color** — cada badge lleva texto ("Disponible"/"Reservado"/"No disponible") en card, detalle y leyenda del mapa (`PropertyCard.tsx:15-19`, `PropertySearchMap.tsx:36-40`). Cumple WCAG y tu regla de diseño.
2. **El matching honra "se explica, no se impone"** — cada card combina explicación en lenguaje natural + ReasonChips + radar (`MatchingPage.tsx:226-229`).
3. **Mobile-first real** — safe-area en bottom nav (`MobileBottomNav.tsx:27`), footer sticky de precio/CTA en detalle, galería con drag offset (`PropertyGallery.tsx:15-34`).

## Problemas prioritarios

**[P0] Los modales no tienen contrato de teclado/a11y.**
`Modal.tsx` y la hoja de `AdvancedFilters` no tienen handler de Escape, ni focus-trap, ni `role="dialog"`/`aria-modal`, ni devuelven el foco. Los botones de cerrar con solo ícono (`Modal.tsx:33`, `AdvancedFilters.tsx:121`) no tienen nombre accesible.
- *Por qué importa:* `CheckoutModal` es la superficie de mayor riesgo del flujo; un usuario de teclado/lector de pantalla (Sam) no puede cerrarla con Esc y el foco se fuga a la página de atrás. Falla WCAG 2.1.2 / 2.4.3.
- *Fix:* Escape→onClose, focus-trap del panel, `role="dialog" aria-modal="true" aria-labelledby`, `aria-label` en el botón X, restaurar foco al cerrar.
- *Comando sugerido:* **`$impeccable harden`**

**[P1] El checkout es un valle de ansiedad sin confianza ni manejo de error.**
Formulario de tarjeta completo, comisión 14% sin explicar, disclaimer en `text-gray-400` al fondo, y `onConfirm` sin UI de fallo (`CheckoutModal.tsx:32-35,118`). En móvil, "Reservar ahora" salta el formulario y asume 1 mes / mes actual / 1 residente en silencio (`PropertyDetailPage.tsx:47-51`).
- *Por qué importa:* es exactamente el momento de "reassurance en el punto de mayor riesgo" para un estudiante con presupuesto ajustado. Contradice "confianza antes que conversión".
- *Fix:* "No se te cobrará hasta confirmar", mostrar badge de host verificado + nota de cancelación, explicar la comisión, y estado de error si la reserva falla. En móvil, no saltar la selección de fechas/duración.
- *Comando sugerido:* **`$impeccable clarify`** (copy/confianza) + **`$impeccable harden`** (estado de error)

**[P1] Texto de metadatos bajo el mínimo AA.**
`text-gray-400` (#9CA3AF ≈ 2.8:1 sobre blanco) carga contenido real: conteo de reseñas (`PropertyCard.tsx:97`), "(N reseñas)" (`PropertyBasicInfo.tsx:60`), notas de precio (`:70`), meta del popup del mapa (`PropertySearchMap.tsx:168`). B contó **23 usos** de gray-400 como color base de texto significativo en claro. Tu `DESIGN.md` fija gray-500 como piso.
- *Por qué importa:* falla WCAG 1.4.3; ilegible al sol en un móvil de gama media — justo tu público.
- *Fix:* promover gray-400 → gray-500/600 en texto con significado; reservar gray-400 para decorativo.
- *Comando sugerido:* **`$impeccable audit`** (barrido de contraste)

**[P1] Cero soporte de `prefers-reduced-motion` en todo el árbol.**
B confirmó **51 usos** de `transition`/`animate-`/`duration-` (hover scale-105, rotaciones, etc.) y **0** guardas `prefers-reduced-motion`/`motion-reduce:` en todo `src/`.
- *Por qué importa:* tu objetivo es WCAG AA y tu propio DESIGN.md lo exige; usuarios con sensibilidad vestibular no tienen alternativa.
- *Fix:* añadir variante `motion-reduce:` o un bloque `@media (prefers-reduced-motion: reduce)` global que neutralice transforms/animaciones.
- *Comando sugerido:* **`$impeccable animate`** (o audit)

**[P2] "Para ti" apunta a dos destinos distintos.**
Navbar "Para ti" → `/matching` (`Navbar.tsx:45`); MobileBottomNav "Para ti" → `/recommendations` (`MobileBottomNav.tsx:9`). Misma etiqueta, distinta página — modelo mental roto, peor en el público mobile-primary.
- *Fix:* unificar ruta/etiqueta o renombrar una.
- *Comando sugerido:* **`$impeccable clarify`**

**[P2] Targets táctiles por debajo de 44px en el flujo móvil.**
Puntos de galería `h-2` 8px (`PropertyGallery.tsx:68`), contadores `h-8 w-8` 32px (`AdvancedFilters.tsx:54-60`), corazón favorito `p-1.5` ≈28px (`PropertyCard.tsx:49`), chips `py-1` ~26px.
- *Fix:* subir el área de toque a ≥44px (padding del hit-area sin agrandar lo visual).
- *Comando sugerido:* **`$impeccable optimize`** / adapt

## Carga cognitiva

**3 fallos, todos en puntos con >4 opciones visibles:**
1. **AdvancedFilters** — ~15 controles en 4 secciones; solo Convivencia expone 6 decisiones (`AdvancedFilters.tsx:194-241`). Mitigado por acordeón, pero al abrirse es un muro.
2. **CompatibilityRadar** — **9 dimensiones** (`:12-16`) en un radar de 280px, **uno por card** en grilla de 3 columnas (`MatchingPage.tsx:214`). Carga alta repetida N veces, sin colapsar.
3. **PropertyBookingCard** — duración (5) + residentes + 6 meses de inicio; límite pero aceptable por estar agrupado.

## Persona red flags

- **Casey (móvil distraída):** "Reservar ahora" salta selección de fecha/duración y aterriza en pago; puntos de galería y chips diminutos invitan al mis-tap.
- **Sam (a11y):** sin Escape/focus-trap en modales; gray-400 falla contraste; sliders y dots sin `aria-label`; el radar transmite datos sin equivalente en texto/tabla.
- **Jordan (primera vez):** AdvancedFilters abre a un muro de 15 controles; radar de 9 ejes sin leyenda de qué significa cada eje; comisión 14% sin justificar.
- **Estudiante con presupuesto ajustado desde el móvil (NexU):** el número más importante — el precio — va junto a un "/mes" en gray-400 y una comisión 14% que infla el total en el último paso, sin "sin cargo hasta confirmar". Quien más sensible es al dinero recibe la menor claridad sobre él en el checkout.

## Observaciones menores

- Labels de BookingCard en `uppercase tracking-wide text-gray-500` (`PropertyBookingCard.tsx:70,82,95`) — el tell del eyebrow diminuto; considerar sentence case.
- `EmptyState`/`ErrorMessage`/`ReviewStats` **sin clases dark-mode** mientras el resto del flujo sí es dark-aware — inconsistente en modo oscuro.
- `SuccessModal` se renderiza sin `title`, así que Modal no muestra header ni X (`Modal.tsx:28`) — se agrava con el P0 de sin-Escape.
- `activeFilterCount` (`SearchPage.tsx:85-94`) cuenta `housingType` aparte del chip `roomType` — posible doble conteo.
- Imágenes de lista en `PropertySearchMap.tsx:148` y `PropertyGallery.tsx:51,85` sin `loading="lazy"`.

## Preguntas para pensar

1. Si el principio es "confianza antes que conversión", ¿por qué la pantalla de mayor riesgo (checkout) es la que menos señales de confianza tiene — y con una comisión que el estudiante nunca vio venir?
2. Un radar de 9 ejes por card es una explicación *que impresiona*, no necesariamente *legible*. ¿Un top-3 de razones en texto ("misma universidad, presupuesto compatible, horario de sueño") reduciría más la ansiedad que un gráfico que muchos no pueden leer en el móvil?
3. "Para ti" significa dos páginas distintas según dónde toques — ¿el matching es una idea coherente en la cabeza del equipo, o dos features con la misma etiqueta?
