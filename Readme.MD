# Dulce Ezeiza

Plataforma web para una panadería y pastelería artesanal. Es un catálogo administrable — **no es un e-commerce**: no tiene carrito de compras, pagos online ni precios publicados. Cuenta con un sitio público donde cualquier visitante puede ver el catálogo, buscar y filtrar productos, leer las novedades del local y enviar consultas, y un panel de administración privado para gestionar todo el contenido.

## Integrantes

- Lucas Caceres - 1157093
- Federico Minigozi - 1173274
- Tomas Morbach - 1178309

**Cátedra:** Aplicaciones Interactivas 2026

## Stack tecnológico

- **Frontend:** React 19 + Vite, con React Router 7. CSS propio (sin frameworks de estilos).
- **Backend:** Node.js + Express
- **Base de datos:** SQL Server (probado con SQL Server Express, instancia `SQLEXPRESS`)
- **ORM:** Sequelize
- **Autenticación:** JSON Web Tokens (JWT) + bcrypt para el hash de contraseñas
- **Mails:** Nodemailer (Gmail con contraseña de aplicación, o Ethereal para pruebas)

## Estructura del proyecto

Monorepo con dos carpetas: `backend/` y `frontend/`. Además, `postman/` tiene la colección de pruebas de la API.

### Backend

```
backend/
├── app.js                   # Punto de entrada: arma Express, conecta la base, levanta el server
├── databases/
│   └── database.js          # Instancia de Sequelize (conexión a SQL Server)
├── models/                  # Un archivo por entidad + Associations.js con las relaciones
├── services/                # La lógica de negocio. No conoce req/res.
├── controllers/             # Traducen HTTP: leen req, llaman al service, arman la respuesta con res.
├── routes/
│   ├── api.js                # Router principal, junta las rutas de cada entidad
│   └── api/                  # Un archivo de rutas por entidad
├── middlewares/
│   ├── Autorizacion.middlewares.js  # verificarToken y verificarAdmin
│   └── RateLimit.middlewares.js     # Limites de pedidos por IP (login, recuperacion, consultas)
│   └── Origen.middlewares.js        # verificarOrigen: solo acepta pedidos del frontend
├── database-scripts/
│   └── crear-base.sql       # Script de creación de la base desde cero
├── .env.example              # Plantilla de variables de entorno
└── package.json
```

### Frontend

```
frontend/
├── public/img/               # Fotos de productos y del local (SVG), servidas tal cual
├── src/
│   ├── main.jsx               # Punto de entrada: monta <App> dentro del SesionProvider
│   ├── App.jsx                # Todas las rutas del sitio y del panel
│   ├── index.css              # Estilos globales: colores, tipografías, botones, formularios
│   ├── pages/                 # Una pantalla por archivo (sitio público)
│   │   └── admin/             # Pantallas del panel de administración
│   ├── components/            # Piezas reutilizables (Navbar, Footer, tarjetas, fotos...)
│   │   └── admin/             # Piezas del panel (layout, diálogo de confirmación, interruptor...)
│   ├── services/              # Las ÚNICAS funciones que hablan con la API (una por endpoint)
│   ├── mocks/                 # Datos de prueba con la misma forma que el JSON del backend
│   ├── hooks/                 # usePedido (carga de datos) y useSesion
│   ├── context/               # Sesión del administrador (token y datos del usuario)
│   └── utils/                 # Formato de fechas, validaciones, armado de links
├── .env.example               # Plantilla de variables de entorno del frontend
└── package.json
```

## Arquitectura

### Backend

El backend sigue una arquitectura por capas, sin capa de repository:

```
ruta → controller → service → model → base de datos
```

- **Ruta:** conecta un verbo HTTP + path con una función del controller, y decide qué middlewares tiene que pasar antes (autenticación, autorización).
- **Controller:** traduce HTTP. Lee `req`, arma un objeto de datos limpio, llama al service, y responde con `res`. No tiene lógica de negocio ni SQL.
- **Service:** tiene toda la lógica de negocio y habla con los models. Nunca recibe `req` ni `res` — recibe datos ya procesados y devuelve datos o tira errores.
- **Model:** representa una tabla de la base a través de Sequelize.

Las relaciones entre entidades se definen todas juntas en `models/Associations.js`, no dispersas en cada model.

