# NextU - Plan Tecnico de Cambios UX, 5W y Semiotica

## 1. Objetivo

Definir los cambios tecnicos recomendados para adaptar el frontend actual de la plataforma hacia la propuesta NextU: marketplace de alquiler para estudiantes universitarios, incorporando hallazgos del analisis 5W y principios de semiotica UX sin afectar las funcionalidades ya implementadas.

El documento prioriza una implementacion incremental, mantenible y de bajo riesgo sobre una reescritura completa.

## 2. Alcance

Este plan aplica a la carpeta `frontend/` y cubre los siguientes modulos:

- Identidad visual y sistema de estilos.
- Home y busqueda de propiedades.
- Tarjetas de inmuebles y detalle de propiedad.
- Mapa interactivo.
- Favoritos, filtros y persistencia local.
- Perfil de estudiante y compatibilidad de roommates.
- Panel de propietario y wizard de publicacion.
- Chat, notificaciones y elementos de confianza.
- Preparacion para recomendaciones inteligentes.

No se contempla en esta etapa una integracion real con backend, pasarela de pagos, geocodificacion externa, IA real o push notifications nativas. Esos puntos pueden simularse con mocks o implementarse posteriormente cuando exista soporte de backend.

## 3. Estado Actual Del Frontend

El frontend actual usa:

- React 18 con Vite.
- TypeScript.
- Tailwind CSS.
- React Router DOM.
- Zustand para estado UI.
- Leaflet y React Leaflet para mapa.
- Servicios mock locales para propiedades, usuarios, reservas, mensajes y notificaciones.

Funcionalidades existentes:

- Home con buscador.
- Pagina de busqueda con filtros basicos.
- Mapa de propiedades con Leaflet.
- Detalle de propiedad.
- Flujo de reserva.
- Login, registro y rutas protegidas.
- Panel de propietario.
- Wizard de publicacion de propiedad.
- Chat interno.
- Notificaciones internas.
- Reseñas.

Brechas detectadas:

- La marca actual aparece como `Smart`, no como `NextU`.
- El modelo esta orientado a alquiler turistico por noche.
- El copy usa conceptos como `huesped`, `anfitrion` y `propiedad`, no lenguaje estudiantil.
- No existe compatibilidad de roommates.
- No existe pagina funcional de favoritos aunque hay enlace a `/account/favorites`.
- No existe persistencia de filtros ni favoritos.
- No existe modo oscuro.
- No existe recomendacion IA real.
- El mapa no muestra capas universitarias, transporte o seguridad.

## 4. Principios Tecnicos

Los cambios deben seguir estas practicas:

- Implementar de forma incremental y reversible.
- Evitar reescrituras completas de componentes funcionales.
- Preferir cambios aditivos sobre cambios destructivos en tipos y mocks.
- Mantener compatibilidad temporal con campos existentes como `pricePerNight` mientras se introduce `pricePerMonth`.
- Centralizar constantes, etiquetas y configuraciones visuales.
- Mantener componentes pequenos y reutilizables solo cuando haya repeticion real.
- Usar TypeScript estricto para proteger cambios de modelo.
- Validar mobile-first en pantallas de 360px a 414px.
- Preservar rutas existentes y corregir enlaces rotos.
- Mantener accesibilidad minima: labels, contraste, foco visible y areas tactiles de al menos 44px.
- Evitar dependencias nuevas salvo que aporten valor claro.

## 5. Estrategia De Implementacion

La implementacion se divide en fases para reducir riesgo.

| Fase | Objetivo | Riesgo | Resultado Esperado |
|---|---|---:|---|
| 1 | Rebranding y sistema visual | Bajo | La app se ve y comunica como NextU sin cambiar logica de negocio. |
| 2 | Marketplace estudiantil | Medio | Busqueda, tarjetas y datos se orientan a alquiler universitario. |
| 3 | Confianza y mapa semantico | Medio | El usuario percibe seguridad, disponibilidad y cercania a universidades. |
| 4 | Favoritos y persistencia | Medio | Filtros y favoritos se conservan entre sesiones. |
| 5 | Compatibilidad de roommates | Medio/Alto | Se agrega perfil de convivencia y score de compatibilidad. |
| 6 | Recomendacion guiada tipo IA | Alto | Se agrega cuestionario narrativo con recomendaciones simuladas. |
| 7 | Mejoras avanzadas | Alto | Modo oscuro, offline parcial y push quedan preparados o implementados. |

## 6. Cambios Por Modulo

