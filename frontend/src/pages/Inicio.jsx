import { Link } from 'react-router-dom'
import { usePedido } from '../hooks/usePedido'
import { obtenerProductos } from '../services/productos'
import { obtenerCategorias } from '../services/categorias'
import { obtenerNovedades } from '../services/novedades'
import FotoProducto from '../components/FotoProducto'
import ErrorCarga from '../components/ErrorCarga'
import { formatearFecha, fechaParaTime } from '../utils/formato'
import './Inicio.css'

// ============================================================
//  Inicio: la página es una suma de secciones. Cada sección es un
//  componente chico de este mismo archivo, que recibe solo los
//  datos que necesita y maneja su propio "cargando" o "error".
// ============================================================

function Inicio() {
  // Tres pedidos que corren en paralelo. Si uno falla, el resto de
  // la página se sigue viendo.
  // Productos se pide UNA vez y se reparte: Especialidades usa los
  // destacados, Categorías los cuenta y Sin TACC usa los sin gluten.
  const productos = usePedido(obtenerProductos)
  const categorias = usePedido(obtenerCategorias)
  const novedades = usePedido(() => obtenerNovedades({ limite: 3 }))

  return (
    <>
      <Portada />
      <Especialidades pedido={productos} />
      <Categorias categorias={categorias} productos={productos} />
      <Encargos />
      <SinTacc pedido={productos} />
      <UltimasNovedades pedido={novedades} />
    </>
  )
}

// ---------- Portada (texto fijo) ----------

function Portada() {
  return (
    <section className="contenedor inicio-portada">
      <div className="inicio-portada-texto">
        <p className="antetitulo">Panadería y pastelería en Ezeiza</p>
        <h1 className="inicio-portada-titulo">Pan y facturas recién salidos del horno.</h1>
        <p className="inicio-portada-bajada">
          Horneamos todos los días, con opciones sin TACC. Mirá qué hay hoy en el catálogo.
        </p>
        <div className="inicio-botones">
          <Link to="/catalogo" className="boton">Ver el catálogo</Link>
          <Link to="/nosotros" className="boton boton-secundario">Conocenos</Link>
        </div>
      </div>
      <img
        src="/img/sitio/mostrador.svg"
        alt="Mostrador con pan de campo, flautas, medialunas y un café"
        className="inicio-portada-foto"
      />
    </section>
  )
}

// ---------- Especialidades: productos con destacado = true ----------