### Frontend

```
página → hook usePedido → service → pedir() → API
```

- **Páginas y componentes** nunca hacen `fetch`: piden los datos a un service y se ocupan solo de mostrarlos.
- **`usePedido`** es el hook que usan todas las pantallas para cargar datos. Devuelve `{ datos, error, cargando, reintentar }`, así cada pantalla muestra un esqueleto mientras carga, un mensaje con "Reintentar" si falla, y puede volver a pedir los datos después de guardar algo.
- **Services** (`src/services/`): una función por endpoint (`obtenerProductos`, `crearNovedad`, `cambiarEstadoConsulta`...). Es el único lugar del frontend que conoce las URLs de la API y la forma de sus respuestas.
- **`pedir()`** (`services/api.js`) es el envoltorio de `fetch`: arma la URL, manda el JSON y, si la API responde con error, lanza un `ErrorApi` con el código HTTP y el mensaje del backend, que las pantallas muestran tal cual. `pedirAdmin()` es lo mismo pero agrega el token del administrador en el header `x-access-token`.

#### Datos de prueba (mocks)

Cada service tiene dos caminos: el pedido real a la API, o devolver datos de prueba de `src/mocks/`. Cuál se usa lo decide la variable `VITE_USAR_MOCKS` del `.env.local`. Con mocks, el frontend funciona completo sin backend ni base de datos (incluido el panel: el login de prueba es el mismo del admin del seed).

Esto permitió construir y probar el frontend en paralelo con el backend, y trabajar desde computadoras sin SQL Server. Los mocks copian exactamente la forma del JSON que devuelve el backend (por ejemplo, la categoría de un producto viene en `producto.Categorium`, como la nombra Sequelize) y reproducen sus reglas (un producto con consultas no se puede borrar, una novedad programada no se ve en el sitio...), para que pasar al backend real no obligue a cambiar ninguna pantalla.

#### Sesión del administrador

Al iniciar sesión, el token y los datos del usuario se guardan en `localStorage` y quedan disponibles para toda la app a través de un Context (`SesionProvider` + `useSesion`). Las rutas del panel están envueltas en `RutaProtegida`, que manda al login a quien no tenga sesión (y después del login lo devuelve a la pantalla que quería ver). El frontend lee la fecha de vencimiento del token y cierra la sesión solo cuando vence; si la API responde 401, también. "Cerrar sesión" borra el token guardado: no hace falta un endpoint, porque el backend no lleva una lista de tokens.

Nada de esto es la seguridad real: cualquiera puede escribir `/admin` en el navegador. Lo que protege los datos es que el backend rechaza todo pedido de administración sin un token válido.

## Cómo levantar el proyecto

Versión resumida (para el paso a paso completo, con troubleshooting, ver el manual de instalación). Hacen falta Node.js (versión 20 o superior) y SQL Server.

**Base de datos**

1. Clonar el repositorio.
2. Crear la base `DulceEzeiza` en SQL Server (SSMS) y correr `backend/database-scripts/crear-base.sql`. El script crea las tablas y carga datos de ejemplo: categorías, productos con fotos, novedades, consultas, los datos del local y el usuario administrador.

**Backend** (en una terminal)

3. Copiar `backend/.env.example` a `backend/.env` y completar los valores con los datos de tu instalación local.
4. Parado en `backend/`, correr `npm install`.
5. Correr `npm start` (o `npm run dev` para que se reinicie solo con nodemon).
6. El servidor queda escuchando en `http://localhost:8080` (o el puerto que hayas puesto en `PORT`).

**Frontend** (en otra terminal)

7. Copiar `frontend/.env.example` a `frontend/.env.local`, y poner `VITE_USAR_MOCKS=false` para usar el backend real (con `true` funciona sin backend, con datos de prueba).
8. Parado en `frontend/`, correr `npm install` y después `npm run dev`.
9. Abrir `http://localhost:5173`. El panel está en `http://localhost:5173/admin` (usuario `admin@dulceezeiza.com`, contraseña `Admin123!`).

El frontend tiene que correr en el puerto que figura en `FRONTEND_URL` del `.env` del backend (por defecto, 5173): la API rechaza los pedidos de cualquier otro origen. Si Vite avisa que el 5173 está ocupado y levanta en otro, hay que cerrar el proceso que lo ocupa.