### 6.1 Identidad Visual

Archivos afectados:

| Archivo | Cambio |
|---|---|
| `src/shared/components/layout/Navbar.tsx` | Cambiar marca `Smart` por `NextU`, ajustar logo textual y navegacion. |
| `src/shared/components/layout/MainLayout.tsx` | Actualizar footer, descripcion y marca. |
| `src/shared/components/layout/HostNavbar.tsx` | Actualizar marca en panel propietario. |
| `src/features/auth/pages/LoginPage.tsx` | Cambiar copy de bienvenida. |
| `src/features/auth/pages/RegisterPage.tsx` | Cambiar copy de registro. |
| `src/features/auth/components/RegisterForm.tsx` | Cambiar pregunta de rol hacia estudiante/propietario. |
| `tailwind.config.ts` | Agregar paleta NextU: coral/naranja, azul institucional, neutros y estados. |
| `src/index.css` | Definir fuente base, color de fondo, comportamiento de foco y variables si aplica. |

Recomendacion visual:

| Token | Valor Propuesto | Uso |
|---|---|---|
| `primary` | `#E8813A` | CTAs principales, acentos y estados activos. |
| `secondary` | `#1A3C6E` | Confianza, cabeceras, navbar y textos institucionales. |
| `success` | `#16A34A` | Disponibilidad, verificacion y confirmaciones. |
| `warning` | `#F59E0B` | Baja disponibilidad o advertencias. |
| `danger` | `#DC2626` | Errores o estados no disponibles. |

Buenas practicas:

- Mantener clases Tailwind existentes y reemplazar gradualmente `blue-*` por tokens configurados.
- No introducir una libreria de UI nueva.
- Mantener contraste suficiente entre texto y fondo.

### 6.2 Home Y Propuesta De Valor

Archivos afectados:

| Archivo | Cambio |
|---|---|
| `src/features/properties/pages/PropertiesHomePage.tsx` | Redisenar hero hacia busqueda estudiantil. |
| `src/features/properties/components/PropertyCard.tsx` | Mostrar beneficios estudiantiles en cards. |

Cambios propuestos:

- Cambiar titulo principal a una propuesta como `Encuentra tu cuarto cerca de la universidad`.
- Agregar busqueda por universidad, distrito o zona.
- Mostrar beneficios: verificacion, cercania, compatibilidad, presupuesto.
- Mostrar propiedades destacadas como habitaciones o departamentos para estudiantes.

Buenas practicas:

- Mantener el formulario actual y solo ampliar su copy y parametros.
- Evitar animaciones pesadas.
- Usar imagenes optimizadas con `loading="lazy"`.

### 6.3 Modelo De Datos De Propiedades

Archivos afectados:

| Archivo | Cambio |
|---|---|
| `src/features/properties/types/property.types.ts` | Agregar campos opcionales orientados a estudiantes. |
| `src/mock/properties.mock.ts` | Adaptar datos mock a alojamientos universitarios. |
| `src/features/properties/services/property.service.ts` | Extender filtros de busqueda. |

Campos recomendados:

```ts
export interface Property {
  id: number
  hostId: number
  title: string
  description: string
  shortDescription: string
  pricePerNight: number
  pricePerMonth?: number
  nearestUniversity?: string
  distanceToUniversityMinutes?: number
  availabilityStatus?: 'available' | 'few_left' | 'occupied' | 'new'
  verifiedHost?: boolean
  safetyScore?: number
  compatibilityScore?: number
  roomType?: 'room' | 'apartment' | 'shared_room' | 'studio'
  studentFriendly?: boolean
}
```

Estrategia:

- Mantener `pricePerNight` temporalmente para no romper reserva y dashboard.
- Usar `pricePerMonth` visualmente en nuevas pantallas estudiantiles.
- Migrar calculos de reserva a alquiler mensual en una fase posterior.

Buenas practicas:

- Campos nuevos opcionales en la primera fase.
- Evitar cambiar nombres existentes hasta que todo el flujo este migrado.
- Mantener los mocks tipados para detectar errores temprano.

### 6.4 Busqueda Y Filtros

Archivos afectados:

| Archivo | Cambio |
|---|---|
| `src/features/properties/pages/SearchPage.tsx` | Agregar filtros estudiantiles. |
| `src/features/properties/types/property.types.ts` | Extender `PropertySearchFilters`. |
| `src/features/properties/services/property.service.ts` | Aplicar filtros nuevos. |
| `src/shared/hooks/useDebounce.ts` | Mantener debounce actual para busqueda. |

Filtros propuestos:

- Universidad cercana.
- Distrito.
- Precio mensual maximo.
- Tipo de espacio.
- Disponibilidad inmediata.
- Verificado.
- Mascotas permitidas.
- Ambiente tranquilo.
- Tiempo maximo a universidad.

Persistencia recomendada:

- Guardar filtros en `localStorage` con una key versionada como `nextu_search_filters_v1`.
- Sincronizar busqueda principal con query params para compartir URL.
- Restaurar filtros al volver a la pagina.

Buenas practicas:

- Mantener filtros simples al inicio.
- No saturar mobile con demasiados controles visibles.
- Usar un panel colapsable para filtros avanzados.

### 6.5 Tarjeta De Propiedad

Archivos afectados:

| Archivo | Cambio |
|---|---|
| `src/features/properties/components/PropertyCard.tsx` | Agregar indicadores semanticos y favoritos persistentes. |

Cambios propuestos:

- Mostrar precio mensual cuando exista `pricePerMonth`.
- Agregar badge `Verificado` si `verifiedHost` es verdadero.
- Agregar estado de disponibilidad: disponible, pocas habitaciones, ocupado o nuevo.
- Mostrar cercania: `8 min a UNMSM`.
- Mostrar compatibilidad cuando exista `compatibilityScore`.
- Convertir favorito local en favorito persistente.

Buenas practicas:

- Mantener la card clickeable con `Link`.
- Evitar que el boton de favorito navegue accidentalmente.
- Agregar `aria-label` al boton de favorito.
- Usar `loading="lazy"` en imagenes.

### 6.6 Favoritos

Archivos afectados:

| Archivo | Cambio |
|---|---|
| `src/core/router/index.tsx` | Agregar ruta `/account/favorites`. |
| `src/features/account/pages/FavoritesPage.tsx` | Crear pagina de favoritos. |
| `src/shared/components/layout/Navbar.tsx` | Mantener enlace actual, ya funcional. |
| `src/features/properties/components/PropertyCard.tsx` | Usar persistencia real de favoritos. |

Estado actual:

- Existe enlace a `/account/favorites` en `Navbar.tsx`.
- No existe ruta ni pagina asociada.

Implementacion recomendada:

- Crear hook `useFavorites` en `src/shared/hooks/useFavorites.ts`.
- Guardar IDs de propiedades en `localStorage` con key `nextu_favorites_v1`.
- Filtrar propiedades mock por IDs guardados en la pagina de favoritos.

Buenas practicas:

- No requerir backend para la primera version.
- Mantener estado local sincronizado con `localStorage`.
- Mostrar estado vacio con CTA hacia busqueda.

### 6.7 Mapa Interactivo Semiotico

Archivos afectados:

| Archivo | Cambio |
|---|---|
| `src/features/properties/components/PropertySearchMap.tsx` | Agregar marcadores personalizados y capas informativas. |
| `src/shared/utils/constants.ts` | Agregar universidades, distritos y puntos de transporte. |

Cambios propuestos:

- Pins por color segun disponibilidad.
- Popups con precio mensual, universidad cercana y badge de verificacion.
- Capa de universidades con marcadores propios.
- Capa mock de transporte: Metropolitano, Tren Electrico o paraderos clave.
- Leyenda visual para interpretar colores.

Buenas practicas:

- Mantener Leaflet, no reemplazar libreria.
- No cargar capas pesadas por defecto.
- Usar datos mock livianos en constantes.
- Mantener mapa funcional aunque no existan campos nuevos.

### 6.8 Detalle De Propiedad

Archivos afectados:

| Archivo | Cambio |
|---|---|
| `src/features/properties/pages/PropertyDetailPage.tsx` | Mantener estructura y agregar secciones nuevas. |
| `src/features/properties/components/PropertyBasicInfo.tsx` | Mostrar orientacion estudiantil. |
| `src/features/properties/components/PropertyHostInfo.tsx` | Agregar verificacion e historial. |
| `src/features/properties/components/PropertyBookingCard.tsx` | Ajustar copy de reserva hacia contacto o solicitud. |
| `src/features/properties/components/PropertyHouseRules.tsx` | Reforzar reglas de convivencia. |

Cambios propuestos:

- Mostrar bloque de confianza del propietario.
- Mostrar tiempo a universidad y seguridad de zona.
- Mostrar reglas de convivencia con iconos.
- Cambiar CTA `Reservar` por `Solicitar visita`, `Hablar con el dueño` o `Separar cuarto`, segun alcance funcional.
- Mantener reserva actual si no se decide migrar todavia el flujo.