function Especialidades({ pedido }) {
  const { datos, cargando, error, reintentar } = pedido
  const destacados = datos ? datos.filter((p) => p.destacado) : []

  // Si cargó bien pero el admin no destacó nada, la sección no aparece.
  if (!cargando && !error && destacados.length === 0) return null

  // El primero va grande; los tres siguientes, en la columna de al lado.
  const [principal, ...resto] = destacados
  const secundarios = resto.slice(0, 3)

  return (
    <section aria-labelledby="titulo-especialidades" className="contenedor inicio-seccion">
      <div className="encabezado-seccion">
        <h2 id="titulo-especialidades" className="titulo-seccion">Especialidades de la casa</h2>
        <Link to="/catalogo" className="link-acento">Ver el catálogo</Link>
      </div>

      {cargando && <EspecialidadesCargando />}

      {error && <ErrorCarga titulo="No pudimos cargar los productos." onReintentar={reintentar} />}

      {principal && (
        <div className="especialidades">
          <Link to={`/productos/${principal.id}`} className="especialidad-principal">
            <FotoProducto producto={principal} />
            <span className="especialidad-principal-nombre">{principal.nombre}</span>
            <span className="especialidad-descripcion">{principal.descripcion}</span>
          </Link>

          {secundarios.length > 0 && (
            <ul className="especialidades-lista">
              {secundarios.map((producto) => (
                <li key={producto.id}>
                  <Link to={`/productos/${producto.id}`} className="especialidad-chica">
                    <FotoProducto producto={producto} className="especialidad-chica-foto" />
                    <span className="especialidad-chica-texto">
                      <span className="especialidad-chica-nombre">{producto.nombre}</span>
                      <span className="especialidad-descripcion">{producto.descripcion}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

// Misma forma que las especialidades, pero con bloques grises.
function EspecialidadesCargando() {
  return (
    <div className="especialidades" aria-busy="true" aria-label="Cargando productos">
      <div className="especialidad-principal">
        <div className="esqueleto" style={{ aspectRatio: '4 / 3' }} />
        <div className="esqueleto" style={{ width: '60%', height: 28 }} />
        <div className="esqueleto" style={{ width: '40%', height: 18 }} />
      </div>
      <div className="especialidades-lista">
        {[1, 2, 3].map((n) => (
          <div key={n} className="especialidad-chica">
            <div className="esqueleto especialidad-chica-foto" />
            <div className="especialidad-chica-texto">
              <div className="esqueleto" style={{ width: '80%', height: 20 }} />
              <div className="esqueleto" style={{ width: '50%', height: 16 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------- Categorías: una tarjeta por categoría activa ----------
// El backend no devuelve ni cuántos productos tiene cada categoría ni
// una foto. Las dos cosas se sacan de la lista de productos que ya
// pedimos: la cantidad se cuenta, y la foto es la del primer producto.

function Categorias({ categorias, productos }) {
  // Si falla alguno de los dos pedidos, la sección no aparece:
  // Especialidades ya muestra el error y el botón de reintentar.
  if (categorias.error || productos.error) return null

  const cargando = categorias.cargando || productos.cargando

  const tarjetas = cargando
    ? []
    : categorias.datos
        .map((categoria) => {
          const suyos = productos.datos.filter((p) => p.categoriaId === categoria.id)
          return {
            ...categoria,
            cantidad: suyos.length,
            // Preferimos un producto que tenga foto; si ninguno tiene, el primero.
            muestra: suyos.find((p) => p.imagenes.length > 0) ?? suyos[0]
          }
        })
        .filter((categoria) => categoria.cantidad > 0)

  if (!cargando && tarjetas.length === 0) return null

  return (
    <section aria-labelledby="titulo-categorias" className="contenedor inicio-seccion">
      <h2 id="titulo-categorias" className="titulo-seccion inicio-titulo-categorias">Buscá por categoría</h2>

      <ul className="categorias-grilla" aria-busy={cargando}>
        {cargando &&
          [1, 2, 3, 4, 5, 6].map((n) => (
            <li key={n} className="categoria-tarjeta">
              <div className="esqueleto" style={{ aspectRatio: '4 / 3' }} />
              <div className="esqueleto" style={{ width: '70%', height: 20 }} />
            </li>
          ))}

        {tarjetas.map((categoria) => (
          <li key={categoria.id}>
            <Link to={`/catalogo?categoriaId=${categoria.id}`} className="categoria-tarjeta">
              <FotoProducto producto={categoria.muestra} />
              <span className="categoria-pie">
                <span className="categoria-nombre">{categoria.nombre}</span>
                <span className="categoria-cantidad">
                  {categoria.cantidad} {categoria.cantidad === 1 ? 'producto' : 'productos'}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ---------- Encargos (texto fijo) ----------

const PASOS_ENCARGO = [
  { titulo: 'Elegí qué querés', texto: 'Del catálogo o algo a medida: contanos la idea.' },
  { titulo: 'Mandanos la consulta', texto: 'Para cuándo y para cuántos. Te contestamos por mail.' },
  { titulo: 'Retiralo en el local', texto: 'Coordinamos el día y se paga ahí.' }
]

function Encargos() {
  return (
    <section aria-labelledby="titulo-encargos" className="inicio-encargos">
      <div className="contenedor inicio-encargos-interior">
        <img
          src="/img/sitio/torta-de-cumple.svg"
          alt="Torta de cumpleaños de chocolate con velas"
          className="inicio-encargos-foto"
        />
        <div className="inicio-encargos-texto">
          <h2 id="titulo-encargos" className="titulo-seccion">¿Una torta para el cumple? Pedila así.</h2>
          <p className="inicio-encargos-bajada">
            No vendemos online: lo hablamos con vos y lo retirás en el local.
          </p>
          <ol className="inicio-pasos">
            {PASOS_ENCARGO.map((paso) => (
              <li key={paso.titulo}>
                <span className="inicio-paso-titulo">{paso.titulo}</span>
                <span>{paso.texto}</span>
              </li>
            ))}
          </ol>
          <div>
            <Link to="/contacto" className="boton">Consultar por un encargo</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------- Sin TACC: texto fijo + dos productos sin gluten ----------

function SinTacc({ pedido }) {
  const { datos, cargando } = pedido
  const sinGluten = datos ? datos.filter((p) => p.sinGluten).slice(0, 2) : []

  return (
    <section aria-labelledby="titulo-sintacc" className="contenedor inicio-seccion">
      <div className="inicio-sintacc">
        <div className="inicio-sintacc-texto">
          <p className="antetitulo">Apto celíacos</p>
          <h2 id="titulo-sintacc" className="titulo-seccion">Sin TACC, sin miedo.</h2>
          <p className="inicio-sintacc-bajada">
            Se elaboran en una zona libre de contaminación cruzada. En el catálogo los filtrás con un clic.
          </p>
          <div>
            <Link to="/catalogo?sinGluten=true" className="boton boton-secundario">Ver productos sin TACC</Link>
          </div>
        </div>

        {/* Si falla la carga o no hay productos sin gluten, queda solo el texto. */}
        {(cargando || sinGluten.length > 0) && (
          <ul className="inicio-sintacc-productos" aria-busy={cargando}>
            {cargando &&
              [1, 2].map((n) => (
                <li key={n}>
                  <div className="esqueleto" style={{ aspectRatio: '4 / 3' }} />
                </li>
              ))}
            {sinGluten.map((producto) => (
              <li key={producto.id}>
                <Link to={`/productos/${producto.id}`} className="inicio-sintacc-producto">
                  <FotoProducto producto={producto} />
                  <span>{producto.nombre}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

// ---------- Novedades: las 3 más nuevas ----------

function UltimasNovedades({ pedido }) {
  const { datos, cargando, error } = pedido

  // Es una sección secundaria: si falla o no hay novedades, no se muestra.
  if (error || (!cargando && datos.length === 0)) return null

  const [primera, ...otras] = datos ?? []

  return (
    <section aria-labelledby="titulo-novedades" className="contenedor inicio-seccion">
      <div className="encabezado-seccion">
        <h2 id="titulo-novedades" className="titulo-seccion">Novedades</h2>
        <Link to="/novedades" className="link-acento">Ver todas las novedades</Link>
      </div>

      {cargando ? (
        <div className="inicio-novedades" aria-busy="true" aria-label="Cargando novedades">
          <div className="esqueleto inicio-novedad-principal" style={{ aspectRatio: '16 / 9' }} />
          <div className="inicio-novedades-lista">
            <div className="esqueleto" style={{ height: 90 }} />
            <div className="esqueleto" style={{ height: 90 }} />
          </div>
        </div>
      ) : (
        <div className="inicio-novedades">
          <Link to={`/novedades/${primera.id}`} className="inicio-novedad-principal">
            {primera.imagenUrl && <img src={primera.imagenUrl} alt="" className="inicio-novedad-foto" />}
            <time dateTime={fechaParaTime(primera.fechaPublicacion)} className="inicio-novedad-fecha">
              {formatearFecha(primera.fechaPublicacion)}
            </time>
            <span className="inicio-novedad-principal-titulo">{primera.titulo}</span>
            <span className="inicio-novedad-resumen">{primera.resumen}</span>
          </Link>

          {otras.length > 0 && (
            <ul className="inicio-novedades-lista">
              {otras.map((novedad) => (
                <li key={novedad.id}>
                  <Link to={`/novedades/${novedad.id}`} className="inicio-novedad">
                    <time dateTime={fechaParaTime(novedad.fechaPublicacion)} className="inicio-novedad-fecha">
                      {formatearFecha(novedad.fechaPublicacion)}
                    </time>
                    <span className="inicio-novedad-titulo">{novedad.titulo}</span>
                    <span className="inicio-novedad-resumen">{novedad.resumen}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

export default Inicio