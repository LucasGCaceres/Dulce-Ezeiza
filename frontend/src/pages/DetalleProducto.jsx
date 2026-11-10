import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePedido } from '../hooks/usePedido'
import { obtenerProducto, obtenerProductos } from '../services/productos'
import FotoProducto from '../components/FotoProducto'
import ErrorCarga from '../components/ErrorCarga'
import NoEncontrado from './NoEncontrado'
import './DetalleProducto.css'

// ============================================================
//  Detalle de producto: /productos/:id
// ============================================================

function DetalleProducto() {
  // useParams lee la parte variable de la ruta: en /productos/5, id = "5".
  // Ojo: siempre llega como texto.
  const { id } = useParams()
  const { datos: producto, cargando, error, reintentar } = usePedido(() => obtenerProducto(id), [id])

  // 404: el producto no existe o está oculto. 400: el id no es un número
  // válido (por ejemplo /productos/abc). Para el visitante, las dos cosas
  // son "esa página no existe".
  if (error && (error.status === 404 || error.status === 400)) {
    return <NoEncontrado />
  }

  return (
    <div className="contenedor detalle">
      {cargando && <DetalleCargando />}

      {error && (
        <div className="detalle-error">
          <ErrorCarga titulo="No pudimos cargar este producto." onReintentar={reintentar} />
          <Link to="/catalogo" className="link-acento">Volver al catálogo</Link>
        </div>
      )}

      {producto && (
        <>
          <title>{`${producto.nombre} - Dulce Ezeiza`}</title>

          <nav aria-label="Ubicación" className="detalle-migas">
            <Link to="/catalogo">Catálogo</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/catalogo?categoriaId=${producto.categoriaId}`}>{producto.Categorium?.nombre}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{producto.nombre}</span>
          </nav>

          <div className="detalle-principal">
            {/* key: si desde "Más de esta categoría" pasás a otro producto,
                React reusa este mismo componente y la galería conservaría
                la foto elegida del producto anterior. Con una key distinta
                por producto, React la arma de cero y vuelve a la foto 1. */}
            <Galeria key={producto.id} producto={producto} />
            <Informacion producto={producto} />
          </div>

          <Relacionados producto={producto} />
        </>
      )}
    </div>
  )
}

// ---------- Galería: foto grande + miniaturas para elegir ----------

function Galeria({ producto }) {
  const [elegida, setElegida] = useState(0)
  const fotos = producto.imagenes

  // Sin fotos: el recuadro "Sin foto" de siempre.
  if (fotos.length === 0) {
    return (
      <div className="detalle-galeria">
        <FotoProducto producto={producto} />
      </div>
    )
  }

  return (
    <div className="detalle-galeria">
      <img src={fotos[elegida].url} alt={producto.nombre} className="detalle-foto-grande" />

      {/* Las miniaturas solo tienen sentido si hay más de una foto. */}
      {fotos.length > 1 && (
        <div className="detalle-miniaturas">
          {fotos.map((foto, indice) => (
            <button
              key={foto.id}
              type="button"
              onClick={() => setElegida(indice)}
              aria-label={`Ver foto ${indice + 1} de ${fotos.length}`}
              aria-pressed={indice === elegida}
              className={indice === elegida ? 'detalle-miniatura elegida' : 'detalle-miniatura'}
            >
              <img src={foto.url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- Columna de texto ----------

function Informacion({ producto }) {
  return (
    <div className="detalle-info">
      <p className="detalle-categoria">{producto.Categorium?.nombre}</p>
      <h1 className="detalle-titulo">{producto.nombre}</h1>

      {producto.descripcion && <p className="detalle-descripcion">{producto.descripcion}</p>}

      {producto.sinGluten && (
        <div>
          <span className="etiqueta">Sin TACC</span>
        </div>
      )}

      {!producto.disponible && (
        <div className="detalle-aviso" role="status">
          <p className="detalle-aviso-titulo">No disponible por ahora</p>
          <p>Si lo necesitás para una fecha puntual, consultanos y vemos si podemos hacerlo.</p>
        </div>
      )}

      <div className="detalle-accion">
        {/* El formulario de contacto lee productoId de la URL y deja este
            producto ya elegido en la consulta. */}
        <Link to={`/contacto?productoId=${producto.id}`} className="boton detalle-boton">
          Consultar por este producto
        </Link>
      </div>

      <div className="detalle-retiro">
        <p className="detalle-retiro-titulo">No hacemos envíos</p>
        <p>Se retira y se paga en el local. Para pedidos grandes, avisanos con anticipación.</p>
      </div>
    </div>
  )
}

// ---------- Más productos de la misma categoría ----------
// Es un componente aparte para que haga su propio pedido recién cuando
// ya tenemos el producto (necesita saber su categoría).

function Relacionados({ producto }) {
  const { datos } = usePedido(
    () => obtenerProductos({ categoriaId: producto.categoriaId }),
    [producto.categoriaId]
  )

  // Sacamos el producto que se está mirando y nos quedamos con 3.
  const otros = datos ? datos.filter((p) => p.id !== producto.id).slice(0, 3) : []

  // Mientras carga, si falla o si no hay otros, la sección no aparece:
  // está abajo de todo y no vale la pena ocupar lugar con eso.
  if (otros.length === 0) return null

  return (
    <section aria-labelledby="titulo-relacionados" className="detalle-relacionados">
      <h2 id="titulo-relacionados" className="titulo-seccion detalle-relacionados-titulo">
        Más de {producto.Categorium?.nombre}
      </h2>
      <ul className="detalle-relacionados-lista">
        {otros.map((otro) => (
          <li key={otro.id}>
            <Link to={`/productos/${otro.id}`} className="detalle-relacionado">
              <FotoProducto producto={otro} className="detalle-relacionado-foto" />
              <span className="detalle-relacionado-nombre">{otro.nombre}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function DetalleCargando() {
  return (
    <div className="detalle-principal detalle-cargando" aria-busy="true" aria-label="Cargando producto">
      <div className="detalle-galeria">
        <div className="esqueleto" style={{ aspectRatio: '4 / 3' }} />
      </div>
      <div className="detalle-info">
        <div className="esqueleto" style={{ width: '35%', height: 18 }} />
        <div className="esqueleto" style={{ width: '90%', height: 48 }} />
        <div className="esqueleto" style={{ width: '100%', height: 60 }} />
        <div className="esqueleto" style={{ width: '60%', height: 52, borderRadius: 999 }} />
      </div>
    </div>
  )
}

export default DetalleProducto