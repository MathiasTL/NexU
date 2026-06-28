# NexU Backend — Decisiones Técnicas

*(Creado: 2026-06-28)*

> Este documento registra cada decisión técnica no obvia tomada al diseñar el backend.
> Para cada decisión se documenta el problema, las opciones consideradas, la elección y sus implicaciones.

---

## D1 — rating y reviewsCount: calculados en tiempo de ejecución

**Problema:**  
El frontend consume `Property.rating` y `Property.reviewsCount`. El mock los tiene como campos fijos. El backend debe decidir si almacenarlos o calcularlos.

**Opciones:**
- A) Almacenar como columnas en la tabla `properties` y actualizar en cada insert/update de review.
- B) Calcular en tiempo de ejecución con un JOIN/subquery cada vez que se pide una propiedad.
- C) Calcular en la capa de servicio consultando el repositorio de reviews.

**Decisión elegida: C (cálculo en servicio)**

Razones:
- En esta fase no hay base de datos, así que B y C son equivalentes en costo.
- C es más transparente: el código de `PropertyService._enrich()` es explícito y testeable.
- Evita datos inconsistentes (A requiere transacciones o eventual consistency).
- Cuando llegue PostgreSQL: se puede optimizar con `SELECT AVG(rating) FROM reviews WHERE property_id = ?` dentro del repositorio, sin tocar el servicio.

**Implicación para el frontend:**  
Ninguna. El contrato de `Property` en la respuesta sigue incluyendo `rating` y `reviewsCount`.

**Implicación para PostgreSQL:**  
El campo `rating` y `reviews_count` NO se crean en la tabla `properties`. Se computan en query. Para escalar con miles de propiedades, se puede materializar un `VIEW` o agregar una columna calculada.

---

## D2 — Review: normalizar datos de reviewer

**Problema:**  
Los mocks del frontend tenían `Review.reviewerFirstName`, `reviewerLastName`, `reviewerAvatar` copiados al crear la reseña (desnormalizados). Si el usuario cambia su nombre o avatar, las reseñas antiguas quedan desactualizadas.

**Opciones:**
- A) Mantener la desnormalización: guardar first_name/last_name/avatar en la tabla `reviews`.
- B) Normalizar: guardar solo `reviewer_id` y hacer JOIN con users al servir.

**Decisión elegida: B (normalizar)**

Razones:
- Un usuario puede cambiar su nombre o foto de perfil. Con A, todas las reseñas anteriores mostrarían datos obsoletos.
- En NexU el contexto es universitario: los estudiantes pueden cambiar de apellido, agregar más iniciales, etc.
- El JOIN es simple y barato a la escala actual (estudiantes universitarios de Lima, no millones de reviews).

**Implementación actual:**
`ReviewService.get_by_property_id()` itera reviews, consulta `user_repo.get_by_id(r.reviewer_id)`, y construye el `ReviewResponse` con datos frescos del usuario.

**Contrato con el frontend:**  
No cambia. La respuesta sigue teniendo `reviewerFirstName`, `reviewerLastName`, `reviewerAvatar` en el JSON. La diferencia es interna.

**Implicación para PostgreSQL:**  
`reviews` table tiene solo `reviewer_id` (FK). El endpoint hace `JOIN users ON reviews.reviewer_id = users.id`.

---

## D3 — JWT con access + refresh tokens

**Problema:**  
¿Cómo manejar la autenticación entre un frontend SPA y el backend?

**Opciones:**
- A) Sesiones del servidor (cookies httpOnly con session ID).
- B) JWT de larga duración (1 día o más) en localStorage.
- C) JWT de corta duración (30 min access) + refresh token (7 días).

**Decisión elegida: C**

Razones:
- A requiere estado en el servidor (Redis o DB de sesiones), incompatible con la fase mock-first.
- B expone a robo de token con ventana de ataque grande.
- C balancea seguridad y UX: el usuario no se desloguea frecuentemente, pero los tokens robados expiran rápido.
- Es el patrón estándar para APIs REST en 2025+.

**Implementación:**
- `create_access_token(user_id)` → JWT firmado con HS256, exp = 30 min.
- `create_refresh_token(user_id)` → JWT firmado, exp = 7 días, `"type": "refresh"`.
- El tipo se verifica en `verify_access_token` vs `verify_refresh_token` para prevenir uso cruzado.
- El frontend almacena ambos en `localStorage` (keys: `nextu_access_token`, `nextu_refresh_token`).
- En producción se puede migrar el refresh token a cookie httpOnly.

**Endpoints relevantes:**
- `POST /api/v1/auth/login` → `{ access_token, refresh_token, user }`
- `POST /api/v1/auth/register` → `{ access_token, refresh_token, user }`
- `POST /api/v1/auth/refresh` → `{ access_token }` (enviar refresh_token en Bearer header)

---

## D4 — pricePerNight: campo deprecated

**Problema:**  
El frontend migró el modelo de reserva de "por noches" a "por meses" (`startMonth + durationMonths`). Sin embargo, la entidad `Property` del legacy tenía `pricePerNight`. Algunos componentes del wizard aún guardan `pricePerNight` por compatibilidad.

**Opciones:**
- A) Eliminar `price_per_night` completamente.
- B) Mantenerlo como campo opcional con valor por defecto 0.

**Decisión elegida: B (mantener, deprecated)**

