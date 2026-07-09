---
target: flujo estudiante (properties + matching)
total_score: 26
p0_count: 0
p1_count: 2
timestamp: 2026-07-09T04-47-59Z
slug: frontend-src-features-properties-flujo-estudiante
---
## Design Health Score — 26/40 · Aceptable (trust-forward)

| # | Heurística | Score | Δ | Problema clave |
|---|-----------|-------|---|----------------|
| 1 | Visibilidad del estado | 3/4 | = | Spinners, loading, error y success presentes; wording de success engaña (ver #2) |
| 2 | Match con el mundo real | 2/4 | ▼1 | SuccessModal dice "¡Reserva confirmada!/Total pagado" — contradice el "no se te cobrará" del checkout |
| 3 | Control y libertad | 3/4 | ▲1 | Escape, focus-trap, foco devuelto, X/cancel ya funcionan (Modal.tsx) |
| 4 | Consistencia | 2/4 | = | CTA deriva (Reservar espacio/ahora/Enviar solicitud); acentos fuera de token; AdvancedFilters sin dark-mode |
| 5 | Prevención de errores | 3/4 | ▲1 | try/catch/finally + inputMode/autoComplete/maxLength |
| 6 | Reconocer > recordar | 3/4 | = | Resumen de reserva, badge verificado, chips de filtro visibles |
| 7 | Flexibilidad | 3/4 | = | `cc-*` autocomplete + numeric; móvil abre selección real |
| 8 | Estético/minimalista | 2/4 | ▼1 | Radar de 9 ejes por card en grilla; header de matching con `shadow-lg` naranja pesado |
| 9 | Recuperación de errores | 3/4 | ▲1 | `role="alert"` con "no se realizó ningún cargo" |
| 10 | Ayuda/documentación | 2/4 | = | Comisión explicada + banner de confianza; resto escaso |
| **Total** | | **26/40** | **▲1** | P0 eliminado; el número sube poco porque 2 issues reales se hicieron visibles |

## Veredicto anti-patrones — detector limpio ✅

Detector `[]` (exit 0) sobre 44 archivos, sin regresiones. Mayormente libre de slop: naranja medido, flat-by-default, una sola voz Inter, badges con texto. Quedan **3 tells de color fuera de token** (diferidos): radar `#2563eb`/`#f59e0b`, sliders `accent-orange-500` (#F97316), popup del mapa `orange-50/600`. Tell secundario: radar de 9 ejes por card en grilla lee como "cards idénticas".

## Lo que mejoró vs 25/40

1. **A11y de modales: de casi-cero a completo** — Escape, focus-trap con wrap, foco devuelto, semántica `role="dialog"`/`aria-modal`/`aria-labelledby`, X etiquetada (`Modal.tsx`). El mayor salto. **P0 eliminado.**
2. **Checkout dejó de ser un form frío** — banner de confianza, host verificado, comisión 14% explicada, `role="alert"` con "no se realizó ningún cargo".
3. **Reserva móvil honesta** — hoja real de inicio/duración/residentes reemplaza la suposición silenciosa; `handleConfirm` con try/catch/finally.
4. **Reduced-motion global** con excepción de spinners (`index.css`).
5. **Contraste de texto significativo** — de 23 usos de gray-400 a **~0**; metadatos ahora en gray-500 (≈4.83:1). Placeholders a gray-500. Bug dark-mode del rating corregido.

Ambos assessments verificaron los 5 fixes en el código. Detector sin regresiones.

## Problemas prioritarios (nuevo backlog)

**[P1] SuccessModal contradice la narrativa de confianza que acabamos de construir.**
`SuccessModal.tsx:23,36` anuncia "¡Reserva confirmada!" y "Total **pagado**" — niega directamente el "no se te cobrará hasta confirmar / enviar solicitud" del checkout. Es la ansiedad que quitamos, re-inyectada en la pantalla siguiente, y además es factualmente incorrecto (no hubo pago, el host no confirmó).
- *Fix:* "¡Solicitud enviada!", etiqueta "Total estimado" (no "pagado"), y "El propietario revisará tu solicitud; no se te cobró nada aún."
- *Comando:* **`$impeccable clarify`**
- *Nota:* este issue lo **hizo visible nuestro propio fix** — al reencuadrar el checkout como solicitud, el copy de éxito quedó desalineado. Coherencia de flujo pendiente.

**[P1] AdvancedFilters no tiene ningún estilo dark-mode.**
`grep dark:` = 0 en todo el archivo; la hoja es `bg-white` + `text-gray-*` sin variantes (`AdvancedFilters.tsx:116-307`). En modo oscuro toda la hoja de filtros se ve como una tabla blanca con controles casi invisibles — superficie rota en una app dark-first, en la ruta principal de descubrimiento móvil.
- *Fix:* añadir `dark:bg-gray-800`, `dark:text-*`, `dark:border-gray-700`, fondos oscuros de input/select.
- *Comando:* **`$impeccable adapt`** / harden

**[P2] Colores fuera de token (tell de IA + ruptura de marca).**
Radar `#2563eb`/`#f59e0b`; sliders `accent-orange-500`; popup del mapa `orange-50/600` (4 ocurrencias). Rompen la "Regla del Naranja Medido".
- *Fix:* radar → `#1A3C6E` + `#E8813A`; sliders → `accent-[#E8813A]`; popup → `primary-50/600`.
- *Comando:* **`$impeccable colorize`** / audit

**[P2] Badges de score en texto pequeño fallan AA.**
`ScoreBadge` texto blanco sobre `bg-primary` (#E8813A ≈ 2.6:1) y `bg-green-500` (≈ 2.3:1) a `text-xs` (`MatchingPage.tsx:14-19`). El score de compatibilidad es info central.
- *Fix:* `bg-primary-600`/`bg-green-600` o texto oscuro sobre relleno claro.
- *Comando:* **`$impeccable audit`**

**[P3] Targets táctiles <44px persisten.** Contadores de filtros `h-8 w-8` (32px), corazón favorito ≈28px, dots de galería ≈8px. → **`$impeccable optimize`**

## Persona red flags
- **Casey (móvil):** hoja de filtros ilegible en dark-mode (P1); contadores de 32px (P3). Resto del flujo móvil sólido.
- **Sam (a11y):** modales excelentes ahora; pero ScoreBadge/relleno saturado falla AA (P2); texto ámbar del mapa "Perímetro aproximado" (`PropertySearchMap.tsx:208`) ≈1.9:1.
- **Jordan (primera vez):** whiplash — "no se cobra… solicitud", luego "Reserva confirmada/Total pagado" (P1). CTA cambia de verbo tres veces.
- **Estudiante presupuesto-ajustado-móvil:** comisión ahora explicada (bien), pero "Total pagado" puede leerse como "ya me cobraron"; la comisión solo aparece en checkout, no en la PropertyCard, así que el costo real surge tarde.

## Observaciones menores
- Deriva de CTA: "Reservar espacio" / "Reservar ahora" / "Enviar solicitud" — elegir un verbo.
- `PropertyBookingCard` dice "Total **estimado**" (bien); alinear SuccessModal.
- Overlay/leyenda del mapa son light-only (sin dark:).
- `formatCard` no valida Luhn/longitud; expiry acepta cualquier "MM/AA" (aceptable en pago simulado).
- Imágenes de galería/mapa aún sin `loading="lazy"` (PropertyCard sí lo tiene).

## Preguntas para pensar
1. Si el checkout reencuadra esto como **solicitud, no compra**, ¿por qué el éxito sigue diciendo "confirmada/pagado" — el modelo de booking es de solicitud, o el copy de confianza firma un cheque que el backend no cobra?
2. ¿Un radar de 9 ejes por card ayuda a decidir más rápido a un estudiante estresado por el presupuesto, o es rigor decorativo? ¿Una barra de compatibilidad + top-2 razones cargaría lo mismo con una fracción del esfuerzo?
3. La comisión (14%) solo aparece en checkout. ¿No debería la pregunta "¿me lo puedo pagar?" — centro del brief — responderse desde la **PropertyCard**, antes del compromiso emocional?
