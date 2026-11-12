import { pedir, simularRed, simularFallo, USAR_MOCKS } from './api'

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