# Dulce Ezeiza

Plataforma web para una cafetería/pastelería artesanal. Es un catálogo administrable — **no es un e-commerce**: no tiene carrito de compras ni pagos online. Cuenta con un sitio público donde cualquier visitante puede ver el catálogo, buscar y filtrar productos, y un panel de administración privado para gestionar el contenido.

> Este README documenta principalmente el **backend**, que es la parte del proyecto más avanzada al momento de escribir esto. La documentación del frontend se va a ir sumando a medida que esa parte tome más forma.

## Integrantes

- Lucas Caceres - 1157093
- Federico
- Tomas

**Cátedra:** Aplicaciones Interactivas 2026

## Stack tecnológico

- **Backend:** Node.js + Express
- **Frontend:** Proximamente...
- **Base de datos:** SQL Server (probado con SQL Server Express, instancia `SQLEXPRESS`)
- **ORM:** Sequelize
- **Autenticación:** JSON Web Tokens (JWT) + bcrypt para el hash de contraseñas

## Estructura del proyecto

Monorepo con el backend en la carpeta `backend/`:

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
│   └── Autorizacion.middlewares.js  # verificarToken y verificarAdmin
├── database-scripts/
│   └── crear-base.sql       # Script de creación de la base desde cero
├── .env.example              # Plantilla de variables de entorno
└── package.json
```

## Arquitectura

El backend sigue una arquitectura por capas, sin capa de repository:

```
ruta → controller → service → model → base de datos
```

- **Ruta:** conecta un verbo HTTP + path con una función del controller, y decide qué middlewares tiene que pasar antes (autenticación, autorización).
- **Controller:** traduce HTTP. Lee `req`, arma un objeto de datos limpio, llama al service, y responde con `res`. No tiene lógica de negocio ni SQL.
- **Service:** tiene toda la lógica de negocio y habla con los models. Nunca recibe `req` ni `res` — recibe datos ya procesados y devuelve datos o tira errores.
- **Model:** representa una tabla de la base a través de Sequelize.

Las relaciones entre entidades se definen todas juntas en `models/Associations.js`, no dispersas en cada model.

## Cómo levantar el proyecto

Versión resumida (para el paso a paso completo, con troubleshooting, ver el manual de instalación):

1. Clonar el repositorio.
2. Crear la base `DulceEzeiza` en SQL Server (SSMS) y correr `backend/database-scripts/crear-base.sql`.
3. Copiar `backend/.env.example` a `backend/.env` y completar los valores con los datos de tu instalación local.
4. Parado en `backend/`, correr `npm install`.
5. Correr `npm start` (o `npm run dev` para que se reinicie solo con nodemon).
6. El servidor queda escuchando en `http://localhost:8080` (o el puerto que hayas puesto en `PORT`).

## Modelo de roles y autenticación

Hay tres niveles de acceso:

- **Visitante anónimo:** solo puede navegar y buscar el catálogo público. No necesita token.
- **Cliente registrado:** puede mandar consultas, ver el historial de sus propias consultas, y ver/editar su propio perfil. Necesita un token válido.
- **Administrador:** acceso completo al panel (alta, baja y modificación de categorías, productos, y gestión de consultas). Necesita un token válido con `rol: 'admin'`.

El login devuelve un JWT que hay que mandar en cada request protegida, en el header:

```
x-access-token: <token>
```

El token incluye el `id` del usuario y su `rol`. Dos middlewares se encargan de la seguridad:

- `verificarToken`: chequea que el token exista y sea válido (autenticación — "¿quién sos?"). Si falta o es inválido, corta con **401**.
- `verificarAdmin`: se usa siempre después de `verificarToken`, y chequea que el rol sea `admin` (autorización — "¿te alcanza el rol para esto?"). Si no, corta con **403**.

El registro público (`POST /api/usuarios/registro`) siempre crea usuarios con `rol: 'cliente'`, sin importar qué se mande en el body — es una protección explícita contra mass assignment (que alguien intente registrarse como admin mandando `rol: "admin"` en el request). El usuario administrador se crea a mano directamente en la base de datos.

## Documentación de la API

Todas las rutas cuelgan de `/api`. La columna "Acceso" indica qué hace falta para llamar a esa ruta.

### Usuario (`/api/usuarios`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/registro` | Público | Registra un cliente nuevo (rol siempre `cliente`) |
| POST | `/login` | Público | Valida credenciales y devuelve un token |
| GET | `/perfil` | Logueado | Devuelve los datos del propio perfil |
| PUT | `/perfil` | Logueado | Edita nombre, apellido, teléfono y/o email propios |
| PUT | `/cambiar-password` | Logueado | Cambia la contraseña (pide la actual + la nueva) |

