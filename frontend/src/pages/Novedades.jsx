import { Link } from 'react-router-dom'
import { usePedido } from '../hooks/usePedido'
import { obtenerNovedades } from '../services/novedades'
import FotoNovedad from '../components/FotoNovedad'
import TarjetaNovedad, { FechaNovedad } from '../components/TarjetaNovedad'
import ErrorCarga from '../components/ErrorCarga'
import './Novedades.css'

// ============================================================
//  Novedades: /novedades
//  La más nueva va destacada arriba; el resto, en una grilla.
// ============================================================

function Novedades() {
  const { datos, cargando, error, reintentar } = usePedido(obtenerNovedades)
  const [principal, ...anteriores] = datos ?? []

  return (
    <div className="contenedor novedades">
      <title>Novedades - Dulce Ezeiza</title>

      <h1 className="novedades-titulo">Novedades</h1>
      <p className="novedades-bajada">Productos nuevos, horarios especiales y lo que pasa en la panadería.</p>

      {cargando && <NovedadesCargando />}

      {error && <ErrorCarga titulo="No pudimos cargar las novedades." onReintentar={reintentar} />}

      {datos && datos.length === 0 && (
        <div className="novedades-vacio">
          <p className="novedades-vacio-titulo">Todavía no publicamos novedades.</p>
          <p>Mientras tanto, mirá lo que horneamos hoy.</p>
          <Link to="/catalogo" className="boton">Ver el catálogo</Link>
        </div>
      )}

      {principal && (
        <>
          <Link to={`/novedades/${principal.id}`} className="novedad-destacada">
            <FotoNovedad novedad={principal} />
            <span className="novedad-destacada-texto">
              <FechaNovedad iso={principal.fechaPublicacion} />
              <span className="novedad-destacada-titulo">{principal.titulo}</span>
              <span className="novedad-resumen">{principal.resumen}</span>
              <span className="novedad-leer">Leer la novedad</span>
            </span>
          </Link>

          {anteriores.length > 0 && (
            <section aria-labelledby="titulo-anteriores">
              <h2 id="titulo-anteriores" className="titulo-seccion novedades-subtitulo">Anteriores</h2>
              <ul className="novedades-grilla">
                {anteriores.map((novedad) => (
                  <li key={novedad.id}>
                    <TarjetaNovedad novedad={novedad} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function NovedadesCargando() {
  return (
    <div aria-busy="true" aria-label="Cargando novedades">
      <div className="novedad-destacada">
        <div className="esqueleto" style={{ aspectRatio: '16 / 9' }} />
        <div className="novedad-destacada-texto">
          <div className="esqueleto" style={{ width: '40%', height: 18 }} />
          <div className="esqueleto" style={{ width: '90%', height: 40 }} />
          <div className="esqueleto" style={{ width: '75%', height: 20 }} />
        </div>
      </div>
      <div className="novedades-grilla">
        {[1, 2, 3].map((n) => (
          <div key={n} className="novedad-tarjeta">
            <div className="esqueleto" style={{ aspectRatio: '16 / 9' }} />
            <div className="esqueleto" style={{ width: '50%', height: 16 }} />
            <div className="esqueleto" style={{ width: '85%', height: 24 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Novedades