Razones:
- El wizard del frontend sigue enviando el campo en algunos pasos.
- Eliminarlo causaría errores de validación Pydantic en el request antes de que el frontend lo quite.
- Marcarlo deprecated en schemas es más seguro y permite transición gradual.

**Implementación:**
```python
class CreatePropertyRequest(BaseSchema):
    price_per_month: float         # campo primario
    price_per_night: float = 0.0   # deprecated, ignorado en lógica de negocio
```

**Cuándo eliminarlo:**  
Cuando el frontend confirme que ningún componente envía `pricePerNight` en el payload. Entonces se quita de `CreatePropertyRequest` y se añade a la migración de base de datos como columna a eliminar.

---

## D5 — Upload de imágenes: StorageRepository abstracto

**Problema:**  
El wizard del frontend (Step5) necesita subir fotos reales. El backend necesita un endpoint de upload. ¿Cómo implementarlo para que sea fácil conectar S3/GCS después?

**Decisión:**  
`StorageRepository` como Protocol con un solo método `upload()`. Implementación actual: `MemoryStorageRepository` que retorna una URL placeholder. 

```python
class StorageRepository(Protocol):
    def upload(self, filename: str, content: bytes, content_type: str) -> str: ...
```

**Para conectar S3:**
```python
class S3StorageRepository:
    def upload(self, filename: str, content: bytes, content_type: str) -> str:
        key = f"properties/{uuid.uuid4().hex}_{filename}"
        self._client.put_object(Bucket=self._bucket, Key=key, Body=content, ContentType=content_type)
        return f"https://{self._bucket}.s3.amazonaws.com/{key}"
```

En `main.py`, cambiar:
```python
app.state.storage_repo = S3StorageRepository(bucket=settings.aws_s3_bucket)
```

**El endpoint `POST /api/v1/properties/upload-images` no cambia.**

---

## D6 — CORS policy

**Problema:**  
El frontend corre en `http://localhost:5173` (Vite dev server). Las requests desde el browser fallarán sin CORS configurado.

**Decisión:**  
```python
allow_origins=settings.cors_origins_list  # desde .env: "http://localhost:5173,http://localhost:3000"
allow_credentials=True
allow_methods=["*"]
allow_headers=["*"]
```

`allow_credentials=True` es necesario si en el futuro se usan cookies httpOnly para refresh tokens.

**En producción:**  
`CORS_ORIGINS` en `.env` debe listar solo el dominio de producción del frontend. Nunca `"*"` en producción.

---

## D7 — API versioning: prefijo /api/v1/

**Decisión:**  
Todos los endpoints tienen el prefijo `/api/v1/`. El router principal lo agrega:

```python
router = APIRouter(prefix="/api/v1")
```

**Por qué:**
- Permite introducir `/api/v2/` en el futuro sin romper clientes existentes.
- El frontend configura `VITE_API_BASE_URL=http://localhost:8000/api/v1` como variable de entorno — la versión está centralizada.
- Es la convención estándar de APIs REST escalables.

**Cuándo crear v2:**  
Solo si hay un cambio de contrato incompatible (breaking change). Para cambios backward-compatible (agregar campos), no hace falta.

---

## D8 — PaginatedResponse: preparado pero no activo

**El frontend tiene definida `PaginatedResponse<T>` en sus tipos globales**, pero los servicios mock no la usan (devuelven arrays completos). El backend sigue la misma estrategia en esta fase.

**Por qué no activarla ahora:**
- Activar paginación requiere que el frontend agregue `page` y `pageSize` params a todas sus llamadas.
- Es un cambio coordinado que se hace en el Paso 4 (integración real).
- El schema `PaginatedResponse` ya existe en `app/schemas/common.py`, listo para usarse.

**Cuando activar:**  
En el Paso 4, modificar los endpoints de lista que retornen más de 20-30 items en producción (principalmente `GET /properties` y `GET /bookings`). El frontend deberá agregar manejo de paginación en `property.service.ts` y `booking.service.ts`.

---

## D9 — Passwords en mock_data: hash computado al importar

**Problema:**  
Los mocks de usuarios necesitan passwords hasheados. ¿Hardcodear un hash fijo o computarlo?

**Decisión:**  
Computar en tiempo de importación:
```python
from passlib.context import CryptContext
_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
_HASH = _pwd.hash("password123")
```

**Por qué no hardcodear:**
- bcrypt usa salt aleatorio; el hash varía entre ejecuciones pero siempre es verificable con `verify()`.
- Hardcodear un hash específico acoplaría el mock a una versión específica de passlib.

**Credenciales de demo:**
- Todos los usuarios: password `password123`
- Ana García: `ana.garcia@pucp.pe` (tenant)
- Carlos Mendoza: `carlos.mendoza@gmail.com` (host)
- Lucía Torres: `lucia.torres@uni.pe` (tenant)

---

## D10 — Repositorios en app.state vs. módulo global

**Problema:**  
¿Dónde guardar las instancias singleton de repositorios en memoria?

**Opciones:**
- A) Variable global de módulo en `repositories/memory/__init__.py`.
- B) `app.state` de FastAPI, inicializado en `lifespan`.

**Decisión: B (app.state)**

Razones:
- A complica el testing: un test no puede reemplazar la instancia global sin monkeypatching.
- B permite inyectar repositorios distintos en tests usando `app.state.user_repo = MockUserRepo()` antes de cada test.
- B es el patrón recomendado por FastAPI para recursos de aplicación (DB connections, etc.).
- Es explícito: en `main.py` se ve exactamente qué se inicializa.
