import { useState } from 'react'
import { Link, useOutletContext, useSearchParams } from 'react-router-dom'
import { usePedido } from '../../hooks/usePedido'
import { obtenerConsultas, cambiarEstadoConsulta, eliminarConsulta } from '../../services/consultas'
import ErrorCarga from '../../components/ErrorCarga'
import { formatearFechaHora, formatearHace } from '../../utils/formato'
import './AdminConsultas.css'

const PESTANAS = [
  { estado: 'pendiente', texto: 'Pendientes' },
  { estado: 'respondida', texto: 'Respondidas' },
  { estado: 'cerrada', texto: 'Cerradas' },
  { estado: 'todas', texto: 'Todas' }
]

const NOMBRE_ESTADO = { pendiente: 'Pendiente', respondida: 'Respondida', cerrada: 'Cerrada' }

// ============================================================
//  /admin/consultas — lista a la izquierda, detalle a la derecha.
//  Pestaña y consulta elegida viven en la URL:
//  /admin/consultas?estado=respondida&id=2
//  (sin ?estado se muestran las pendientes, que es lo que importa).
// ============================================================

function AdminConsultas() {
  const [parametros, setParametros] = useSearchParams()
  const pestana = parametros.get('estado') ?? 'pendiente'
  const idElegido = Number(parametros.get('id')) || null

  // Función que nos pasa LayoutAdmin para actualizar el numerito del menú.
  const { refrescarPendientes } = useOutletContext()

  // Pedimos TODAS una sola vez y filtramos acá: así sabemos cuántas hay
  // en cada pestaña sin hacer cuatro pedidos.
  const consultas = usePedido(obtenerConsultas)
  // Mientras se recarga (después de un cambio), seguimos mostrando las anteriores.
  const todas = consultas.datos ?? consultas.ultimosDatos

  const enPestana = (consulta) => pestana === 'todas' || consulta.estado === pestana
  const lista = todas ? todas.filter(enPestana) : []
  // La elegida se busca entre TODAS: si la pasás de pendiente a respondida,
  // sale de la lista de pendientes pero el detalle sigue a la vista.
  const elegida = todas?.find((c) => c.id === idElegido) ?? null

  function contar(estado) {
    if (!todas) return ''
    return todas.filter((c) => estado === 'todas' || c.estado === estado).length
  }

  function elegirPestana(estado) {
    // Al cambiar de pestaña se deselecciona la consulta.
    setParametros(estado === 'pendiente' ? {} : { estado })
  }

  function elegirConsulta(id) {
    setParametros((anteriores) => {
      const nuevos = new URLSearchParams(anteriores)
      nuevos.set('id', id)
      return nuevos
    })
  }

  // Después de cambiar un estado o eliminar: volvemos a pedir la lista y
  // el contador del menú. La verdad la tiene el backend; no "adivinamos"
  // cómo quedaron los datos.
  function actualizarTodo() {
    consultas.reintentar()
    refrescarPendientes()
  }

  function alEliminar() {
    setParametros((anteriores) => {
      const nuevos = new URLSearchParams(anteriores)
      nuevos.delete('id')
      return nuevos
    })
    actualizarTodo()
  }

  return (
    <div className="admin-consultas">
      <title>Consultas - Panel Dulce Ezeiza</title>

      <div>
        <h1 className="panel-titulo">Consultas</h1>
        <p className="panel-bajada">Lo que llega desde el formulario de Contacto. Respondé por mail y después marcala.</p>
      </div>

      <div role="group" aria-label="Filtrar por estado" className="consultas-pestanas">
        {PESTANAS.map(({ estado, texto }) => (
          <button
            key={estado}
            type="button"
            aria-pressed={pestana === estado}
            onClick={() => elegirPestana(estado)}
            className={pestana === estado ? 'consultas-pestana activa' : 'consultas-pestana'}
          >
            {texto} <span className="consultas-pestana-cantidad">({contar(estado)})</span>
          </button>
        ))}
      </div>

      {consultas.error && !todas && (
        <ErrorCarga titulo="No pudimos cargar las consultas." onReintentar={consultas.reintentar} />
      )}

      {(todas || consultas.cargando) && (
        <div className="consultas-columnas">
          <ListaConsultas
            cargando={!todas}
            lista={lista}
            idElegido={idElegido}
            onElegir={elegirConsulta}
          />

          {elegida ? (
            // key: al elegir otra consulta, el detalle arranca de cero (sin el
            // aviso, el error o la confirmación de borrado de la anterior).
            <DetalleConsulta
              key={elegida.id}
              consulta={elegida}
              onCambio={actualizarTodo}
              onEliminada={alEliminar}
            />
          ) : (
            <div className="consultas-sin-eleccion">
              {todas ? 'Elegí una consulta de la lista para ver el detalle.' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------- Lista ----------

function ListaConsultas({ cargando, lista, idElegido, onElegir }) {
  if (cargando) {
    return (
      <div className="consultas-lista" aria-busy="true" aria-label="Cargando consultas">
        {[1, 2, 3].map((n) => <div key={n} className="esqueleto" style={{ height: 96, margin: 8 }} />)}
      </div>
    )
  }

  if (lista.length === 0) {
    return <p className="consultas-lista consultas-lista-vacia">No hay consultas en este estado.</p>
  }

  return (
    <ul className="consultas-lista" aria-label="Consultas">
      {lista.map((consulta) => (
        <li key={consulta.id}>
          {/* Es un botón y no un link: no lleva a otra página, cambia qué
              se ve en el detalle. aria-current marca la que está abierta. */}
          <button
            type="button"
            onClick={() => onElegir(consulta.id)}
            aria-current={consulta.id === idElegido ? 'true' : undefined}
            className={consulta.id === idElegido ? 'consulta-item elegida' : 'consulta-item'}
          >
            <span className="consulta-item-fila">
              <span className="consulta-item-nombre">{consulta.nombre}</span>
              <span className="consulta-item-cuando">{formatearHace(consulta.fecha)}</span>
            </span>
            <span className="consulta-item-asunto">{consulta.asunto}</span>
            <span className="consulta-item-fila">
              <span className="consulta-item-mensaje">{consulta.mensaje}</span>
              <EtiquetaEstado estado={consulta.estado} />
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function EtiquetaEstado({ estado }) {
  return <span className={`estado-consulta estado-${estado}`}>{NOMBRE_ESTADO[estado]}</span>
}

// ---------- Detalle y acciones ----------

function DetalleConsulta({ consulta, onCambio, onEliminada }) {
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState(null)
  const [error, setError] = useState(null)
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false)

  // Las transiciones son libres (modelo de tickets): mostramos un botón
  // para cada estado distinto del actual, con un texto que diga qué hace.
  const acciones = {
    pendiente: [
      { estado: 'respondida', texto: 'Marcar como respondida' },
      { estado: 'cerrada', texto: 'Cerrar consulta' }
    ],
    respondida: [
      { estado: 'cerrada', texto: 'Cerrar consulta' },
      { estado: 'pendiente', texto: 'Volver a pendiente' }
    ],
    cerrada: [{ estado: 'pendiente', texto: 'Reabrir' }]
  }[consulta.estado]

  async function cambiarEstado(estado) {
    setOcupado(true)
    setError(null)
    setAviso(null)
    try {
      await cambiarEstadoConsulta(consulta.id, estado)
      setAviso(`Listo: quedó como ${NOMBRE_ESTADO[estado].toLowerCase()}.`)
      onCambio()
    } catch (e) {
      setError(e.message)
    } finally {
      // finally se ejecuta siempre, haya salido bien o mal.
      setOcupado(false)
    }
  }

  async function eliminar() {
    setOcupado(true)
    setError(null)
    try {
      await eliminarConsulta(consulta.id)
      onEliminada()
    } catch (e) {
      setError(e.message)
      setOcupado(false)
    }
  }

  return (
    <article aria-labelledby="titulo-consulta" className="consulta-detalle">
      <header className="consulta-detalle-encabezado">
        <div>
          <h2 id="titulo-consulta" className="consulta-detalle-asunto">{consulta.asunto}</h2>
          <p className="consulta-detalle-fecha">{formatearFechaHora(consulta.fecha)}</p>
        </div>
        <EtiquetaEstado estado={consulta.estado} />
      </header>

      <dl className="consulta-datos">
        <div>
          <dt>Nombre</dt>
          <dd>{consulta.nombre}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{consulta.email}</dd>
        </div>
        <div>
          <dt>Teléfono</dt>
          <dd>{consulta.telefono ?? 'No lo dejó'}</dd>
        </div>
      </dl>

      {/* pre-line: respeta los saltos de línea que escribió la persona. */}
      <p className="consulta-mensaje">{consulta.mensaje}</p>

      {consulta.productos.length > 0 && (
        <div className="consulta-productos">
          <p className="consulta-productos-titulo">Productos consultados</p>
          <ul>
            {consulta.productos.map((producto) => (
              <li key={producto.id}>
                <Link to={`/admin/productos/${producto.id}`}>{producto.nombre}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {aviso && <p role="status" className="consulta-aviso">{aviso}</p>}
      {error && <p role="alert" className="consulta-error">{error}</p>}

      {confirmandoBorrado ? (
        // Confirmación dentro de la página en vez de window.confirm():
        // se ve igual que el resto del panel y no bloquea el navegador.
        <div className="consulta-confirmar" role="group" aria-label="Confirmar eliminación">
          <p>¿Eliminar esta consulta? No se puede deshacer.</p>
          <div className="consulta-acciones">
            <button type="button" className="boton boton-peligro" onClick={eliminar} disabled={ocupado}>
              Sí, eliminar
            </button>
            <button type="button" className="boton boton-secundario" onClick={() => setConfirmandoBorrado(false)} disabled={ocupado}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="consulta-acciones">
          {/* mailto: abre el programa de mail de la compu con el mensaje
              armado. La respuesta NO se guarda en el sistema: por eso
              después hay que marcar la consulta a mano. */}
          <a href={armarMailto(consulta)} className="boton">Responder por mail</a>
          {acciones.map((accion) => (
            <button
              key={accion.estado}
              type="button"
              className="boton boton-secundario"
              onClick={() => cambiarEstado(accion.estado)}
              disabled={ocupado}
            >
              {accion.texto}
            </button>
          ))}
          <button type="button" className="consulta-eliminar" onClick={() => setConfirmandoBorrado(true)} disabled={ocupado}>
            Eliminar
          </button>
        </div>
      )}
    </article>
  )
}

// Arma el link mailto: con destinatario, asunto "Re: ..." y el mensaje
// original citado abajo, como hacen los programas de mail al responder.
// encodeURIComponent: espacios, tildes y saltos de línea no pueden ir
// "crudos" en un link.
function armarMailto(consulta) {
  const primerNombre = consulta.nombre.split(' ')[0]
  const citado = consulta.mensaje.split('\n').map((linea) => `> ${linea}`).join('\n')
  const cuerpo =
    `Hola ${primerNombre},\n\n\n\n` +
    `Saludos,\nDulce Ezeiza\n\n` +
    `---\nEl ${formatearFechaHora(consulta.fecha)} escribiste:\n${citado}`
  const asunto = `Re: ${consulta.asunto}`
  return `mailto:${consulta.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`
}

export default AdminConsultas