Buenas practicas:

- No eliminar el flujo de reserva hasta reemplazarlo completamente.
- Introducir nuevas secciones de forma condicional.
- Evitar modificar servicios de booking en la primera fase visual.

### 6.9 Publicacion De Propiedad

Archivos afectados:

| Archivo | Cambio |
|---|---|
| `src/features/host/wizard/NewPropertyWizard.tsx` | Extender draft sin romper pasos actuales. |
| `src/features/host/types/host.types.ts` | Agregar campos opcionales de publicacion estudiantil. |
| `src/features/host/wizard/Step1PropertyType.tsx` | Cambiar tipos a cuarto, departamento, compartido, residencia. |
| `src/features/host/wizard/Step2Location.tsx` | Agregar cercania a universidad. |
| `src/features/host/wizard/Step4Amenities.tsx` | Agregar amenidades estudiantiles. |
| `src/features/host/wizard/Step8Price.tsx` | Cambiar precio visual a mensual. |
| `src/features/host/wizard/Step9Review.tsx` | Revisar copy y resumen. |

Campos sugeridos para `CreatePropertyDraft`:

```ts
export interface CreatePropertyDraft {
  type: string
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
  pricePerMonth?: number
  nearestUniversity?: string
  roomType?: 'room' | 'apartment' | 'shared_room' | 'studio'
  availableFrom?: string
  houseRules?: string[]
}
```

Buenas practicas:

- Mantener wizard paso a paso para propietarios con baja alfabetizacion digital.
- Evitar jerga tecnica.
- Usar validacion por paso.
- Permitir guardar borrador en una fase posterior.

### 6.10 Perfil Estudiantil Y Roommates

Archivos afectados:

| Archivo | Cambio |
|---|---|
| `src/mock/users.mock.ts` | Agregar preferencias de convivencia opcionales. |
| `src/features/auth/types/auth.types.ts` | Extender `AuthUser` con preferencias opcionales. |
| `src/features/account/components/ProfileForm.tsx` | Agregar campos de estilo de vida. |
| `src/features/account/types/account.types.ts` | Extender payload de perfil. |
| `src/features/properties/components/PropertyCard.tsx` | Mostrar score si aplica. |

Preferencias propuestas:

```ts
export interface LifestylePreferences {
  sleepSchedule?: 'early' | 'late' | 'flexible'
  cleanliness?: 'low' | 'medium' | 'high'
  noiseTolerance?: 'low' | 'medium' | 'high'
  pets?: 'yes' | 'no' | 'indifferent'
  studyHabits?: 'quiet' | 'social' | 'mixed'
}
```

Algoritmo inicial recomendado:

- Implementar una funcion local simple que compare preferencias.
- Retornar porcentaje de compatibilidad entre 0 y 100.
- Explicar el resultado con lenguaje humano, no solo con numero.

Ejemplo de copy:

- `Son muy compatibles: ambos prefieren ambientes tranquilos y horarios nocturnos.`
- `Compatibilidad media: coinciden en limpieza, pero tienen preferencias distintas de ruido.`

Buenas practicas:

- No presentar el score como verdad absoluta.
- Mostrar razones de compatibilidad para aumentar confianza.
- Permitir que el usuario edite sus preferencias facilmente.

### 6.11 Chat Y Notificaciones

Archivos afectados:

| Archivo | Cambio |
|---|---|
| `src/features/account/pages/MessagesPage.tsx` | Ajustar lenguaje y mejorar mobile. |
| `src/features/account/pages/NotificationsPage.tsx` | Agregar notificaciones de disponibilidad y mensajes. |
| `src/mock/messages.mock.ts` | Actualizar mensajes a contexto estudiantil. |
| `src/mock/notifications.mock.ts` | Actualizar notificaciones a contexto NextU. |

Cambios propuestos:

- Cambiar `anfitriones y huespedes` por `propietarios, estudiantes y roommates`.
- Agregar mensajes mock sobre visitas, disponibilidad y dudas de convivencia.
- Agregar notificaciones tipo `Nuevo cuarto cerca de tu universidad`.

Buenas practicas:

- Mantener servicios actuales.
- No implementar push real sin PWA o backend.
- Mejorar responsive antes de agregar complejidad.

### 6.12 Recomendacion Guiada Tipo IA

Archivos sugeridos:

| Archivo | Cambio |
|---|---|
| `src/features/recommendations/pages/RecommendationPage.tsx` | Crear flujo guiado. |
| `src/features/recommendations/components/RecommendationQuestion.tsx` | Pregunta visual reutilizable. |
| `src/features/recommendations/services/recommendation.service.ts` | Algoritmo local basado en reglas. |
| `src/core/router/index.tsx` | Agregar ruta `/recommendations`. |

Enfoque recomendado:

- Implementar primero un motor local basado en reglas.
- Presentar el flujo como conversacion, no como formulario tecnico.
- Explicar cada recomendacion con razones visibles.

Ejemplo:

```text
Te recomendamos este cuarto porque esta a 8 minutos de tu universidad, entra en tu presupuesto y coincide con tu preferencia por ambientes tranquilos.
```

Buenas practicas:

- No llamarlo IA si no existe integracion real.
- Usar textos como `recomendacion inteligente` o `asistente de busqueda`.
- Mantener el resultado explicable.

### 6.13 Modo Oscuro

Archivos afectados:

| Archivo | Cambio |
|---|---|
| `tailwind.config.ts` | Habilitar `darkMode: 'class'`. |
| `src/core/store/ui.store.ts` | Guardar preferencia de tema. |
| `src/index.css` | Agregar fondos y transiciones base. |
| Componentes UI compartidos | Ajustar variantes dark gradualmente. |

Implementacion recomendada:

- Agregar modo oscuro despues de estabilizar paleta NextU.
- Aplicar primero en layout, cards, inputs y modales.
- Persistir preferencia en `localStorage`.

Buenas practicas:

- No mezclar modo oscuro con rebranding en el mismo cambio grande.
- Validar contraste en textos secundarios.
- Evitar colores puros demasiado brillantes sobre fondo oscuro.

### 6.14 Offline Parcial Y Rendimiento

Cambios propuestos:

- Usar `localStorage` para favoritos, filtros y busquedas recientes.
- Considerar `IndexedDB` si se guardan propiedades completas o imagenes.
- Agregar `loading="lazy"` a imagenes.
- Reducir peso de imagenes mock usando parametros `w=600` o `w=400` segun contexto.
- Evitar animaciones costosas.
- Mantener skeletons actuales.

Buenas practicas:

- No implementar service worker sin estrategia clara de cache.
- No cachear datos sensibles.
- Versionar keys de almacenamiento local.

## 7. Correcciones Tecnicas Recomendadas

### 7.1 Ruta De Favoritos Inexistente

Problema:

- `Navbar.tsx` apunta a `/account/favorites`.
- El router no define esa ruta.

Solucion:

- Crear `FavoritesPage.tsx`.
- Registrar la ruta en `src/core/router/index.tsx` dentro de `account`.

Prioridad: alta.

### 7.2 Actualizacion De Perfil

Problema:

- `ProfileForm.tsx` llama `login(user.email, '')` despues de guardar.
- `auth.service.ts` requiere password correcta.
- Esto puede fallar aunque el perfil se haya actualizado.

Solucion recomendada:

- Agregar metodo de actualizacion de usuario en `AuthContext`, por ejemplo `refreshUser` o `setAuthUser` controlado.
- Evitar reloguear con password vacia.

Prioridad: alta.

### 7.3 Terminologia De Reserva

Problema:

- La app calcula noches y huespedes.
- NextU requiere alquiler estudiantil mensual o por periodo.

Solucion:

- Fase inicial: cambiar copy visual donde no afecte calculos.
- Fase posterior: migrar `BookingDraft` hacia fechas de entrada, duracion y numero de residentes.

Prioridad: media.

## 8. Estructura De Archivos Sugerida

Se recomienda mantener la arquitectura actual por features.

```text
src/
  features/
    properties/
      components/
      pages/
      services/
      types/
    host/
      wizard/
      components/
      pages/
      types/
    account/
      components/
      pages/
      services/
      types/
    recommendations/
      components/
      pages/
      services/
      types/
  shared/
    components/
    hooks/
    utils/
  core/
    auth/
    router/
    store/
  mock/
```

Nuevos archivos recomendados:

| Archivo | Proposito |
|---|---|
| `src/shared/hooks/useFavorites.ts` | Persistencia local de favoritos. |
| `src/features/account/pages/FavoritesPage.tsx` | Vista de favoritos. |
| `src/features/recommendations/pages/RecommendationPage.tsx` | Flujo de recomendacion guiada. |
| `src/features/recommendations/services/recommendation.service.ts` | Reglas iniciales de recomendacion. |
| `src/shared/utils/studentHousing.ts` | Helpers de compatibilidad, disponibilidad y etiquetas. |