### Categoría (`/api/categorias`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/` | Público | Lista todas las categorías |
| GET | `/:id` | Público | Una categoría por id |
| POST | `/` | Admin | Crea una categoría |
| PUT | `/:id` | Admin | Edita una categoría |
| DELETE | `/:id` | Admin | Borra una categoría (rechaza si tiene productos asociados) |

### Producto (`/api/productos`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/?busqueda=&categoriaId=&sinGluten=&soloActivos=` | Público | Lista productos, con filtros opcionales |
| GET | `/:id` | Público | Un producto por id, con su categoría |
| POST | `/` | Admin | Crea un producto |
| PUT | `/:id` | Admin | Edita un producto |
| DELETE | `/:id` | Admin | Borra un producto (rechaza si tiene consultas asociadas) |

### Consulta (`/api/consultas`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/` | Logueado | Crea una consulta (ver nota sobre Escenario B abajo) |
| GET | `/mis-consultas` | Logueado | Historial de consultas propias |
| GET | `/?estado=` | Admin | Lista todas las consultas, filtro opcional por estado |
| GET | `/:id` | Admin | Una consulta por id |
| PATCH | `/:id/estado` | Admin | Cambia el estado (`pendiente` / `leida` / `respondida`) |
| DELETE | `/:id` | Admin | Borra una consulta |

## Convenciones del proyecto

- `??` para ediciones parciales: un campo que no llega en el body deja el valor que ya tenía.
- Los `catch` nunca reenvían el error técnico crudo (`e.message` de Sequelize/SQL Server) al cliente: se loguea el detalle completo con `console.log(e)` del lado del servidor, y al cliente solo le llega un mensaje pensado para mostrarse.
- El logging de las queries de Sequelize está condicionado a `NODE_ENV`: se ve en `development`, se apaga en `production`.

## Cómo probar la API

Hay una colección de Postman con casos de prueba (positivos y negativos) para las cuatro entidades, incluyendo los tres niveles de acceso. Para usarla:

1. Importarla en Postman.
2. En las variables de la colección, completar `adminEmail` y `adminPassword` con las credenciales del admin creado a mano en la base.
3. Correr las carpetas en orden: Usuario → Categoría → Producto → Consulta. Las requests de registro/login guardan automáticamente los tokens e ids que necesitan las siguientes.

## Otros documentos

- **Manual de instalación:** paso a paso detallado para levantar el entorno desde cero (SQL Server Express, SSMS, variables de entorno, troubleshooting).
- **Modelo de datos:** diagrama entidad-relación de las cuatro tablas y sus relaciones.
- **Diagrama de navegación:** flujo de pantallas para visitante, cliente y administrador.

## Estado del proyecto

### Requisitos de la consigna, cumplidos

- Catálogo de productos administrable por categoría (CRUD completo de Categoría y Producto).
- Búsqueda y filtros en el catálogo (por texto, categoría, sin TACC, solo activos).
- Sistema de consultas/contacto con gestión de estado (crear, listar, cambiar estado).
- Sitio público de solo lectura + panel de administración protegido por login.
- Validación de datos obligatorios tanto en el front como en el back.
- Seed de productos de ejemplo.
- Documentación completa del proyecto.

### Extras, más allá de lo pedido

- Sistema de roles de tres niveles (visitante / cliente / admin) en vez de un único usuario administrador, con registro y login de clientes.
- Funciones de autoservicio para el cliente: historial de sus propias consultas, ver y editar su perfil, cambiar su contraseña.
- Middleware de autorización que valida no solo autenticación sino también el rol correspondiente a cada ruta.
- Endurecimiento de seguridad más allá de lo básico: protección contra mass assignment en el registro, el hash de contraseña nunca viaja en ninguna respuesta HTTP, los errores internos nunca se exponen crudos al cliente.
- Reglas de integridad de datos: no se puede borrar una categoría o un producto que todavía tiene historial asociado.
- Colección de pruebas de Postman con casos positivos y negativos para toda la API.

### Pendiente

- Recuperar contraseña (vía email) y logout.
- Entidad Comercio (información institucional).
- Dashboard de métricas para el panel de administración.
- Extras opcionales: envío de respuestas por email, imágenes múltiples por producto, buscador avanzado, promociones.