Para generar la versión final del frontend (archivos estáticos optimizados en `frontend/dist/`): `npm run build`.

## Pantallas

### Sitio público

| Ruta | Pantalla |
|---|---|
| `/` | Inicio: presentación, especialidades destacadas, categorías y últimas novedades |
| `/catalogo` | Catálogo con buscador y filtros por categoría y sin TACC (los filtros quedan en la URL, así un link se puede compartir con la búsqueda hecha) |
| `/productos/:id` | Detalle de un producto, con su galería de fotos y productos relacionados |
| `/novedades` | Listado de novedades publicadas |
| `/novedades/:id` | Detalle de una novedad |
| `/nosotros` | Historia del local |
| `/contacto` | Formulario de consulta (se puede asociar a productos) y datos del local con mapa |

Los datos del local (dirección, teléfono, horarios y redes) salen de la base y se muestran en el pie de todas las páginas.

### Panel de administración

| Ruta | Pantalla |
|---|---|
| `/admin/login` | Ingreso del administrador (no está linkeado desde el sitio) |
| `/admin/recuperar` | Recuperar contraseña con un código enviado por mail |
| `/admin` | Inicio del panel: resumen con contadores, consultas sin responder y novedades recientes |
| `/admin/consultas` | Consultas por estado (pendiente, respondida, cerrada), con respuesta por mail |
| `/admin/productos` | Listado de productos con buscador y filtros; destacar y eliminar |
| `/admin/productos/nuevo` y `/:id` | Alta y edición de un producto, con sus fotos (agregar, quitar, ordenar) |
| `/admin/categorias` | Alta, edición, ocultar y eliminar categorías, en una sola pantalla |
| `/admin/novedades` | Listado de novedades: publicadas, programadas y borradores |
| `/admin/novedades/nueva` y `/:id` | Editor de novedades, con fecha de publicación y vista previa |
| `/admin/configuracion` | Datos del local (dirección, teléfono, horarios, redes) |
| `/admin/perfil` | Datos del administrador y cambio de contraseña |

**Diseño:** el sitio está pensado para verse en pantallas de computadora. El panel se adapta a cualquier ancho desde 1024px (notebooks con la escala de Windows incluida) hasta monitores grandes, con tamaños fluidos en lugar de anchos fijos. La versión para celular queda fuera del alcance de esta entrega; los estilos ya tienen definidos los puntos de corte para sumarla.

**Accesibilidad:** todos los formularios tienen etiquetas asociadas a sus campos, los errores se anuncian a los lectores de pantalla y el foco va al primer campo con problemas. Los diálogos de confirmación usan el elemento `<dialog>` nativo (mantienen el foco adentro y se cierran con Esc).

## Modelo de roles y autenticación

Hay dos niveles de acceso:

- **Visitante anónimo:** puede navegar y buscar en el catálogo público, y enviar consultas desde el formulario de contacto. No necesita cuenta ni token.
- **Administrador:** acceso completo al panel (alta, baja y modificación de categorías, productos y datos del comercio, y gestión de consultas). Necesita un token válido con `rol: 'admin'`.

No hay registro público: el único usuario del sistema es el administrador, que se crea directamente en la base (el script `crear-base.sql` ya lo inserta). Versiones anteriores del proyecto tenían un rol `cliente` con registro y login propios; se eliminó porque obligaba a los visitantes a crearse una cuenta solo para mandar una consulta, cuando la consigna plantea esa acción como propia del visitante.

En el frontend, el login del administrador vive en una ruta que no aparece en la navegación del sitio público (`/admin/login`). Esto es una decisión de experiencia de usuario (que el visitante no vea algo que no le sirve), **no** una medida de seguridad: cualquier URL que use el frontend se puede descubrir. La seguridad real está en el backend (los middlewares de abajo y el límite de intentos de login).

El login devuelve un JWT que hay que mandar en cada request protegida, en el header:

```
x-access-token: <token>
```

El token incluye el `id` del usuario y su `rol`. Dos middlewares se encargan de la seguridad:

- `verificarToken`: chequea que el token exista y sea válido (autenticación — "¿quién sos?"). Si falta o es inválido, corta con **401**.
- `verificarAdmin`: se usa siempre después de `verificarToken`, y chequea que el rol sea `admin` (autorización — "¿te alcanza el rol para esto?"). Si no, corta con **403**. Aunque hoy haya un solo rol, se mantiene como defensa en profundidad y para que el sistema quede abierto a sumar roles en el futuro.

### Límite de pedidos (rate limiting)

Los endpoints públicos que se pueden abusar tienen un límite de pedidos por IP, implementado con [`express-rate-limit`](https://www.npmjs.com/package/express-rate-limit) en `middlewares/RateLimit.middlewares.js`. Al superarlo, la API responde **429** ("Too Many Requests") y la request nunca llega al controller.

| Endpoint | Límite | Por qué |
|---|---|---|
| `POST /api/usuarios/login` | 5 intentos **fallidos** cada 15 minutos | Es la única puerta al panel: frena a quien intente adivinar la contraseña probando muchas. Los logins exitosos no cuentan. |
| `POST /api/usuarios/recuperar-password` | 3 pedidos por hora | Cada pedido manda un mail: evita que se use para inundar la casilla del admin. |
| `PUT /api/usuarios/resetear-password` | 5 intentos **fallidos** cada 15 minutos | El código es de 6 dígitos: sin límite, se podría adivinar probando todos. |
| `POST /api/consultas` | 5 consultas por hora | El formulario es público: frena el spam. |

Este límite se había evaluado antes y se había descartado por no ser crítico. La decisión cambió al eliminar el login de clientes: el login pasó a proteger solamente el acceso al panel de administración.

Los contadores se guardan en memoria, así que se reinician al reiniciar el servidor. Para este alcance alcanza; en un despliegue con varios servidores habría que guardarlos en un almacenamiento compartido (por ejemplo, Redis).

## Restricción de origen (solo el frontend puede llamar a la API)

Las rutas públicas (catálogo, categorías, info del comercio) no piden token, porque un visitante anónimo tiene que poder verlas. Para que igual no las pueda consumir cualquiera, la API solo acepta pedidos que vengan del frontend:

- **CORS restringido:** `cors({ origin: ... })` solo habilita los orígenes listados en `FRONTEND_URL` del `.env`. Si otra página web intenta llamar a la API desde el navegador, el navegador no le entrega la respuesta.
- **`verificarOrigen`:** se aplica a todo `/api`. Mira el header `Origin` del pedido y, si no es uno de los permitidos, corta con **403** antes de llegar a cualquier ruta. CORS solo no alcanza: el servidor ejecutaría igual el pedido y el navegador solo escondería la respuesta.
- **Pedidos sin `Origin`** (Postman, curl): se aceptan con `NODE_ENV=development` para poder correr la colección de Postman, y se rechazan con `NODE_ENV=production`.

Limitación: el header `Origin` lo pone el navegador, pero alguien que arme el pedido a mano lo puede falsificar. Esta restricción frena el uso de la API desde otros sitios web, no a un atacante decidido. Por eso las rutas que modifican datos siguen protegidas con `verificarToken`/`verificarAdmin`.

## Recuperar contraseña

Si el administrador se olvidó la contraseña (y por lo tanto no puede loguearse), puede recuperarla en dos pasos, sin necesitar ningún token:

1. **`POST /api/usuarios/recuperar-password`** con `{ "email": "..." }`. Si ese email existe, se genera un código numérico de 6 dígitos con **15 minutos** de vencimiento y se manda por mail. La respuesta es siempre la misma (200, mensaje genérico) exista o no el email — si dijera explícitamente "ese email no existe", cualquiera podría usar este endpoint para averiguar qué emails están registrados, el mismo motivo por el que el login tampoco distingue "usuario inexistente" de "contraseña incorrecta".
2. **`PUT /api/usuarios/resetear-password`** con `{ "email": "...", "token": "123456", "passwordNueva": "..." }`. El código se busca junto con el email, así un código solo sirve para la cuenta que lo pidió. Si es válido y no venció, actualiza la contraseña (mínimo 8 caracteres) y el código deja de servir; si no, devuelve un 400 con un mensaje claro.

En el frontend, las dos partes están en la misma pantalla (`/admin/recuperar`, linkeada desde el login): primero se pide el email y después el código y la contraseña nueva.

**Sobre el envío del mail:** `backend/services/Mail.service.js` funciona de dos maneras, según el `.env`:

- **Con `MAIL_USER` y `MAIL_PASS` completos**, manda el mail de verdad desde esa casilla (por defecto, Gmail). Para Gmail hace falta tener la verificación en dos pasos activada y generar una "contraseña de aplicación"; la contraseña normal de la cuenta no funciona. Esos datos van solo en el `.env` local de cada uno, nunca en el repositorio.
- **Si están vacíos**, usa [Ethereal](https://ethereal.email/), un servicio de mails de prueba: el mail no llega a nadie, pero se puede abrir y ver tal cual quedó armado. Después de pedir la recuperación, la consola del servidor imprime un link a la vista previa del mail (con el código). Así, cualquiera puede probar el flujo completo sin configurar una casilla.

## Consultas: formulario de contacto y panel

Cualquier visitante puede mandar una consulta desde el formulario de contacto, sin cuenta. Deja sus datos sueltos (nombre, email, teléfono opcional, asunto y mensaje) y, la consulta puede quedar asociada a uno o varios productos (hasta 10).

Como el endpoint es público, el backend no confía en lo que llega: limpia los espacios de cada campo, valida que los obligatorios no estén vacíos, que el email tenga un formato válido y que ningún campo supere el largo de su columna en la base. Si algo falla, responde **400** con la lista completa de errores (no solo el primero), para que el frontend pueda marcar todos los campos con problemas de una vez. Además, el endpoint tiene un límite de envíos por IP (ver "Límite de pedidos").

El administrador gestiona las consultas desde el panel (`/admin/consultas`), con un ciclo de vida inspirado en los sistemas de tickets. El panel abre por defecto en las pendientes y el menú lateral muestra cuántas hay:

| Estado | Significado |
|---|---|
| `pendiente` | Nadie la atendió todavía. Es el estado con el que nace toda consulta. |
| `respondida` | Ya se respondió y la conversación sigue por mail. |
| `cerrada` | Resuelta, no hay nada más que hacer. |

Una consulta que se resuelve con una sola respuesta puede pasar directo de `pendiente` a `cerrada`, y una cerrada se puede reabrir si el visitante vuelve a escribir. Las transiciones las decide el administrador; el backend solo valida que el estado sea uno de los tres.

**El panel no es un sistema de mensajería, a propósito.** Para responder, el panel abre el cliente de correo del administrador (link `mailto:`) con el destinatario, el asunto y el mensaje original ya completos, y la conversación sigue por mail. Por eso la respuesta no se guarda en la base: el panel sirve para no perder consultas y saber cuáles faltan atender, y el mail es donde ocurre la conversación. La contracara es que el sistema no ve esos mails, así que el estado depende de que el administrador lo actualice a mano.

Se descartó mandar un mail automático de confirmación al visitante: el email que escribe en el formulario no está verificado, así que cualquiera podría usar el formulario para mandarle mails a un tercero.

## Imágenes de producto

Cada producto puede tener varias fotos. Se guardan como URLs (tabla aparte `ImagenesProducto`, una fila por foto) — el backend no recibe ni procesa archivos, solo direcciones de imágenes ya alojadas en otro lado. Se decidió así en vez de subida real de archivos para no sumar la complejidad de multipart/form-data, almacenamiento en disco, servido de archivos estáticos y limpieza de archivos huérfanos, algo que no aporta valor extra al alcance de esta materia.

Cada fila tiene un campo `orden` que determina en qué posición se muestra esa foto; la de `orden` 0 es la que se usa como portada en el catálogo. La galería de un producto se maneja con tres endpoints, todos pensados para trabajar de a una imagen o en lote (por ejemplo, para que el frontend permita arrastrar y soltar las fotos para reordenarlas, mandando la lista completa de una sola vez):

- **Agregar** (`POST /api/productos/:productoId/imagenes`): acepta `{ "url": "..." }` para una sola, o `{ "urls": ["...", "..."] }` para varias de una. Se agregan al final de las que ya tiene el producto, en el orden del array.
- **Borrar** (`DELETE /api/productos/:productoId/imagenes`): acepta `{ "imagenId": 5 }` o `{ "imagenesIds": [5, 6, 7] }`. Si alguno de los ids no existe o no pertenece a ese producto, no se borra ninguna — se evita un borrado parcial silencioso.
- **Reordenar** (`PUT /api/productos/:productoId/imagenes/orden`): recibe `{ "orden": [7, 5, 6] }` con los ids de TODAS las imágenes del producto en el orden deseado, y actualiza el `orden` de cada una según su posición en el array.

El `PUT` normal de un producto (`/api/productos/:id`) no toca las imágenes en absoluto — quedan separadas de la edición de los datos básicos. Esto no obliga a que el frontend las muestre en pantallas separadas: una sola vista de "editar producto" puede mostrar campos y fotos juntos, y al guardar disparar por detrás los llamados que hagan falta (uno para los datos básicos, y los que correspondan para las fotos agregadas, sacadas o reordenadas).

No hay `ON DELETE CASCADE` en la foreign key de `ImagenesProducto`: al borrar un producto, `Producto.service.js` borra a mano todas sus imágenes antes de borrar el producto.

En el panel, las fotos se cargan pegando su dirección (una URL `https://...` o una ruta del propio sitio como `/img/productos/brownie.svg`) y se ordenan con flechas. Al crear un producto, las fotos viajan junto con el resto de los datos; al editar uno que ya existe, cada cambio en las fotos se guarda en el momento.

## Productos: visibles, disponibles, destacados y sin TACC

Cada producto tiene cuatro marcas, que el administrador cambia desde el panel:

| Campo | Qué hace |
|---|---|
| `activo` | Si está apagado, el producto no se ve en el sitio (pero sigue en la base y en el historial de consultas). |
| `disponible` | Si está apagado, el producto se sigue viendo, con el aviso "No disponible por ahora". |
| `destacado` | Aparece en "Especialidades de la casa", en el inicio. |
| `sinGluten` | Lleva la etiqueta "Sin TACC" y aparece en ese filtro del catálogo. |

"Sin TACC" es una característica del producto y no una categoría: un pan sin TACC es un pan, y aparece en Panadería. Por eso se guarda como un campo booleano y el catálogo lo filtra aparte, sin importar la categoría.

Las categorías también se pueden ocultar (`activa`). Si una categoría está oculta, sus productos tampoco se ven en el sitio, ni en el catálogo ni entrando directo al link del producto. El administrador sí los sigue viendo en el panel.

El catálogo **no muestra precios**, a propósito: el sitio es para mostrar los productos, no para venderlos. Un precio publicado obliga a mantenerlo siempre al día, y un precio desactualizado frente al público genera reclamos. Precios y encargos se consultan en el local o por el formulario de contacto.

## Novedades

El local puede publicar novedades (lanzamientos, horarios especiales, fechas festivas), con imagen y, opcionalmente, un producto relacionado. Cada novedad tiene dos datos que, juntos, dan tres estados:

| `publicada` | `fechaPublicacion` | Estado | ¿Se ve en el sitio? |
|---|---|---|---|
| `false` | cualquiera | Borrador | Nunca |
| `true` | futura | Programada | Sola, cuando llega la fecha |
| `true` | pasada | Publicada | Sí |

"Programada" no se guarda en ningún lado: se calcula comparando la fecha con la hora actual. Eso permite dejar lista una novedad para el Día de la Madre y que aparezca sola ese día. El backend filtra lo que puede ver el visitante, y el panel tiene un endpoint aparte que devuelve todas.

Las fechas se guardan en UTC y el frontend las muestra en la hora local de quien las mira.

## Documentación de la API

Todas las rutas cuelgan de `/api`. La columna "Acceso" indica qué hace falta para llamar a esa ruta.

### Usuario (`/api/usuarios`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/login` | Público (con límite de intentos) | Valida credenciales y devuelve un token |
| GET | `/perfil` | Logueado | Devuelve los datos del propio perfil |
| PUT | `/perfil` | Logueado | Edita nombre, apellido, teléfono y/o email propios |
| PUT | `/cambiar-password` | Logueado | Cambia la contraseña (pide la actual + la nueva, de al menos 8 caracteres) |
| POST | `/recuperar-password` | Público (con límite de pedidos) | Genera un código de recuperación y lo manda por mail |
| PUT | `/resetear-password` | Público (con límite de intentos) | Cambia la contraseña usando el email y el código recibido por mail |

### Categoría (`/api/categorias`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/` | Público | Lista las categorías, ordenadas por nombre (el visitante ve solo las activas; el admin, todas) |
| GET | `/:id` | Público | Una categoría por id |
| POST | `/` | Admin | Crea una categoría |
| PUT | `/:id` | Admin | Edita una categoría |
| DELETE | `/:id` | Admin | Borra una categoría (rechaza si tiene productos asociados) |

### Producto (`/api/productos`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/?busqueda=&categoriaId=&sinGluten=&destacado=&soloActivos=` | Público | Lista productos, con filtros opcionales (el visitante ve solo los activos de categorías activas; el admin, todos, salvo que pida `soloActivos=true`) |
| GET | `/:id` | Público | Un producto por id, con su categoría y sus imágenes |
| POST | `/` | Admin | Crea un producto (acepta `imagenes: [...]` opcional, URLs) |
| PUT | `/:id` | Admin | Edita los datos básicos de un producto (no toca imágenes) |
| DELETE | `/:id` | Admin | Borra un producto (rechaza si tiene consultas asociadas; borra sus imágenes) |
| POST | `/:productoId/imagenes` | Admin | Agrega una o varias imágenes (`url` o `urls`) |
| DELETE | `/:productoId/imagenes` | Admin | Borra una o varias imágenes (`imagenId` o `imagenesIds`) |
| PUT | `/:productoId/imagenes/orden` | Admin | Reordena las imágenes del producto |

### Consulta (`/api/consultas`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/` | Público (con límite de envíos) | Crea una consulta desde el formulario de contacto |
| GET | `/?estado=` | Admin | Lista todas las consultas, filtro opcional por estado |
| GET | `/:id` | Admin | Una consulta por id |
| PATCH | `/:id/estado` | Admin | Cambia el estado (`pendiente` / `respondida` / `cerrada`) |
| DELETE | `/:id` | Admin | Borra una consulta |

### Novedad (`/api/novedades`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/?limite=` | Público | Novedades publicadas y con fecha cumplida, de la más nueva a la más vieja |
| GET | `/:id` | Público | Una novedad publicada (404 si es borrador o está programada) |
| GET | `/admin/todas` | Admin | Todas las novedades, incluidos borradores y programadas |
| POST | `/` | Admin | Crea una novedad (sin `publicada`, queda como borrador) |
| PUT | `/:id` | Admin | Edita una novedad (`imagenUrl` y `productoId` en `null` los quitan) |
| DELETE | `/:id` | Admin | Borra una novedad |

### Comercio (`/api/comercio`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/` | Público | Datos del local: nombre, descripción, dirección, teléfono, horarios y redes |
| PUT | `/` | Admin | Edita los datos del local (hay una sola fila; un campo en `''` se vacía) |

Las rutas que dicen "Público" y devuelven listados aceptan además el token del administrador: si viene, la respuesta incluye también lo que está desactivado u oculto. Así el panel usa los mismos endpoints que el sitio.

## Convenciones del proyecto

- `??` para ediciones parciales: un campo que no llega en el body deja el valor que ya tenía.
- Los `catch` nunca reenvían el error técnico crudo (`e.message` de Sequelize/SQL Server) al cliente: se loguea el detalle completo con `console.log(e)` del lado del servidor, y al cliente solo le llega un mensaje pensado para mostrarse.
- El logging de las queries de Sequelize está condicionado a `NODE_ENV`: se ve en `development`, se apaga en `production`.
- Cuando una respuesta podría revelar si un dato existe o no en la base (login, recuperar contraseña), se devuelve siempre el mismo mensaje genérico, para no dar pistas que sirvan para enumerar usuarios o emails registrados.
- Códigos de error: **400** datos inválidos, **401** sin token o token inválido ("¿quién sos?"), **403** el rol no alcanza ("no podés hacer esto"), **404** recurso inexistente, **429** demasiados pedidos.
- Los largos máximos que valida el backend coinciden con los de las columnas en `crear-base.sql`: si se cambia uno, hay que cambiar el otro.

## Cómo probar la API

Hay una colección de Postman con casos de prueba (positivos y negativos) para usuarios, categorías, productos, consultas y datos del comercio, incluyendo los accesos público y de administrador. Vive en el repositorio (`postman/`), así que se abre directo desde la extensión de Postman de VS Code. Para usarla:

1. Importarla en Postman.
2. En las variables de la colección, completar `adminEmail` y `adminPassword` con las credenciales del admin que crea `crear-base.sql`.
3. Correr las carpetas en orden: Usuario → Categoría → Producto → Consulta → Comercio → Límites de pedidos. La request de login guarda automáticamente el token, y las demás guardan los ids que necesitan las siguientes. "Límites de pedidos" agota los límites a propósito, por eso va al final.

**Ojo con el límite de pedidos:** el contador es por IP, y al probar en local todas las requests salen de la misma. Hay que **reiniciar el servidor antes de cada corrida completa**: si no, los tests de login fallido o de creación de consultas pueden terminar en 429 en vez del código esperado.

Dentro de Usuario, las pruebas de recuperar contraseña son la excepción: como el código llega por mail y no en la respuesta de la API, dos de esas requests son manuales (hay que copiar el código del mail, o de la vista previa de Ethereal, y pegarlo en la variable de colección `codigoRecuperacion` antes de correrlas). Cada request tiene su descripción con el paso a paso.

El frontend se probó de punta a punta contra el backend real: cada pantalla del sitio y del panel, incluidos los casos de error (datos inválidos, producto con consultas que no se puede borrar, sesión vencida, límite de intentos).

## Otros documentos

- **Manual de instalación:** paso a paso detallado para levantar el entorno desde cero (SQL Server Express, SSMS, variables de entorno, troubleshooting).
- **Modelo de datos:** diagrama entidad-relación de las tablas y sus relaciones.
- **Diagrama de navegación:** flujo de pantallas del sitio público y del panel de administración.

## Estado del proyecto

### Requisitos de la consigna, cumplidos

- Catálogo de productos administrable por categoría (CRUD completo de Categoría y Producto), desde el panel.
- Búsqueda y filtros en el catálogo (por texto, categoría y sin TACC).
- Sistema de consultas/contacto abierto a visitantes, con gestión de estado (crear, listar, cambiar estado).
- Sitio público de solo lectura + panel de administración protegido por login.
- Recuperar contraseña (código temporal enviado por mail).
- Validación de datos obligatorios tanto en el front como en el back.
- Seed de datos de ejemplo.
- Documentación completa del proyecto.

### Extras, más allá de lo pedido

- Novedades con borradores y publicación programada, con imagen y producto relacionado.
- Datos del local (dirección, horarios, redes) editables desde el panel.
- Envío de mails reales (Gmail), con Ethereal como alternativa de prueba.
- Varias fotos por producto, ordenables, y productos destacados en el inicio.
- Frontend que funciona también sin backend (datos de prueba), para desarrollar y demostrar sin depender de la base.
- Panel que se adapta a distintos tamaños de pantalla de computadora.
- Middleware de autorización que valida no solo autenticación sino también el rol correspondiente a cada ruta.
- Límite de pedidos por IP en login, recuperación de contraseña y formulario de consultas.
- Restricción de origen: la API solo acepta pedidos del frontend.
- Validación estricta del formulario público (tipos, espacios, formato de email, largos máximos), con todos los errores devueltos juntos.
- Ciclo de vida de consultas tipo ticket (pendiente / respondida / cerrada), con respuesta por mail desde el panel.
- Endurecimiento de seguridad más allá de lo básico: el hash de contraseña y el código de recuperación nunca viajan en ninguna respuesta HTTP, los errores internos nunca se exponen crudos al cliente.
- Reglas de integridad de datos: no se puede borrar una categoría o un producto que todavía tiene historial asociado.
- Múltiples imágenes por producto (URLs, sin subida de archivos), con endpoints para agregar, borrar y reordenar de a una o en lote.
- Colección de pruebas de Postman con casos positivos y negativos para toda la API.

### Mejoras a futuro

- Versión del sitio para celulares y tablets (los puntos de corte ya están definidos en los estilos).
- Subida real de archivos para las fotos, en lugar de URLs.
- Segundo factor para el login del administrador (código por mail), reutilizando el mecanismo de recuperar contraseña.
- Extras opcionales: dashboard de métricas, buscador avanzado, promociones.