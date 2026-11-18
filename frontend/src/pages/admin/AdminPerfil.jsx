import { useState } from 'react'
import { usePedido } from '../../hooks/usePedido'
import { useSesion } from '../../hooks/useSesion'
import { obtenerPerfil, editarPerfil, cambiarPassword } from '../../services/auth'
import ErrorCarga from '../../components/ErrorCarga'
import Campo from '../../components/admin/Campo'
import './AdminPerfil.css'

const LARGO_MINIMO_PASSWORD = 8

function emailValido(texto) {
  return /^\S+@\S+\.\S+$/.test(texto.trim())
}

// Solo números, espacios, +, guiones y paréntesis; y al menos 8 dígitos.
function telefonoValido(texto) {
  return !/[^\d\s+()-]/.test(texto) && texto.replace(/\D/g, '').length >= 8
}

// ============================================================
//  /admin/perfil — los datos personales del admin y su contraseña.
//  Son dos formularios independientes, cada uno con su botón y su aviso.
// ============================================================

function AdminPerfil() {
  const perfil = usePedido(obtenerPerfil)

  if (perfil.error) {
    return <ErrorCarga titulo="No pudimos cargar tu perfil." onReintentar={perfil.reintentar} />
  }
  if (!perfil.datos) return <div className="esqueleto" style={{ height: 420 }} aria-label="Cargando" />

  return (
    <div className="admin-perfil">
      <title>Mi perfil - Panel Dulce Ezeiza</title>

      <div>
        <h1 className="panel-titulo">Mi perfil</h1>
        <p className="panel-bajada">Tus datos personales y tu contraseña.</p>
      </div>

      <div className="admin-dos-columnas">
        <FormularioDatos perfil={perfil.datos} />
        <FormularioPassword />
      </div>
    </div>
  )
}

// ---------- Datos personales ----------

const CAMPOS = ['nombre', 'apellido', 'email', 'telefono']

function aValores(perfil) {
  const valores = {}
  for (const campo of CAMPOS) valores[campo] = perfil[campo] ?? ''
  return valores
}

function FormularioDatos({ perfil }) {
  const { actualizarUsuario } = useSesion()
  // "original" = lo que está guardado. Comparando contra eso sabemos
  // si hay cambios sin guardar.
  const [original, setOriginal] = useState(() => aValores(perfil))
  const [valores, setValores] = useState(original)
  const [intentoGuardar, setIntentoGuardar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState(null)

  const huboCambios = CAMPOS.some((campo) => valores[campo] !== original[campo])

  function cambiar(evento) {
    const { name, value } = evento.target
    setValores((anteriores) => ({ ...anteriores, [name]: value }))
    setAviso(null)
  }

  const errores = {}
  if (intentoGuardar) {
    if (!valores.nombre.trim()) errores.nombre = 'Escribí tu nombre.'
    if (!valores.apellido.trim()) errores.apellido = 'Escribí tu apellido.'
    if (!valores.email.trim()) errores.email = 'Escribí tu email.'
    else if (!emailValido(valores.email)) errores.email = 'Ese email no parece válido.'
    // Opcional: solo se revisa si escribiste algo.
    if (valores.telefono.trim() && !telefonoValido(valores.telefono)) {
      errores.telefono = 'Escribí un teléfono válido, con al menos 8 números.'
    }
  }

  async function guardar(evento) {
    evento.preventDefault()
    setIntentoGuardar(true)
    setAviso(null)

    const faltan = {
      nombre: !valores.nombre.trim(),
      apellido: !valores.apellido.trim(),
      email: !emailValido(valores.email),
      telefono: valores.telefono.trim() !== '' && !telefonoValido(valores.telefono)
    }

    const primero = CAMPOS.find((campo) => faltan[campo])
    if (primero) {
      document.getElementById(`perfil-${primero}`)?.focus()
      return
    }

    const datos = {}
    for (const campo of CAMPOS) datos[campo] = valores[campo].trim()

    setGuardando(true)
    try {
      const respuesta = await editarPerfil(datos)
      setValores(datos)
      setOriginal(datos)
      setIntentoGuardar(false)
      // El menú del panel muestra el nombre y el email: se actualizan al instante.
      actualizarUsuario({ nombre: respuesta.usuario.nombre, email: respuesta.usuario.email })
      setAviso({ tipo: 'ok', texto: 'Listo: tus datos quedaron guardados.' })
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message })
    } finally {
      setGuardando(false)
    }
  }

  function descartar() {
    setValores(original)
    setIntentoGuardar(false)
    setAviso(null)
  }

  return (
    <section aria-labelledby="titulo-datos" className="admin-caja">
      <h2 id="titulo-datos" className="admin-caja-titulo">Mis datos</h2>

      {aviso && (
        <div role={aviso.tipo === 'error' ? 'alert' : 'status'} className={`admin-aviso admin-aviso-${aviso.tipo}`}>
          <span>{aviso.texto}</span>
          <button type="button" onClick={() => setAviso(null)} aria-label="Cerrar aviso">×</button>
        </div>
      )}

      <form onSubmit={guardar} noValidate className="admin-perfil-form">
        <Campo id="perfil-nombre" etiqueta="Nombre" error={errores.nombre}>
          <input type="text" name="nombre" maxLength={100} autoComplete="given-name"
            value={valores.nombre} onChange={cambiar} />
        </Campo>
        <Campo id="perfil-apellido" etiqueta="Apellido" error={errores.apellido}>
          <input type="text" name="apellido" maxLength={100} autoComplete="family-name"
            value={valores.apellido} onChange={cambiar} />
        </Campo>
        <Campo id="perfil-email" etiqueta="Email" error={errores.email}
          ayuda="Es el que usás para ingresar y donde te llega el código si olvidás la contraseña.">
          <input type="email" name="email" maxLength={150} autoComplete="email"
            value={valores.email} onChange={cambiar} />
        </Campo>
        <Campo id="perfil-telefono" etiqueta="Teléfono" opcional error={errores.telefono}>
          <input type="tel" name="telefono" maxLength={50} autoComplete="tel"
            value={valores.telefono} onChange={cambiar} />
        </Campo>

        <div className="admin-perfil-acciones">
          <button type="button" className="boton boton-secundario" onClick={descartar} disabled={!huboCambios || guardando}>
            Descartar
          </button>
          <button type="submit" className="boton" disabled={!huboCambios || guardando}>
            {guardando ? 'Guardando...' : 'Guardar datos'}
          </button>
        </div>
      </form>
    </section>
  )
}

