// ============================================================
//  Base de todos los services: acá vive el único fetch del sitio.
// ============================================================
// Los componentes NUNCA llaman a fetch directo: llaman a un service
// (obtenerComercio, obtenerProductos...) y el service decide si
// devuelve datos de prueba (mocks) o le pega al backend real.
// Para pasar de uno a otro se cambia VITE_USAR_MOCKS en .env.local.

import { leerToken, tokenVigente } from './sesion'

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
// - token: si viene, va en el header que lee verificarToken en el backend.
export async function pedir(ruta, { metodo = 'GET', cuerpo, token } = {}) {
  const headers = {}
  if (cuerpo) headers['Content-Type'] = 'application/json'
  if (token) headers['x-access-token'] = token

  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers,
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

// ============================================================
//  Pedidos del panel admin (con token)
// ============================================================

// Qué hacer cuando el backend dice 401 (token vencido o inválido).
// No lo decide este archivo: lo configura el SesionProvider, que es el
// que sabe cerrar la sesión y avisarle a React.
let alPerderSesion = () => {}

export function configurarAlPerderSesion(funcion) {
  alPerderSesion = funcion
}

// Igual que pedir(), pero para rutas protegidas del panel:
// - agrega el token de la sesión;
// - si la respuesta es 401, cierra la sesión (y el panel vuelve al login).
// mock: función que devuelve la respuesta de prueba. En modo mocks
// también se controla el token, para que el panel se comporte igual
// que con el backend real (por ejemplo, cuando la sesión vence).
//
// IMPORTANTE: el sitio público usa pedir() SIN token a propósito. Si el
// catálogo mandara el token del admin, el backend le mostraría también
// los productos dados de baja (identificarUsuario).
export function pedirAdmin(ruta, opciones = {}, mock) {
  const token = leerToken()
  let promesa
  if (USAR_MOCKS) {
    promesa = tokenVigente(token) ? mock() : simularFallo('Token invalido.', 401)
  } else {
    promesa = pedir(ruta, { ...opciones, token })
  }
  return promesa.catch((error) => {
    if (error.status === 401) alPerderSesion()
    throw error
  })
}