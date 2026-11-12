import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSesion } from '../../hooks/useSesion'
import { usePedido } from '../../hooks/usePedido'
import { obtenerConsultas } from '../../services/consultas'
import './LayoutAdmin.css'

const SECCIONES = [
  { ruta: '/admin', texto: 'Inicio', exacta: true },
  { ruta: '/admin/consultas', texto: 'Consultas', conContador: true },
  { ruta: '/admin/productos', texto: 'Productos' },
  { ruta: '/admin/categorias', texto: 'Categorías' },
  { ruta: '/admin/novedades', texto: 'Novedades' },
  { ruta: '/admin/configuracion', texto: 'Datos del local' }
]

// ============================================================
//  Marco de todas las pantallas del panel: menú lateral + contenido.
//  Es el equivalente a LayoutPublico, pero para /admin.
// ============================================================
function LayoutAdmin() {
  const { usuario, cerrarSesion } = useSesion()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Cantidad de consultas pendientes para el numerito del menú. Se vuelve
  // a pedir al cambiar de pantalla, así se actualiza después de responder.
  const pendientes = usePedido(() => obtenerConsultas({ estado: 'pendiente' }), [pathname])
  const cantidadPendientes = (pendientes.datos ?? pendientes.ultimosDatos)?.length ?? 0

  function salir() {
    cerrarSesion()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="panel">
      <title>Panel - Dulce Ezeiza</title>

      <aside className="panel-menu">
        <div className="panel-marca">
          <span className="panel-marca-nombre">Dulce Ezeiza</span>
          <span className="panel-marca-bajada">Panel de administración</span>
        </div>

        <nav aria-label="Panel" className="panel-nav">
          {SECCIONES.map((seccion) => (
            // NavLink sabe solo si es la página actual: le pone la clase
            // "active" y aria-current="page". Con "end", /admin solo se
            // marca en el inicio y no en todas las páginas del panel.
            <NavLink key={seccion.ruta} to={seccion.ruta} end={seccion.exacta} className="panel-nav-link">
              {seccion.texto}
              {seccion.conContador && cantidadPendientes > 0 && (
                <>
                  {/* El número se ve; el lector de pantalla lee "3 pendientes". */}
                  <span className="panel-contador" aria-hidden="true">{cantidadPendientes}</span>
                  <span className="solo-lector">, {cantidadPendientes} pendientes</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="panel-usuario">
          <span className="panel-usuario-nombre">{usuario.nombre}</span>
          <span className="panel-usuario-email">{usuario.email}</span>
          <div className="panel-usuario-acciones">
            <Link to="/">Ver el sitio</Link>
            <button type="button" onClick={salir}>Cerrar sesión</button>
          </div>
        </div>
      </aside>

      <main className="panel-contenido">
        <Outlet />
      </main>
    </div>
  )
}

export default LayoutAdmin