// ---------- Cambiar contraseña ----------

function FormularioPassword() {
  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [repetir, setRepetir] = useState('')
  const [intentoGuardar, setIntentoGuardar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState(null)

  const errores = {}
  if (intentoGuardar) {
    if (!passwordActual) errores.actual = 'Escribí tu contraseña actual.'
    if (passwordNueva.length < LARGO_MINIMO_PASSWORD) {
      errores.nueva = `La contraseña nueva necesita al menos ${LARGO_MINIMO_PASSWORD} caracteres.`
    } else if (passwordNueva === passwordActual) {
      errores.nueva = 'La contraseña nueva tiene que ser distinta de la actual.'
    }
    if (repetir !== passwordNueva) errores.repetir = 'Las contraseñas no coinciden.'
  }

  async function guardar(evento) {
    evento.preventDefault()
    setIntentoGuardar(true)
    setAviso(null)

    const hayErrores =
      !passwordActual ||
      passwordNueva.length < LARGO_MINIMO_PASSWORD ||
      passwordNueva === passwordActual ||
      repetir !== passwordNueva
    if (hayErrores) {
      const primero = !passwordActual
        ? 'actual'
        : passwordNueva.length < LARGO_MINIMO_PASSWORD || passwordNueva === passwordActual ? 'nueva' : 'repetir'
      document.getElementById(`password-${primero}`)?.focus()
      return
    }

    setGuardando(true)
    try {
      await cambiarPassword(passwordActual, passwordNueva)
      setPasswordActual('')
      setPasswordNueva('')
      setRepetir('')
      setIntentoGuardar(false)
      setAviso({ tipo: 'ok', texto: 'Listo: tu contraseña ya cambió.' })
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section aria-labelledby="titulo-password" className="admin-caja">
      <h2 id="titulo-password" className="admin-caja-titulo">Cambiar contraseña</h2>

      {aviso && (
        <div role={aviso.tipo === 'error' ? 'alert' : 'status'} className={`admin-aviso admin-aviso-${aviso.tipo}`}>
          <span>{aviso.texto}</span>
          <button type="button" onClick={() => setAviso(null)} aria-label="Cerrar aviso">×</button>
        </div>
      )}

      <form onSubmit={guardar} noValidate className="admin-perfil-form">
        <Campo id="password-actual" etiqueta="Contraseña actual" error={errores.actual}>
          <input type="password" autoComplete="current-password"
            value={passwordActual} onChange={(e) => { setPasswordActual(e.target.value); setAviso(null) }} />
        </Campo>
        <Campo id="password-nueva" etiqueta="Contraseña nueva" error={errores.nueva}
          ayuda={`Al menos ${LARGO_MINIMO_PASSWORD} caracteres.`}>
          <input type="password" autoComplete="new-password"
            value={passwordNueva} onChange={(e) => { setPasswordNueva(e.target.value); setAviso(null) }} />
        </Campo>
        <Campo id="password-repetir" etiqueta="Repetí la contraseña nueva" error={errores.repetir}>
          <input type="password" autoComplete="new-password"
            value={repetir} onChange={(e) => { setRepetir(e.target.value); setAviso(null) }} />
        </Campo>

        <div className="admin-perfil-acciones">
          <button type="submit" className="boton" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default AdminPerfil