import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

// Links del menú. Están en un array para no repetir el mismo JSX
// cuatro veces y para poder agregar una sección en una sola línea.
const SECCIONES = [
  { ruta: '/', texto: 'Inicio' },
  { ruta: '/catalogo', texto: 'Catálogo' },
  { ruta: '/novedades', texto: 'Novedades' },
  { ruta: '/nosotros', texto: 'Nosotros' }
]

// ¿El link de esta sección corresponde a la página actual?
function estaActiva(ruta, pathname) {
  // "/" solo en el inicio exacto: si no, todas las páginas lo activarían.
  if (ruta === '/') return pathname === '/'
  // El detalle de producto (/productos/5) es parte del catálogo.
  if (ruta === '/catalogo') return pathname.startsWith('/catalogo') || pathname.startsWith('/productos')
  // /novedades y /novedades/3 activan "Novedades".
  return pathname.startsWith(ruta)
}

function Navbar() {
  // useLocation devuelve la URL actual y hace que el Navbar se vuelva
  // a dibujar cada vez que cambia: así el link activo se actualiza solo.
  const { pathname } = useLocation()

  return (
    <header className="navbar">
      <nav aria-label="Principal" className="contenedor navbar-interior">
        <Link to="/" className="navbar-marca">Dulce Ezeiza</Link>

        <div className="navbar-links">
          {SECCIONES.map(({ ruta, texto }) => {
            const activa = estaActiva(ruta, pathname)
            return (
              <Link
                key={ruta}
                to={ruta}
                className={activa ? 'navbar-link activo' : 'navbar-link'}
                // Le avisa al lector de pantalla cuál es la página actual.
                aria-current={activa ? 'page' : undefined}
              >
                {texto}
              </Link>
            )
          })}

          <Link to="/contacto" className="boton navbar-consulta">
            Hacer una consulta
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Navbar