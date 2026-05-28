# PRD — NexU

> Documento de Requisitos de Producto (Product Requirements Document)
> **Versión 1.0 — Secciones 1 a 9** (la versión 2 ampliará historias de usuario, arquitectura, modelo de datos, flujos, KPIs, roadmap, riesgos y glosario).

---

## 1. Información del documento

| Campo | Detalle |
|---|---|
| **Producto** | NexU — Plataforma de alquiler de recintos cercanos a universidades |
| **Versión del documento** | 1.0 |
| **Fecha** | 2026-05-28 |
| **Autor** | Equipo NexU |
| **Estado** | Borrador para revisión |
| **Audiencia** | Entregable académico / equipo de proyecto |
| **Alcance de esta versión** | Visión completa del producto (secciones 1–9) |

### Control de versiones

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-05-28 | Versión inicial. Secciones 1–9: información, resumen ejecutivo, contexto, objetivos, público objetivo, propuesta de valor, alcance, requisitos funcionales y no funcionales. |

---

## 2. Resumen ejecutivo

**NexU** es una plataforma web de alquiler de alojamientos (recintos) orientada específicamente a la comunidad universitaria. Conecta a **estudiantes** que buscan un lugar para vivir cerca de su universidad con **anfitriones** (propietarios) que ofrecen habitaciones, departamentos, estudios o casas en zonas próximas a los campus.

A diferencia de las plataformas de alquiler generalistas, NexU está diseñada alrededor de las necesidades concretas de los universitarios: cercanía al campus, precios accesibles, transparencia (reseñas verificadas y reglas claras de la propiedad) y un proceso de reserva simple y seguro. La plataforma soporta dos roles principales —arrendatario (*tenant*) y anfitrión (*host*)— e incorpora búsqueda con mapa y filtros avanzados, publicación guiada de recintos, gestión de reservas, reseñas, mensajería y notificaciones.

Técnicamente, NexU evoluciona desde un proyecto legacy (Next.js + Oracle) hacia una **arquitectura desacoplada**: un frontend en React + Vite + TypeScript y un backend en Python + FastAPI. El mercado inicial es **Lima, Perú**, con precios en soles (PEN).

---

## 3. Contexto y problema

### 3.1 Contexto

Cada año, miles de estudiantes se trasladan a otra ciudad o distrito para cursar estudios superiores. Encontrar alojamiento cercano, seguro y a un precio razonable es una de sus primeras y mayores dificultades. Hoy esa búsqueda se reparte entre grupos de redes sociales, avisos clasificados informales, recomendaciones de boca en boca y plataformas de alquiler generalistas que no están pensadas para el contexto estudiantil.

### 3.2 Problemas identificados

- **Falta de información centralizada y confiable.** La oferta está dispersa en canales informales (grupos de WhatsApp/Facebook, anuncios pegados en la universidad), sin estandarización ni verificación.
- **Poca transparencia.** Es difícil conocer de antemano el estado real del recinto, las reglas de convivencia, los servicios incluidos o la reputación del propietario.
- **Inseguridad en el proceso.** Los acuerdos informales no ofrecen garantías ni un canal claro de comunicación, lo que expone tanto a estudiantes como a propietarios a estafas o malentendidos.
- **Ubicación no optimizada.** Las plataformas generalistas no priorizan la cercanía al campus, que es el criterio número uno para un estudiante.
- **Precios poco claros.** Cargos ocultos o falta de un desglose transparente (precio por noche/mes, tarifa de servicio, total) dificultan la planificación del presupuesto estudiantil.

### 3.3 Oportunidad

Existe la oportunidad de crear una plataforma especializada que centralice la oferta de alojamiento estudiantil, estandarice la información, aporte confianza mediante reseñas verificadas y comunicación dentro de la plataforma, y priorice la cercanía geográfica a las universidades.

---

## 4. Objetivos del producto

### 4.1 Objetivo general

Ofrecer a la comunidad universitaria una plataforma confiable, transparente y fácil de usar para buscar, comparar y reservar alojamientos cercanos a su universidad, y para que los propietarios publiquen y gestionen sus recintos de forma sencilla.

### 4.2 Objetivos específicos

