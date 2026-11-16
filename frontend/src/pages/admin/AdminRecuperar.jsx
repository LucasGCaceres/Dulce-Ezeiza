import { useState } from 'react'
import { Link } from 'react-router-dom'
import { solicitarRecuperacion, resetearPassword } from '../../services/auth'
// Misma pantalla partida que el login: reutiliza sus estilos.
import './AdminLogin.css'

// ============================================================
//  /admin/recuperar — "Olvidé mi contraseña", en tres momentos:
//  1) "email":  se pide el email y el backend manda un código por mail.
//  2) "codigo": se escribe el código y la contraseña nueva.
//  3) "listo":  se avisa que se cambió y se vuelve al login.
// ============================================================

const LARGO_MINIMO_PASSWORD = 8

function emailValido(texto) {
  return /^\S+@\S+\.\S+$/.test(texto.trim())
}

function AdminRecuperar() {
  const [paso, setPaso] = useState('email')
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [repetir, setRepetir] = useState('')
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorServidor, setErrorServidor] = useState(null)

  // Errores de validación: solo se muestran después de intentar enviar.
  const errores = {}
  if (intentoEnviar && paso === 'email') {
    if (!email.trim()) errores.email = 'Escribí tu email.'
    else if (!emailValido(email)) errores.email = 'Ese email no parece válido.'
  }
  if (intentoEnviar && paso === 'codigo') {
    if (!/^\d{6}$/.test(codigo.trim())) errores.codigo = 'El código tiene 6 números.'
    if (passwordNueva.length < LARGO_MINIMO_PASSWORD) {
      errores.passwordNueva = `La contraseña nueva necesita al menos ${LARGO_MINIMO_PASSWORD} caracteres.`
    }
    if (repetir !== passwordNueva) errores.repetir = 'Las contraseñas no coinciden.'
  }

  async function pedirCodigo(evento) {
    evento.preventDefault()
    setIntentoEnviar(true)
    if (!emailValido(email)) {
      document.getElementById('email')?.focus()
      return
    }

    setEnviando(true)
    setErrorServidor(null)
    try {
      await solicitarRecuperacion(email)
      setIntentoEnviar(false)
      setPaso('codigo')
    } catch (error) {
      setErrorServidor(error)
    } finally {
      setEnviando(false)
    }
  }

  async function cambiarPassword(evento) {
    evento.preventDefault()
    setIntentoEnviar(true)
    const hayErrores =
      !/^\d{6}$/.test(codigo.trim()) ||
      passwordNueva.length < LARGO_MINIMO_PASSWORD ||
      repetir !== passwordNueva
    if (hayErrores) {
      const primero = !/^\d{6}$/.test(codigo.trim())
        ? 'codigo'
        : passwordNueva.length < LARGO_MINIMO_PASSWORD ? 'passwordNueva' : 'repetir'
      document.getElementById(primero)?.focus()
      return
    }

    setEnviando(true)
    setErrorServidor(null)
    try {
      await resetearPassword(codigo, passwordNueva)
      setPaso('listo')
    } catch (error) {
      setErrorServidor(error)
    } finally {
      setEnviando(false)
    }
  }

  // Vuelve al primer momento para pedir otro código.
  function pedirOtroCodigo() {
    setPaso('email')
    setCodigo('')
    setPasswordNueva('')
    setRepetir('')
    setIntentoEnviar(false)
    setErrorServidor(null)
  }

  return (
    <div className="login">
      <title>Recuperar contraseña - Panel Dulce Ezeiza</title>

      <div className="login-imagen">
        <img src="/img/sitio/horno.svg" alt="" />
        <div className="login-marca">
          <span className="login-marca-nombre">Dulce Ezeiza</span>
          <p>Panel de administración</p>
        </div>
      </div>

      <main className="login-lado-formulario">
        {paso === 'email' && (
          <form className="login-formulario" onSubmit={pedirCodigo} noValidate>
            <div>
              <h1 className="login-titulo">Recuperar contraseña</h1>
              <p className="login-bajada">Escribí tu email y te mandamos un código para elegir una contraseña nueva.</p>
            </div>

            {errorServidor && (
              <div role="alert" className="login-aviso login-aviso-error">{errorServidor.message}</div>
            )}

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

            <button type="submit" className="boton login-boton" disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviar código'}
            </button>

            <Link to="/admin/login" className="login-volver">Volver a ingresar</Link>
          </form>
        )}

        {paso === 'codigo' && (
          <form className="login-formulario" onSubmit={cambiarPassword} noValidate>
            <div>
              <h1 className="login-titulo">Elegí tu contraseña nueva</h1>
              <p className="login-bajada">
                Si el email está registrado, te mandamos un código de 6 números. Vale 15 minutos.
                Si no lo ves, revisá la carpeta de spam.
              </p>
            </div>

            {errorServidor && (
              <div role="alert" className="login-aviso login-aviso-error">{errorServidor.message}</div>
            )}

            <div className="campo">
              <label htmlFor="codigo" className="campo-etiqueta">Código del mail</label>
              <input
                id="codigo"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className={errores.codigo ? 'campo-control con-error' : 'campo-control'}
                aria-invalid={errores.codigo ? true : undefined}
                aria-describedby={errores.codigo ? 'codigo-error' : undefined}
              />
              {errores.codigo && <span id="codigo-error" className="campo-error">{errores.codigo}</span>}
            </div>

            <div className="campo">
              <label htmlFor="passwordNueva" className="campo-etiqueta">Contraseña nueva</label>
              <input
                id="passwordNueva"
                type="password"
                autoComplete="new-password"
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                className={errores.passwordNueva ? 'campo-control con-error' : 'campo-control'}
                aria-invalid={errores.passwordNueva ? true : undefined}
                aria-describedby={errores.passwordNueva ? 'passwordNueva-error' : undefined}
              />
              {errores.passwordNueva && (
                <span id="passwordNueva-error" className="campo-error">{errores.passwordNueva}</span>
              )}
            </div>

            <div className="campo">
              <label htmlFor="repetir" className="campo-etiqueta">Repetí la contraseña nueva</label>
              <input
                id="repetir"
                type="password"
                autoComplete="new-password"
                value={repetir}
                onChange={(e) => setRepetir(e.target.value)}
                className={errores.repetir ? 'campo-control con-error' : 'campo-control'}
                aria-invalid={errores.repetir ? true : undefined}
                aria-describedby={errores.repetir ? 'repetir-error' : undefined}
              />
              {errores.repetir && <span id="repetir-error" className="campo-error">{errores.repetir}</span>}
            </div>

            <button type="submit" className="boton login-boton" disabled={enviando}>
              {enviando ? 'Guardando...' : 'Cambiar contraseña'}
            </button>

            <button type="button" className="boton boton-secundario login-boton" onClick={pedirOtroCodigo}>
              Pedir otro código
            </button>
          </form>
        )}

        {paso === 'listo' && (
          <div className="login-formulario">
            <div>
              <h1 className="login-titulo">Contraseña cambiada</h1>
              <p className="login-bajada">Ya podés ingresar al panel con tu contraseña nueva.</p>
            </div>
            <Link to="/admin/login" className="boton login-boton">Ir a ingresar</Link>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminRecuperar