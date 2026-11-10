// ============================================================
//  Base de todos los services: acá vive el único fetch del sitio.
// ============================================================
// Los componentes NUNCA llaman a fetch directo: llaman a un service
// (obtenerComercio, obtenerProductos...) y el service decide si
// devuelve datos de prueba (mocks) o le pega al backend real.
// Para pasar de uno a otro se cambia VITE_USAR_MOCKS en .env.local.

const API_URL = import.meta.env.VITE_API_URL

// Las variables de entorno de Vite siempre llegan como texto,
// por eso se compara contra 'true' y no contra true.
export const USAR_MOCKS = import.meta.env.VITE_USAR_MOCKS === 'true'

// Error con más información que un Error común: el status HTTP
// y, si el backend la mandó, la lista de errores de validación.
export class ErrorApi extends Error {
  constructor(mensaje, status, errores = []) {
    super(mensaje)
    this.status = status
    this.errores = errores
  }
}

// Hace el pedido al backend y devuelve el JSON de la respuesta.
// - ruta: lo que va después de /api (ej.: '/comercio').
// - cuerpo: objeto que se manda como JSON (POST, PUT, PATCH).
export async function pedir(ruta, { metodo = 'GET', cuerpo } = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: cuerpo ? { 'Content-Type': 'application/json' } : undefined,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined
    })
  } catch {
    // fetch solo falla así cuando no hay respuesta: backend apagado,
    // sin conexión o CORS mal configurado.
    throw new ErrorApi('No pudimos conectarnos con el servidor.', 0)
  }

  // Si el servidor dice "todo bien" (200) pero no manda JSON, algo está
  // mal configurado: por ejemplo, VITE_API_URL apunta al propio Vite y
  // nos devolvió el index.html. Eso es un error, no "datos vacíos".
  // (204 significa "OK, sin contenido": ese sí es válido sin JSON.)
  let datos = null
  if (respuesta.status !== 204) {
    try {
      datos = await respuesta.json()
    } catch {
      if (respuesta.ok) {
        throw new ErrorApi('El servidor respondió algo que no es JSON. ¿Está bien VITE_API_URL?', respuesta.status)
      }
    }
  }

  if (!respuesta.ok) {
    throw new ErrorApi(
      datos?.mensaje ?? 'Ocurrió un error inesperado.',
      respuesta.status,
      datos?.errores ?? []
    )
  }

  return datos
}

// Simula un pedido a la red para los mocks: espera un poco (así se
// ven los estados de "cargando") y devuelve una COPIA de los datos,
// para que un componente no pueda modificar el mock por accidente.
export function simularRed(datos, demora = 400) {
  return new Promise((resolver) => {
    setTimeout(() => resolver(structuredClone(datos)), demora)
  })
}

// Lo mismo que simularRed, pero para cuando el backend respondería con
// un error (por ejemplo, un 404 "Producto no encontrado"). Así el mock
// también prueba los caminos de error de las páginas.
export function simularFallo(mensaje, status, demora = 400) {
  return new Promise((resolver, rechazar) => {
    setTimeout(() => rechazar(new ErrorApi(mensaje, status)), demora)
  })
}