## 9. Criterios De Aceptacion

### Fase 1

- La marca visible dice `NextU` en layout publico y host.
- La paleta principal usa colores NextU.
- El home comunica alojamiento universitario.
- Login y registro usan copy estudiantil.
- La app compila sin errores TypeScript.

### Fase 2

- Las propiedades mock representan habitaciones o departamentos para estudiantes.
- Las cards muestran precio mensual si existe.
- La busqueda filtra por universidad o distrito.
- Las imagenes usan lazy loading.

### Fase 3

- Las cards muestran verificacion, disponibilidad y cercania a universidad.
- El mapa muestra pins diferenciados por estado.
- Los popups del mapa muestran datos relevantes para estudiantes.

### Fase 4

- El enlace `/account/favorites` funciona.
- El usuario puede guardar y quitar favoritos.
- Los favoritos persisten al recargar.
- Los filtros se restauran entre sesiones.

### Fase 5

- El perfil permite guardar preferencias de convivencia.
- Se calcula compatibilidad mock o local.
- El resultado de compatibilidad incluye explicacion textual.

### Fase 6

- Existe flujo de recomendacion guiada.
- Las recomendaciones se explican con razones.
- El flujo no bloquea la busqueda tradicional.

## 10. Validacion Y QA

Comandos recomendados:

```bash
pnpm build
pnpm lint
pnpm dev
```

Validaciones manuales:

- Revisar home en desktop y mobile.
- Buscar por distrito y universidad.
- Abrir detalle de propiedad.
- Agregar y quitar favoritos.
- Recargar pagina y verificar persistencia.
- Iniciar sesion como estudiante.
- Iniciar sesion como propietario.
- Publicar propiedad desde wizard.
- Revisar chat y notificaciones.
- Validar mapa con y sin resultados.

Resoluciones minimas a probar:

| Resolucion | Objetivo |
|---|---|
| 360px | Android pequeno. |
| 390px | iPhone comun. |
| 414px | Mobile grande. |
| 768px | Tablet. |
| 1024px | Laptop. |
| 1440px | Desktop amplio. |

## 11. Riesgos Y Mitigaciones

| Riesgo | Impacto | Mitigacion |
|---|---:|---|
| Cambiar `pricePerNight` rompe reservas | Alto | Agregar `pricePerMonth` opcional y migrar despues. |
| Agregar muchos filtros complica mobile | Medio | Usar filtros avanzados colapsables. |
| Compatibilidad parece IA real sin serlo | Medio | Explicar que es recomendacion basada en preferencias. |
| Mapa con demasiadas capas baja rendimiento | Medio | Cargar capas opcionales y datos livianos. |
| Modo oscuro rompe contraste | Medio | Implementarlo despues del rebranding y validarlo por componentes. |
| Favoritos sin backend no sincronizan entre dispositivos | Bajo | Comunicarlo como persistencia local en esta fase. |

## 12. Orden Recomendado De Trabajo

1. Corregir ruta de favoritos y problema de actualizacion de perfil.
2. Aplicar rebranding `Smart` a `NextU`.
3. Actualizar paleta y copy principal.
4. Adaptar mocks de propiedades a contexto universitario.
5. Extender tipos de propiedad con campos opcionales.
6. Mejorar cards con indicadores de confianza y disponibilidad.
7. Agregar favoritos persistentes.
8. Extender busqueda con universidad, precio mensual y disponibilidad.
9. Mejorar mapa con pins por estado y universidades.
10. Adaptar wizard de propietario a alquiler estudiantil.
11. Agregar preferencias de convivencia al perfil.
12. Implementar compatibilidad de roommates local.
13. Crear recomendacion guiada tipo asistente.
14. Implementar modo oscuro y mejoras offline si el alcance lo permite.

## 13. Resultado Esperado

Al completar las fases, el frontend mantendra sus funcionalidades actuales, pero comunicara con mayor precision la propuesta NextU:

- Plataforma enfocada en estudiantes universitarios.
- Busqueda orientada por universidad, distrito, presupuesto y convivencia.
- Mapa con valor contextual, no solo geografico.
- Mayor confianza mediante verificacion, reseñas y disponibilidad visible.
- Perfil estudiantil con preferencias de convivencia.
- Compatibilidad de roommates como diferenciador UX.
- Experiencia mobile-first y mas cercana al contexto peruano.
