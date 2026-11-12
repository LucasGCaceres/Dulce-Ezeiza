import { use } from 'react'
import { SesionContext } from '../context/SesionContext'

// Lee la sesión desde cualquier componente:
//   const { usuario, iniciarSesion, cerrarSesion } = useSesion()
// use() es la forma de React 19 de leer un contexto (antes, useContext).
export function useSesion() {
  const sesion = use(SesionContext)
  if (!sesion) {
    // Pasa si un componente usa useSesion() fuera del <SesionProvider>.
    // Mejor un error claro que un "cannot read properties of null" raro.
    throw new Error('useSesion() se usó fuera de <SesionProvider>. Revisá main.jsx.')
  }
  return sesion
}