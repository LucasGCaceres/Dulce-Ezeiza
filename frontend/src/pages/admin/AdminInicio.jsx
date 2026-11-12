import { Link } from 'react-router-dom'
import { useSesion } from '../../hooks/useSesion'
import { usePedido } from '../../hooks/usePedido'
import { obtenerConsultas } from '../../services/consultas'
import { obtenerProductosAdmin } from '../../services/productos'
import { obtenerCategoriasAdmin } from '../../services/categorias'
import { obtenerTodasLasNovedades, esVisible } from '../../services/novedades'
import FotoNovedad from '../../components/FotoNovedad'
import ErrorCarga from '../../components/ErrorCarga'
import { formatearFecha, formatearHace, formatearHoy } from '../../utils/formato'
import './AdminInicio.css'

// ============================================================
//  /admin — resumen de lo que hay que atender.
//  El backend no tiene un endpoint de "estadísticas": los números
//  se calculan acá a partir de las listas que ya existen.
// ============================================================

function AdminInicio() {
  const { usuario } = useSesion()
  const consultas = usePedido(() => obtenerConsultas({ estado: 'pendiente' }))
  const productos = usePedido(obtenerProductosAdmin)
  const categorias = usePedido(obtenerCategoriasAdmin)
  const novedades = usePedido(obtenerTodasLasNovedades)

  const pedidos = [consultas, productos, categorias, novedades]
  const fallado = pedidos.find((pedido) => pedido.error)

  // ---------- Números de las tarjetas ----------
  const activos = productos.datos?.filter((p) => p.activo)
  const destacados = activos?.filter((p) => p.destacado).length
  const visibles = novedades.datos?.filter(esVisible)
  const borradores = novedades.datos?.filter((n) => !n.publicada).length
  const programadas = novedades.datos?.filter((n) => n.publicada && !esVisible(n)).length
  const categoriasActivas = categorias.datos?.filter((c) => c.activa).length
  const ultimaNovedad = visibles?.[0]

  // Texto chico abajo del número de novedades: "1 borrador · 1 programada".
  const detalleNovedades = [
    borradores && `${borradores} ${borradores === 1 ? 'borrador' : 'borradores'}`,
    programadas && `${programadas} ${programadas === 1 ? 'programada' : 'programadas'}`
  ].filter(Boolean).join(' · ')

  // Primer nombre en el saludo: "Hola, Admin".
  const primerNombre = usuario.nombre.split(' ')[0]

  return (
    <div className="admin-inicio">
      <div className="admin-inicio-encabezado">
        <div>
          <h1 className="panel-titulo">Hola, {primerNombre}</h1>
          <p className="panel-bajada">
            <span className="admin-inicio-fecha">{formatearHoy()}</span>. Esto es lo que tenés pendiente.
          </p>
        </div>
        <div className="admin-inicio-atajos">
          <Link to="/admin/productos/nuevo" className="boton">Nuevo producto</Link>
          <Link to="/admin/novedades/nueva" className="boton boton-secundario">Nueva novedad</Link>
        </div>
      </div>

      {fallado && (
        <ErrorCarga
          titulo="No pudimos cargar el resumen."
          onReintentar={() => pedidos.forEach((pedido) => pedido.error && pedido.reintentar())}
        />
      )}

      <ul className="admin-inicio-tarjetas">
        <Tarjeta
          ruta="/admin/consultas"
          numero={consultas.datos?.length}
          texto="Consultas sin responder"
          resaltada={consultas.datos?.length > 0}
        />
        <Tarjeta
          ruta="/admin/productos"
          numero={activos?.length}
          texto="Productos en el catálogo"
          detalle={destacados !== undefined && `${destacados} ${destacados === 1 ? 'destacado' : 'destacados'}`}
        />
        <Tarjeta
          ruta="/admin/novedades"
          numero={visibles?.length}
          texto="Novedades publicadas"
          detalle={detalleNovedades}
        />
        <Tarjeta ruta="/admin/categorias" numero={categoriasActivas} texto="Categorías activas" />
      </ul>

      <div className="admin-inicio-columnas">
        <section aria-labelledby="titulo-pendientes" className="admin-caja">
          <div className="admin-caja-encabezado">
            <h2 id="titulo-pendientes" className="admin-caja-titulo">Consultas sin responder</h2>
            <Link to="/admin/consultas" className="link-acento">Ver todas</Link>
          </div>
          <ConsultasPendientes pedido={consultas} />
        </section>

        <section aria-labelledby="titulo-ultima" className="admin-caja">
          <h2 id="titulo-ultima" className="admin-caja-titulo">Última novedad</h2>
          {novedades.cargando && <div className="esqueleto" style={{ aspectRatio: '16 / 9', marginTop: 16 }} />}
          {novedades.datos && !ultimaNovedad && (
            <p className="admin-vacio">Todavía no hay novedades publicadas.</p>
          )}
          {ultimaNovedad && (
            <div className="admin-ultima-novedad">
              <FotoNovedad novedad={ultimaNovedad} />
              <p className="admin-ultima-novedad-titulo">{ultimaNovedad.titulo}</p>
              <p className="admin-ultima-novedad-fecha">
                Publicada el {formatearFecha(ultimaNovedad.fechaPublicacion)}
              </p>
              <Link to={`/admin/novedades/${ultimaNovedad.id}`} className="boton boton-secundario">Editar</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

// Tarjeta con un número grande. Mientras carga, el número es una raya.
function Tarjeta({ ruta, numero, texto, detalle, resaltada = false }) {
  return (
    <li>
      <Link to={ruta} className={resaltada ? 'admin-tarjeta resaltada' : 'admin-tarjeta'}>
        <span className="admin-tarjeta-numero">{numero ?? '–'}</span>
        <span className="admin-tarjeta-texto">{texto}</span>
        {detalle && <span className="admin-tarjeta-detalle">{detalle}</span>}
      </Link>
    </li>
  )
}

// Las 5 consultas pendientes más nuevas.
function ConsultasPendientes({ pedido }) {
  if (pedido.cargando) {
    return (
      <div className="admin-lista-cargando">
        {[1, 2, 3].map((n) => <div key={n} className="esqueleto" style={{ height: 56 }} />)}
      </div>
    )
  }
  if (!pedido.datos) return null

  if (pedido.datos.length === 0) {
    return <p className="admin-vacio">No hay consultas pendientes. ¡Todo al día!</p>
  }

  return (
    <ul className="admin-pendientes">
      {pedido.datos.slice(0, 5).map((consulta) => (
        <li key={consulta.id}>
          <Link to={`/admin/consultas?id=${consulta.id}`} className="admin-pendiente">
            <span className="admin-pendiente-texto">
              <span className="admin-pendiente-asunto">{consulta.asunto}</span>
              <span className="admin-pendiente-extracto">
                {consulta.nombre}. {consulta.mensaje}
              </span>
            </span>
            <span className="admin-pendiente-cuando">{formatearHace(consulta.fecha)}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default AdminInicio