1. **Centralizar la oferta** de alojamientos cercanos a universidades en un único catálogo estandarizado.
2. **Facilitar la búsqueda** mediante filtros relevantes (distrito, precio, capacidad, servicios) y visualización en mapa.
3. **Aportar confianza** a través de reseñas verificadas vinculadas a reservas reales, perfiles de anfitrión y reglas de la propiedad explícitas.
4. **Simplificar la publicación** de recintos con un asistente guiado paso a paso para los anfitriones.
5. **Hacer transparente el precio** con un desglose claro (precio por noche, tarifa de servicio, total) antes de confirmar la reserva.
6. **Gestionar el ciclo completo de la reserva** (solicitud, confirmación, finalización, cancelación) para ambas partes.
7. **Habilitar la comunicación** segura entre arrendatario y anfitrión dentro de la plataforma.

---

## 5. Público objetivo y personas

### 5.1 Segmentos de usuario

- **Estudiante arrendatario (*tenant*)** — usuario principal que busca y reserva alojamiento.
- **Anfitrión (*host*)** — propietario que publica recintos y gestiona reservas. Un usuario puede tener ambos roles (*both*).
- **Administrador** (rol de soporte, a detallar en v2) — supervisa la plataforma, modera contenido y resuelve incidencias.

### 5.2 Personas

**Persona 1 — Camila, la estudiante que llega de otra ciudad**
- 19 años, ingresa a la universidad y debe mudarse a Lima.
- Presupuesto ajustado; necesita algo cercano al campus y seguro.
- Quiere ver fotos reales, reseñas y el precio total sin sorpresas antes de comprometerse.

**Persona 2 — Jorge, el propietario cercano al campus**
- 45 años, tiene un departamento con habitaciones disponibles cerca de una universidad.
- Quiere alquilar a estudiantes de forma ordenada, publicar fácilmente y recibir solicitudes confiables.
- Necesita ver sus reservas, ingresos y reseñas en un solo panel.

**Persona 3 — Andrea, la estudiante de intercambio (estancia corta)**
- 22 años, requiere alojamiento por un semestre o por unas semanas.
- Valora la flexibilidad de fechas, la comunicación rápida con el anfitrión y la ubicación.

---

## 6. Propuesta de valor

NexU se diferencia de las plataformas de alquiler generalistas y de los canales informales por estar **enfocado en el estudiante universitario**:

- **Especialización en cercanía al campus.** La búsqueda y el mapa priorizan la proximidad a las universidades, el criterio decisivo para un estudiante.
- **Confianza y transparencia.** Reseñas verificadas (ligadas a reservas reales), perfiles de anfitrión, reglas de la propiedad y desglose de precios claro.
- **Proceso simple y seguro.** Reserva en línea con estados definidos y comunicación dentro de la plataforma, evitando los riesgos de los acuerdos informales.
- **Pensado para presupuestos estudiantiles.** Filtros por precio y desglose transparente del costo total (precio + tarifa de servicio).
- **Publicación guiada.** Asistente paso a paso que facilita a los anfitriones poner su recinto en línea con información completa y estandarizada.

> **En una frase:** NexU es "la forma confiable y centralizada de encontrar dónde vivir cerca de tu universidad".

---

## 7. Alcance

### 7.1 Dentro del alcance (visión del producto)

- Registro e inicio de sesión con selección de rol (arrendatario / anfitrión).
- Catálogo de recintos con búsqueda, filtros avanzados y visualización en mapa.
- Página de detalle del recinto (galería, descripción, servicios, ubicación, reglas, reseñas, información del anfitrión).
- Reserva en línea con selección de fechas, número de huéspedes y desglose de precio.
- Gestión de reservas para el arrendatario ("Mis reservas") y para el anfitrión.
- Publicación de recintos mediante asistente guiado (wizard).
- Panel del anfitrión con estadísticas, propiedades y reservas.
- Sistema de reseñas y calificaciones.
- Cuenta de usuario: perfil, información personal, mensajería y notificaciones.

### 7.2 Fuera del alcance (por ahora)

- **Pasarela de pago real.** El flujo de reserva contempla el desglose de precios, pero la integración con un proveedor de pagos se planificará más adelante.
- **Aplicación móvil nativa.** El producto se concibe como aplicación web.
- **Contratos legales y firma electrónica.** No se incluye gestión legal de arrendamientos en esta versión.
- **Panel de administración avanzado** (moderación, analítica global): se detallará en la versión 2.
- **Expansión geográfica** fuera del mercado inicial (Lima, Perú).

### 7.3 Nota sobre el estado actual

