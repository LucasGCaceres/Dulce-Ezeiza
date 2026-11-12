import { useEffect, useState } from 'react'
import { SesionContext } from './SesionContext'
import { iniciarSesion as pedirLogin } from '../services/auth'
import { leerSesion, guardarSesion, borrarSesion } from '../services/sesion'
import { configurarAlPerderSesion, ErrorApi } from '../services/api'

// ============================================================
//  Guarda quién está logueado y se lo ofrece a toda la app.
//  Envuelve a <App /> en main.jsx.
// ============================================================
function SesionProvider({ children }) {
  // Arranca con lo que haya en localStorage: así un F5 no cierra la sesión.
  // (Inicialización perezosa: leerSesion se llama una sola vez.)
  const [sesion, setSesion] = useState(leerSesion)

  // Por qué se salió del panel: 'vencida' (el backend respondió 401) o
  // 'cerrada' (tocó "Cerrar sesión"). El login lo usa para mostrar un aviso.
  const [motivoSalida, setMotivoSalida] = useState(null)

  // Le decimos a api.js qué hacer cuando un pedido del panel recibe un 401.
  // Va en un efecto porque es "conectarse con algo de afuera de React".
  useEffect(() => {
    configurarAlPerderSesion(() => {
      borrarSesion()
      setSesion(null)
      setMotivoSalida('vencida')
    })
  }, [])

  async function iniciarSesion(email, password) {
    const respuesta = await pedirLogin(email, password)
    // Hoy el único usuario es el admin, pero si algún día hubiera otros
    // roles, solo el admin entra al panel.
    if (respuesta.usuario.rol !== 'admin') {
      throw new ErrorApi('Esta cuenta no tiene acceso al panel.', 403)
    }
    const nueva = { token: respuesta.token, usuario: respuesta.usuario }
    guardarSesion(nueva)
    setSesion(nueva)
    setMotivoSalida(null)
  }

  function cerrarSesion() {
    borrarSesion()
    setSesion(null)
    setMotivoSalida('cerrada')
  }

  const valor = {
    usuario: sesion?.usuario ?? null,
    iniciarSesion,
    cerrarSesion,
    motivoSalida
  }

  // En React 19 el contexto se usa directo como componente
  // (antes era <SesionContext.Provider value={...}>).
  return <SesionContext value={valor}>{children}</SesionContext>
}

export default SesionProvider