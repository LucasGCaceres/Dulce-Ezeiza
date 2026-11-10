import { Link, useParams } from 'react-router-dom'
import { usePedido } from '../hooks/usePedido'
import { obtenerNovedad, obtenerNovedades } from '../services/novedades'
import FotoProducto from '../components/FotoProducto'
import TarjetaNovedad, { FechaNovedad } from '../components/TarjetaNovedad'
import ErrorCarga from '../components/ErrorCarga'
import NoEncontrado from './NoEncontrado'
import { dividirEnParrafos } from '../utils/formato'
import './DetalleNovedad.css'

// ============================================================
//  Detalle de novedad: /novedades/:id
//  Misma estructura que el detalle de producto: pedido por id,
//  404 si no existe, y una sección con "más" abajo.
// ============================================================

function DetalleNovedad() {
  const { id } = useParams()
  const { datos: novedad, cargando, error, reintentar } = usePedido(() => obtenerNovedad(id), [id])

  if (error && (error.status === 404 || error.status === 400)) {
    return <NoEncontrado />
  }

  return (
    <div className="contenedor detalle-novedad">
      {cargando && <DetalleNovedadCargando />}

      {error && (
        <div className="detalle-novedad-error">
          <ErrorCarga titulo="No pudimos cargar esta novedad." onReintentar={reintentar} />
          <Link to="/novedades" className="link-acento">Volver a novedades</Link>
        </div>
      )}

      {novedad && (
        <>
          <title>{`${novedad.titulo} - Dulce Ezeiza`}</title>

          <nav aria-label="Ubicación" className="detalle-novedad-migas">
            <Link to="/novedades">Novedades</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{novedad.titulo}</span>
          </nav>

          {/* <article>: contenido que tiene sentido por sí solo (como una
              nota de un diario). Le dice al navegador y a los lectores de
              pantalla dónde empieza y termina "la novedad". */}
          <article>
            <header className="detalle-novedad-encabezado">
              <FechaNovedad iso={novedad.fechaPublicacion} />
              <h1 className="detalle-novedad-titulo">{novedad.titulo}</h1>
              {novedad.resumen && <p className="detalle-novedad-resumen">{novedad.resumen}</p>}
            </header>

            {novedad.imagenUrl && (
              <img src={novedad.imagenUrl} alt="" className="detalle-novedad-foto" />
            )}

            <div className="detalle-novedad-cuerpo">
              <div className="detalle-novedad-texto">
                {/* El contenido es texto plano con saltos de línea: lo partimos
                    en párrafos. React escapa el texto, así que si alguien
                    escribiera <script> en el panel, se vería como texto y no
                    se ejecutaría. */}
                {dividirEnParrafos(novedad.contenido).map((parrafo, indice) => (
                  <p key={indice}>{parrafo}</p>
                ))}
              </div>

              {novedad.Producto && <ProductoDeLaNovedad producto={novedad.Producto} />}
            </div>
          </article>

          <OtrasNovedades idActual={novedad.id} />
        </>
      )}
    </div>
  )
}

// Si la novedad está asociada a un producto, una tarjetita al costado
// con link a su detalle. El backend manda solo id, nombre e imágenes.
function ProductoDeLaNovedad({ producto }) {
  return (
    <aside aria-label="Producto de esta novedad" className="detalle-novedad-producto">
      <FotoProducto producto={producto} />
      <span className="detalle-novedad-producto-rotulo">Producto de esta novedad</span>
      <span className="detalle-novedad-producto-nombre">{producto.nombre}</span>
      <Link to={`/productos/${producto.id}`} className="boton boton-secundario">Ver el producto</Link>
    </aside>
  )
}

// Las 3 novedades más recientes, sin contar la que se está leyendo.
function OtrasNovedades({ idActual }) {
  const { datos } = usePedido(() => obtenerNovedades({ limite: 4 }))
  const otras = datos ? datos.filter((n) => n.id !== idActual).slice(0, 3) : []

  if (otras.length === 0) return null

  return (
    <section aria-labelledby="titulo-otras" className="detalle-novedad-otras">
      <div className="encabezado-seccion">
        <h2 id="titulo-otras" className="titulo-seccion detalle-novedad-otras-titulo">Otras novedades</h2>
        <Link to="/novedades" className="link-acento">Ver todas</Link>
      </div>
      <ul className="detalle-novedad-otras-lista">
        {otras.map((otra) => (
          <li key={otra.id}>
            <TarjetaNovedad novedad={otra} conResumen={false} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function DetalleNovedadCargando() {
  return (
    <div className="detalle-novedad-cargando" aria-busy="true" aria-label="Cargando novedad">
      <div className="esqueleto" style={{ width: '25%', height: 18 }} />
      <div className="esqueleto" style={{ width: '80%', height: 52 }} />
      <div className="esqueleto" style={{ width: '60%', height: 24 }} />
      <div className="esqueleto" style={{ aspectRatio: '21 / 9', marginTop: 16 }} />
    </div>
  )
}

export default DetalleNovedad