El producto se encuentra en migración hacia una arquitectura desacoplada (frontend React + Vite y backend FastAPI). El frontend actual funciona con datos de prueba (*mock data*) mientras se construye el backend. Este PRD describe la **visión completa** del producto, no únicamente lo ya implementado.

---

## 8. Requisitos funcionales

Los requisitos se agrupan por módulo. Se utiliza la nomenclatura `RF-<módulo>-<n>`.

### 8.1 Autenticación y roles (RF-AUTH)

- **RF-AUTH-1.** El sistema debe permitir el registro de un usuario con nombre, apellido, correo, contraseña y rol (arrendatario o anfitrión).
- **RF-AUTH-2.** El sistema debe permitir iniciar sesión con correo y contraseña.
- **RF-AUTH-3.** El sistema debe soportar tres roles: arrendatario (*tenant*), anfitrión (*host*) y ambos (*both*).
- **RF-AUTH-4.** El sistema debe restringir el acceso a ciertas vistas según el rol (rutas protegidas), p. ej. el panel de anfitrión.
- **RF-AUTH-5.** El sistema debe permitir cerrar sesión.

### 8.2 Búsqueda y filtros (RF-SEARCH)

- **RF-SEARCH-1.** El sistema debe mostrar un catálogo de recintos disponibles.
- **RF-SEARCH-2.** El sistema debe permitir buscar por texto libre (consulta).
- **RF-SEARCH-3.** El sistema debe permitir filtrar por distrito, rango de precio, capacidad y servicios (*amenities*).
- **RF-SEARCH-4.** El sistema debe ofrecer filtros rápidos y filtros avanzados.
- **RF-SEARCH-5.** El sistema debe mostrar los resultados en un mapa, priorizando la cercanía a las universidades.
- **RF-SEARCH-6.** El sistema debe paginar los resultados de búsqueda.

### 8.3 Detalle del recinto (RF-PROP)

- **RF-PROP-1.** El sistema debe mostrar una galería de imágenes del recinto.
- **RF-PROP-2.** El sistema debe mostrar información básica: título, descripción, capacidad, dormitorios, camas y baños.
- **RF-PROP-3.** El sistema debe mostrar el precio por noche y la moneda (PEN).
- **RF-PROP-4.** El sistema debe mostrar los servicios (*amenities*) disponibles.
- **RF-PROP-5.** El sistema debe mostrar la ubicación en mapa (distrito, ciudad).
- **RF-PROP-6.** El sistema debe mostrar las reglas de la propiedad y los horarios de check-in/check-out.
- **RF-PROP-7.** El sistema debe mostrar las reseñas y la calificación del recinto.
- **RF-PROP-8.** El sistema debe mostrar información del anfitrión.

### 8.4 Reservas (RF-BOOK)

- **RF-BOOK-1.** El sistema debe permitir seleccionar fechas de entrada y salida y número de huéspedes.
- **RF-BOOK-2.** El sistema debe calcular y mostrar un desglose de precio: precio por noche, número de noches, tarifa de servicio y total.
- **RF-BOOK-3.** El sistema debe permitir al arrendatario enviar un mensaje al anfitrión junto con la solicitud de reserva.
- **RF-BOOK-4.** El sistema debe gestionar los estados de la reserva: pendiente, confirmada, completada y cancelada.
- **RF-BOOK-5.** El sistema debe mostrar al arrendatario el listado de sus reservas ("Mis reservas") con su estado.
- **RF-BOOK-6.** El sistema debe permitir ver el detalle de una reserva.
- **RF-BOOK-7.** El sistema debe confirmar al usuario el éxito de la reserva.

### 8.5 Publicación de recintos — asistente (RF-HOST-PUB)

El sistema debe ofrecer al anfitrión un asistente guiado (*wizard*) de varios pasos para publicar un recinto:

- **RF-HOST-PUB-1.** Selección del tipo de recinto (apartamento, casa, estudio, loft, cabaña, villa).
- **RF-HOST-PUB-2.** Ubicación (dirección, distrito).
- **RF-HOST-PUB-3.** Capacidad (huéspedes, dormitorios, camas, baños).
- **RF-HOST-PUB-4.** Servicios (*amenities*).
- **RF-HOST-PUB-5.** Fotografías.
- **RF-HOST-PUB-6.** Título.
- **RF-HOST-PUB-7.** Descripción.
- **RF-HOST-PUB-8.** Precio por noche.
- **RF-HOST-PUB-9.** Revisión final y publicación.
- **RF-HOST-PUB-10.** El sistema debe permitir navegar entre pasos (avanzar/retroceder) sin perder la información ingresada.

