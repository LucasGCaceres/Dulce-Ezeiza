import { Link } from 'react-router-dom'
import { usePedido } from '../hooks/usePedido'
import { obtenerComercio } from '../services/comercio'
import { REDES } from '../utils/redes'
import './Footer.css'

const SECCIONES = [
  { ruta: '/', texto: 'Inicio' },
  { ruta: '/catalogo', texto: 'Catálogo' },
  { ruta: '/novedades', texto: 'Novedades' },
  { ruta: '/nosotros', texto: 'Nosotros' },
  { ruta: '/contacto', texto: 'Contacto' }
]

function Footer() {
  const { datos: comercio } = usePedido(obtenerComercio)

  // Si la API falla, el footer no muestra un error: sigue con lo que
  // no depende de los datos (marca y links). No vale la pena alarmar
  // al visitante en todas las páginas por el pie.
  const direccion = comercio?.direccion
  // Las redes son opcionales en la base: solo mostramos las cargadas.
  const redes = REDES.filter((red) => comercio?.[red.campo])
  const linkMapa = direccion
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`
    : null

  return (
    <footer className="footer">
      <div className="contenedor footer-interior">
        <div className="footer-info">
          <div className="footer-marca">
            <p className="footer-nombre">{comercio?.nombre ?? 'Dulce Ezeiza'}</p>
            {comercio?.descripcion && <p className="footer-descripcion">{comercio.descripcion}</p>}
          </div>

          <div className="footer-columnas">
            {comercio && (
              <div>
                <h2 className="footer-titulo">Dónde estamos</h2>
                {direccion && <p>{direccion}</p>}
                {comercio.telefono && (
                  <p>
                    {/* tel: abre el marcador en el celular */}
                    <a href={`tel:${comercio.telefono.replace(/[^\d+]/g, '')}`} className="footer-link">
                      {comercio.telefono}
                    </a>
                  </p>
                )}
              </div>
            )}

            {comercio?.horarios && (
              <div>
                <h2 className="footer-titulo">Horarios</h2>
                {/* Texto libre que carga el admin: pre-line respeta sus saltos de línea. */}
                <p className="footer-horarios">{comercio.horarios}</p>
              </div>
            )}

            <nav aria-label="Secciones del sitio">
              <h2 className="footer-titulo">El sitio</h2>
              <ul className="footer-lista">
                {SECCIONES.map(({ ruta, texto }) => (
                  <li key={ruta}>
                    <Link to={ruta} className="footer-link">{texto}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            {redes.length > 0 && (
              <div>
                <h2 className="footer-titulo">Seguinos</h2>
                <ul className="footer-lista">
                  {redes.map((red) => (
                    <li key={red.campo}>
                      <a href={red.url(comercio[red.campo])} className="footer-link" target="_blank" rel="noreferrer">
                        {red.nombre}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {direccion && (
          <div className="footer-mapa">
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`}
              title={`Mapa: ${direccion}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a href={linkMapa} className="footer-como-llegar" target="_blank" rel="noreferrer">
              Cómo llegar
            </a>
          </div>
        )}
      </div>

      <div className="footer-pie">
        <div className="contenedor footer-pie-interior">
          <span>© {new Date().getFullYear()} {comercio?.nombre ?? 'Dulce Ezeiza'}</span>
          <span>TPO Aplicaciones Interactivas. Caceres, Minigozi, Morbach</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer