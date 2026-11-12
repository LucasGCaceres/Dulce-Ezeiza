// ============================================================
//  Dónde vive la sesión del admin: en localStorage.
// ============================================================
// localStorage guarda texto en el navegador y sobrevive a un F5 o a
// cerrar la pestaña. Por eso, después de ingresar, el admin no tiene
// que volver a loguearse cada vez que recarga la página.
//
// Ojo: cualquier código JavaScript de la página puede leer
// localStorage. Es la forma más simple y la que pide el TPO, pero en un
// sistema real se suele preferir una cookie "httpOnly", que JS no puede leer.

const CLAVE = 'dulceEzeiza.sesion'

// Un JWT tiene tres partes separadas por puntos: encabezado.datos.firma.
// Las dos primeras son JSON codificado en base64: NO están encriptadas,
// cualquiera las puede leer (lo que no se puede es modificarlas sin que
// la firma deje de coincidir). Acá leemos los datos para saber cuándo vence.
export function leerDatosDelToken(token) {
  try {
    const datos = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(datos))
  } catch {
    return null   // no tiene forma de JWT
  }
}

// ¿El token todavía sirve? "exp" viene en segundos; Date.now(), en milisegundos.
export function tokenVigente(token) {
  const datos = token ? leerDatosDelToken(token) : null
  return Boolean(datos?.exp) && datos.exp * 1000 > Date.now()
}

// Devuelve { token, usuario } o null si no hay sesión (o si venció).
// try/catch porque localStorage puede fallar (por ejemplo, en una
// ventana de incógnito con el almacenamiento bloqueado).
export function leerSesion() {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE))
    return sesion && tokenVigente(sesion.token) ? sesion : null
  } catch {
    return null
  }
}

export function guardarSesion(sesion) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(sesion))
  } catch {
    // Si no se puede guardar, la sesión dura hasta que se recargue la página.
  }
}

export function borrarSesion() {
  try {
    localStorage.removeItem(CLAVE)
  } catch {
    // Nada que hacer.
  }
}

export function leerToken() {
  return leerSesion()?.token ?? null
}