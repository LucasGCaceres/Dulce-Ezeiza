import { pedir, pedirAdmin, simularRed, simularFallo, USAR_MOCKS } from './api'

// ---------- Datos del mock ----------
// El admin del seed de crear-base.sql.
const ADMIN_MOCK = { id: 1, nombre: 'Admin', email: 'admin@dulceezeiza.com', rol: 'admin' }
const PASSWORD_MOCK = 'Admin123!'

// El backend corta después de 5 intentos fallidos en 15 minutos (429).
// El mock lo imita; el contador se reinicia al recargar la página.
const INTENTOS_PERMITIDOS = 5
let intentosFallidosMock = 0

// Arma un token con la misma forma que un JWT real (encabezado.datos.firma),
// para que el resto del front lo lea igual. La "firma" es de mentira: en
// modo mocks nadie la verifica.
function crearTokenFalso(usuario) {
  const codificar = (objeto) =>
    btoa(JSON.stringify(objeto)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  const ahora = Math.floor(Date.now() / 1000)
  const encabezado = codificar({ alg: 'HS256', typ: 'JWT' })
  const datos = codificar({ id: usuario.id, rol: usuario.rol, iat: ahora, exp: ahora + 86400 })
  return `${encabezado}.${datos}.firma-de-prueba`
}

// POST /api/usuarios/login
// Responde 200 { token, usuario: { id, nombre, email, rol }, mensaje }.
// Errores: 401 'Email o contraseña inválidos', 429 por demasiados intentos.
export function iniciarSesion(email, password) {
  if (USAR_MOCKS) {
    if (intentosFallidosMock >= INTENTOS_PERMITIDOS) {
      return simularFallo('Demasiados intentos fallidos. Probá de nuevo en 15 minutos.', 429)
    }
    if (email.trim().toLowerCase() !== ADMIN_MOCK.email || password !== PASSWORD_MOCK) {
      intentosFallidosMock++
      return simularFallo('Email o contraseña inválidos', 401)
    }
    return simularRed({ token: crearTokenFalso(ADMIN_MOCK), usuario: ADMIN_MOCK, mensaje: 'Login exitoso' })
  }
  return pedir('/usuarios/login', { metodo: 'POST', cuerpo: { email: email.trim(), password } })
}


// ---------- Recuperar contraseña ----------
// El código de recuperación es de 6 dígitos y llega por mail. En modo mocks
// no sale ningún mail: el código válido es siempre este.
const CODIGO_MOCK = '123456'

// POST /api/usuarios/recuperar-password   { email }
// Responde SIEMPRE 200 con el mismo mensaje, exista o no el email (así nadie
// puede averiguar qué emails tienen cuenta). Error posible: 429 si se pide
// más de 3 veces por hora.
export function solicitarRecuperacion(email) {
  if (USAR_MOCKS) {
    return simularRed({ mensaje: 'Si el email está registrado, te enviamos instrucciones para recuperar tu contraseña' })
  }
  return pedir('/usuarios/recuperar-password', { metodo: 'POST', cuerpo: { email: email.trim() } })
}

// PUT /api/usuarios/resetear-password   { email, token, passwordNueva }
// "token" es el código de 6 dígitos del mail. El backend busca el código
// JUNTO con el email: así un código solo sirve para la cuenta que lo pidió.
// Responde 200 { mensaje }. Errores: 400 'El código de recuperación es
// inválido o venció'; 429 si se erra el código 5 veces en 15 minutos.
export function resetearPassword(email, codigo, passwordNueva) {
  if (USAR_MOCKS) {
    if (email.trim().toLowerCase() !== ADMIN_MOCK.email || codigo.trim() !== CODIGO_MOCK) {
      return simularFallo('El código de recuperación es inválido o venció', 400)
    }
    return simularRed({ mensaje: 'Contraseña actualizada correctamente' })
  }
  return pedir('/usuarios/resetear-password', {
    metodo: 'PUT',
    cuerpo: { email: email.trim(), token: codigo.trim(), passwordNueva }
  })
}


// ---------- Perfil del administrador ----------
// Datos de prueba del perfil (en modo mocks).
const PERFIL_MOCK = {
  id: 1, nombre: 'Admin', apellido: 'Dulce Ezeiza',
  email: ADMIN_MOCK.email, telefono: '1122334455', rol: 'admin'
}

// GET /api/usuarios/perfil (admin) → los datos del usuario logueado.
export function obtenerPerfil() {
  return pedirAdmin('/usuarios/perfil', {}, () => simularRed(PERFIL_MOCK))
}

// PUT /api/usuarios/perfil (admin)   { nombre, apellido, telefono, email }
// Responde 200 { usuario, mensaje }.
export function editarPerfil(datos) {
  return pedirAdmin('/usuarios/perfil', { metodo: 'PUT', cuerpo: datos }, () => {
    Object.assign(PERFIL_MOCK, datos)
    return simularRed({ usuario: PERFIL_MOCK, mensaje: 'Perfil actualizado correctamente' })
  })
}

// PUT /api/usuarios/cambiar-password (admin)   { passwordActual, passwordNueva }
// Responde 200 { mensaje }. Error: 400 'La contraseña actual es incorrecta'.
export function cambiarPassword(passwordActual, passwordNueva) {
  return pedirAdmin(
    '/usuarios/cambiar-password',
    { metodo: 'PUT', cuerpo: { passwordActual, passwordNueva } },
    () => {
      if (passwordActual !== PASSWORD_MOCK) {
        return simularFallo('La contraseña actual es incorrecta', 400)
      }
      return simularRed({ mensaje: 'Contraseña actualizada correctamente' })
    }
  )
}