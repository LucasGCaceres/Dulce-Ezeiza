import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useSesion } from '../../hooks/useSesion'
import './AdminLogin.css'

// ============================================================
//  /admin/login — no está linkeado desde el sitio público a propósito.
// ============================================================

function AdminLogin() {
  const { usuario, iniciarSesion, motivoSalida } = useSesion()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorServidor, setErrorServidor] = useState(null)

  // Si hay sesión, este componente no muestra el formulario: redirige.
  // Esto cubre dos casos con una sola línea:
  // - entró a /admin/login teniendo ya la sesión abierta;
  // - acaba de ingresar: iniciarSesion() cambia "usuario", el componente
  //   se vuelve a dibujar y llega acá.
  // Vuelve a la página del panel que quería ver antes de que lo mandaran
  // al login (la guardó RutaProtegida en state.desde), o al inicio del panel.
  if (usuario) return <Navigate to={location.state?.desde ?? '/admin'} replace />

  const errores = {}
  if (intentoEnviar) {
    if (!email.trim()) errores.email = 'Escribí tu email.'
    if (!password) errores.password = 'Escribí tu contraseña.'
  }

  async function alEnviar(evento) {
    evento.preventDefault()
    setIntentoEnviar(true)
    if (!email.trim() || !password) {
      document.getElementById(!email.trim() ? 'email' : 'password')?.focus()
      return
    }

    setEnviando(true)
    setErrorServidor(null)
    try {
      await iniciarSesion(email, password)
      // No hace falta navegar acá: al cambiar "usuario", el componente se
      // vuelve a dibujar y el <Navigate> de arriba hace la redirección.
    } catch (error) {
      setErrorServidor(error)
      setPassword('')   // por seguridad, la contraseña no queda escrita
      setEnviando(false)
    }
  }

  return (
    <div className="login">
      <title>Ingresar - Panel Dulce Ezeiza</title>

      <div className="login-imagen">
        <img src="/img/sitio/horno.svg" alt="" />
        <div className="login-marca">
          <span className="login-marca-nombre">Dulce Ezeiza</span>
          <p>Panel de administración</p>
        </div>
      </div>

      <main className="login-lado-formulario">
        <form className="login-formulario" onSubmit={alEnviar} noValidate>
          <div>
            <h1 className="login-titulo">Ingresar</h1>
            <p className="login-bajada">Solo para el personal de la panadería.</p>
          </div>

          {/* Un solo aviso a la vez: primero el error del intento actual;
              si no hay, el motivo por el que se salió del panel. */}
          {errorServidor ? (
            <div role="alert" className="login-aviso login-aviso-error">{mensajeDeError(errorServidor)}</div>
          ) : motivoSalida === 'vencida' ? (
            <div role="status" className="login-aviso">Tu sesión venció. Volvé a ingresar.</div>
          ) : motivoSalida === 'cerrada' ? (
            <div role="status" className="login-aviso">Cerraste la sesión.</div>
          ) : null}

          <div className="campo">
            <label htmlFor="email" className="campo-etiqueta">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errores.email ? 'campo-control con-error' : 'campo-control'}
              aria-invalid={errores.email ? true : undefined}
              aria-describedby={errores.email ? 'email-error' : undefined}
            />
            {errores.email && <span id="email-error" className="campo-error">{errores.email}</span>}
          </div>

          <div className="campo">
            <label htmlFor="password" className="campo-etiqueta">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errores.password ? 'campo-control con-error' : 'campo-control'}
              aria-invalid={errores.password ? true : undefined}
              aria-describedby={errores.password ? 'password-error' : undefined}
            />
            {errores.password && <span id="password-error" className="campo-error">{errores.password}</span>}
          </div>

          <button type="submit" className="boton login-boton" disabled={enviando}>
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>

          <Link to="/" className="login-volver">Volver al sitio</Link>
        </form>
      </main>
    </div>
  )
}

// Traduce el error de la API a un mensaje para la persona.
function mensajeDeError(error) {
  // 401: el backend no dice si falló el email o la contraseña, a propósito:
  // si lo dijera, alguien podría averiguar qué emails tienen cuenta.
  if (error.status === 401) return 'El email o la contraseña no son correctos.'
  // 429 y 403 traen un mensaje claro desde el backend; el resto
  // (servidor caído, etc.) también trae el suyo desde api.js.
  return error.message
}

export default AdminLogin