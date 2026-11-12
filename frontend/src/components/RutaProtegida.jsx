import { Navigate, useLocation } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'

// Envuelve las rutas del panel. Si no hay sesión, manda al login y le
// pasa a dónde quería ir (state.desde), para volver ahí después de ingresar.
//
// Esto es comodidad, NO seguridad: cualquiera puede escribir /admin en la
// barra o tocar el código en su navegador. La seguridad real está en el
// backend, que rechaza con 401 cualquier pedido del panel sin token válido.
function RutaProtegida({ children }) {
  const { usuario } = useSesion()
  const { pathname } = useLocation()

  if (!usuario) {
    return <Navigate to="/admin/login" replace state={{ desde: pathname }} />
  }
  return children
}

export default RutaProtegida