### 8.6 Panel del anfitrión (RF-HOST)

- **RF-HOST-1.** El sistema debe mostrar un panel con estadísticas: total de reservas, ingresos totales, calificación promedio y ticket promedio.
- **RF-HOST-2.** El sistema debe mostrar al anfitrión el listado de sus propiedades.
- **RF-HOST-3.** El sistema debe permitir activar o desactivar una propiedad.
- **RF-HOST-4.** El sistema debe mostrar al anfitrión las reservas recibidas y su detalle.
- **RF-HOST-5.** El sistema debe permitir al anfitrión gestionar el estado de las reservas (p. ej. confirmar o rechazar).
- **RF-HOST-6.** El sistema debe mostrar un feed de actividad reciente.

### 8.7 Reseñas (RF-REV)

- **RF-REV-1.** El sistema debe permitir que un arrendatario deje una reseña con calificación (estrellas) y comentario asociada a una reserva.
- **RF-REV-2.** El sistema debe mostrar las reseñas en la página del recinto.
- **RF-REV-3.** El sistema debe calcular y mostrar la calificación promedio y el número de reseñas.
- **RF-REV-4.** El sistema debe permitir al anfitrión ver las reseñas de sus recintos.

### 8.8 Cuenta, mensajería y notificaciones (RF-ACC)

- **RF-ACC-1.** El sistema debe permitir ver y editar el perfil del usuario (avatar, biografía, teléfono).
- **RF-ACC-2.** El sistema debe permitir gestionar la información personal del usuario.
- **RF-ACC-3.** El sistema debe ofrecer mensajería entre arrendatario y anfitrión.
- **RF-ACC-4.** El sistema debe mostrar notificaciones al usuario (p. ej. cambios de estado de reservas, nuevos mensajes).

---

## 9. Requisitos no funcionales

Se utiliza la nomenclatura `RNF-<n>`.

### 9.1 Usabilidad

- **RNF-1.** La interfaz debe ser intuitiva y orientada al usuario estudiante, con un flujo de búsqueda-reserva que se complete en pocos pasos.
- **RNF-2.** El producto debe ser responsive y usable en dispositivos móviles y de escritorio.
- **RNF-3.** Los textos de la interfaz deben estar en español.

### 9.2 Rendimiento

- **RNF-4.** Las páginas principales (catálogo, detalle) deben cargar en un tiempo razonable; el listado debe usar paginación para no cargar todo el catálogo de una vez.
- **RNF-5.** La búsqueda y los filtros deben responder de forma fluida (con técnicas como *debounce* en la entrada de búsqueda).

### 9.3 Seguridad

- **RNF-6.** Las contraseñas deben almacenarse de forma segura (cifradas/hasheadas), nunca en texto plano.
- **RNF-7.** El acceso a vistas y operaciones debe controlarse según el rol y el estado de autenticación del usuario.
- **RNF-8.** La comunicación cliente-servidor debe realizarse sobre canales seguros (HTTPS).
- **RNF-9.** Los datos personales de los usuarios deben tratarse de forma confidencial.

### 9.4 Escalabilidad y mantenibilidad

- **RNF-10.** La arquitectura debe ser desacoplada (frontend y backend independientes) para permitir su evolución por separado.
- **RNF-11.** El código del frontend debe organizarse por funcionalidades (*features*) con componentes, servicios y tipos bien delimitados.
- **RNF-12.** La plataforma debe poder crecer en número de recintos y usuarios sin degradación significativa del rendimiento.

### 9.5 Compatibilidad y disponibilidad

- **RNF-13.** La aplicación debe funcionar correctamente en navegadores web modernos.
- **RNF-14.** La plataforma debe aspirar a una alta disponibilidad del servicio.

### 9.6 Internacionalización y localización

- **RNF-15.** La plataforma debe operar en el contexto del mercado inicial: Lima, Perú, con moneda en soles (PEN) y formato de fecha/hora local.

---

> **Fin de la versión 1.0 (secciones 1–9).**
> La **versión 2** incluirá: historias de usuario con criterios de aceptación, arquitectura técnica, modelo de datos, flujos principales, métricas/KPIs, roadmap, riesgos y supuestos, y glosario.
