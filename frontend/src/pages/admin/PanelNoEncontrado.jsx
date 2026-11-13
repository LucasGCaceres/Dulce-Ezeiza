import { Link, useLocation } from 'react-router-dom'

// Cualquier dirección dentro de /admin que no existe (/admin/lo-que-sea).
// Va dentro del LayoutAdmin: el menú sigue a mano para ir a otro lado.
function PanelNoEncontrado() {
  const { pathname } = useLocation()
  return (
    <div className="panel-no-encontrado">
      <title>Página no encontrada - Panel Dulce Ezeiza</title>
      <h1 className="panel-titulo">Esta página no existe</h1>
      <p className="panel-bajada">No hay nada en {pathname}. Revisá la dirección o elegí una sección del menú.</p>
      <Link to="/admin" className="boton">Ir al inicio del panel</Link>
    </div>
  )
}

export default PanelNoEncontrado