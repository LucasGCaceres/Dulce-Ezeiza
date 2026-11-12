import { useLocation } from 'react-router-dom'

// Provisoria: ocupa el lugar de las pantallas del panel que todavía no
// armamos (consultas, productos, etc.). Se borra al final.
function PanelEnConstruccion() {
  const { pathname } = useLocation()
  return (
    <div>
      <h1 className="panel-titulo">En construcción</h1>
      <p className="panel-bajada">La pantalla {pathname} todavía no está armada.</p>
    </div>
  )
}

export default PanelEnConstruccion