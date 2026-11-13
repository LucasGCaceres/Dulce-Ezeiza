import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePedido } from '../../hooks/usePedido'
import { obtenerTodasLasNovedades, crearNovedad, editarNovedad, esVisible } from '../../services/novedades'
import { obtenerProductosAdmin } from '../../services/productos'
import ErrorCarga from '../../components/ErrorCarga'
import FotoNovedad from '../../components/FotoNovedad'
import { FechaNovedad } from '../../components/TarjetaNovedad'
import EstadoNovedad from '../../components/admin/EstadoNovedad'
import Campo from '../../components/admin/Campo'
import { fechaParaInput, formatearFechaHora } from '../../utils/formato'
import { urlImagenValida } from '../../utils/urls'
import './AdminNovedadForm.css'

// Los mismos topes que valida Novedad.controller.js.
const LARGO = { titulo: 150, resumen: 300, contenido: 20000, imagenUrl: 500 }

// ============================================================
//  /admin/novedades/nueva  y  /admin/novedades/:id
// ============================================================

function AdminNovedadForm() {
  const { id } = useParams()
  const esNueva = id === undefined

  // El backend no tiene "GET una novedad" para el admin (el público da
  // 404 con los borradores), así que pedimos todas y buscamos la nuestra.
  const novedades = usePedido(obtenerTodasLasNovedades)
  const productos = usePedido(obtenerProductosAdmin)

  // ultimosDatos: mientras se vuelve a pedir (después de guardar), seguimos
  // usando la lista anterior. Si no, el formulario desaparecería un
  // instante y se perdería su estado (el aviso "Cambios guardados").
  const lista = novedades.datos ?? novedades.ultimosDatos
  const listaProductos = productos.datos ?? productos.ultimosDatos
  const novedad = esNueva ? null : lista?.find((n) => n.id === Number(id))

  if (novedades.error && !lista) {
    return <ErrorCarga titulo="No pudimos cargar la novedad." onReintentar={novedades.reintentar} />
  }
  if (!lista || !listaProductos) {
    return <div className="esqueleto" style={{ height: 520 }} aria-label="Cargando" />
  }
  if (!esNueva && !novedad) {
    return (
      <div className="novedad-form-vacio">
        <h1 className="panel-titulo">Esa novedad no existe</h1>
        <p className="panel-bajada">Puede que la hayan eliminado.</p>
        <Link to="/admin/novedades" className="boton">Volver a novedades</Link>
      </div>
    )
  }

  return (
    <FormularioNovedad
      key={id ?? 'nueva'}
      novedad={novedad}
      productos={listaProductos}
      onGuardada={novedades.reintentar}
    />
  )
}

function FormularioNovedad({ novedad, productos, onGuardada }) {
  const navigate = useNavigate()
  const esNueva = novedad === null

  const [valores, setValores] = useState(() => ({
    titulo: novedad?.titulo ?? '',
    resumen: novedad?.resumen ?? '',
    contenido: novedad?.contenido ?? '',
    imagenUrl: novedad?.imagenUrl ?? '',
    productoId: novedad?.productoId ? String(novedad.productoId) : '',
    // Una novedad nueva arranca como borrador, con la fecha de ahora.
    publicada: novedad?.publicada ?? false,
    fecha: fechaParaInput(novedad?.fechaPublicacion ?? new Date())
  }))
  const [intentoGuardar, setIntentoGuardar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState(null)

  function cambiar(evento) {
    const { name, value } = evento.target
    setValores((anteriores) => ({ ...anteriores, [name]: value }))
  }

  // ---------- Validación (se calcula en cada render) ----------
  const errores = {}
  if (intentoGuardar) {
    if (!valores.titulo.trim()) errores.titulo = 'Ponele un título.'
    if (!valores.resumen.trim()) errores.resumen = 'Escribí un resumen: es lo que se ve en las tarjetas.'
    if (!valores.contenido.trim()) errores.contenido = 'Escribí el texto de la novedad.'
    if (!valores.fecha) errores.fecha = 'Elegí una fecha.'
  }
  // La URL se revisa mientras escribís (si escribiste algo).
  if (valores.imagenUrl.trim() && !urlImagenValida(valores.imagenUrl.trim())) {
    errores.imagenUrl = 'Pegá una dirección que empiece con https:// (o /img/... si está en el sitio).'
  }

  // ---------- Cómo va a quedar ----------
  // "fecha" es el texto del input ("2026-11-20T10:00"); new Date() lo lee
  // como hora local, que es lo que el admin quiso decir.
  const fechaElegida = valores.fecha ? new Date(valores.fecha) : null
  const comoQueda = { publicada: valores.publicada, fechaPublicacion: fechaElegida ?? new Date() }
  const esFutura = fechaElegida && fechaElegida > new Date()

  async function guardar(evento) {
    evento.preventDefault()
    setIntentoGuardar(true)
    setAviso(null)

    const faltan = !valores.titulo.trim() || !valores.resumen.trim() || !valores.contenido.trim() || !valores.fecha
    if (faltan || errores.imagenUrl) {
      // Foco en el primer campo con problema, en el orden del formulario.
      const primero = ['titulo', 'resumen', 'contenido', 'imagenUrl', 'fecha'].find(
        (campo) => campo === 'imagenUrl' ? errores.imagenUrl : !valores[campo].trim()
      )
      document.getElementById(`novedad-${primero}`)?.focus()
      return
    }

    const datos = {
      titulo: valores.titulo.trim(),
      resumen: valores.resumen.trim(),
      contenido: valores.contenido.trim(),
      // null = "sin imagen" / "sin producto". Al editar, así se QUITAN.
      imagenUrl: valores.imagenUrl.trim() || null,
      productoId: valores.productoId ? Number(valores.productoId) : null,
      publicada: valores.publicada,
      // toISOString(): el backend espera un texto de fecha. Va en UTC
      // ("...T13:00:00.000Z" para las 10 de Argentina) y no se pierde nada.
      fechaPublicacion: fechaElegida.toISOString()
    }

    setGuardando(true)
    try {
      if (esNueva) {
        await crearNovedad(datos)
        navigate('/admin/novedades', { state: { aviso: `Se creó "${datos.titulo}".` } })
        return
      }
      await editarNovedad(novedad.id, datos)
      setAviso({ tipo: 'ok', texto: 'Cambios guardados.' })
      onGuardada()
    } catch (error) {
      // Si el backend mandó la lista de errores de validación, la sumamos.
      const detalle = error.errores?.length ? ` ${error.errores.join('. ')}.` : ''
      setAviso({ tipo: 'error', texto: error.message + detalle })
    } finally {
      setGuardando(false)
    }
  }

  // Productos para el desplegable: por nombre, y los desactivados marcados.
  const opcionesProducto = [...productos].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

  const titulo = esNueva ? 'Nueva novedad' : 'Editar novedad'

  return (
    <div className="novedad-form">
      <title>{`${titulo} - Panel Dulce Ezeiza`}</title>

      <nav aria-label="Ubicación" className="novedad-form-migas">
        <Link to="/admin/novedades">Novedades</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{esNueva ? 'Nueva' : novedad.titulo}</span>
      </nav>

      <div className="novedad-form-encabezado">
        <h1 className="panel-titulo">{titulo}</h1>
        {!esNueva && esVisible(novedad) && (
          <a href={`/novedades/${novedad.id}`} target="_blank" rel="noreferrer" className="link-acento">
            Ver en el sitio
          </a>
        )}
      </div>

      {aviso && (
        <div role={aviso.tipo === 'error' ? 'alert' : 'status'} className={`admin-aviso admin-aviso-${aviso.tipo}`}>
          <span>{aviso.texto}</span>
          <button type="button" onClick={() => setAviso(null)} aria-label="Cerrar aviso">×</button>
        </div>
      )}

      <form id="form-novedad" onSubmit={guardar} noValidate className="novedad-form-columnas">
        {/* ---------- Columna izquierda: el contenido ---------- */}
        <div className="admin-caja novedad-form-contenido">
          <h2 className="admin-caja-titulo">Contenido</h2>

          <Campo id="novedad-titulo" id="titulo" etiqueta="Título" error={errores.titulo}>
            <input type="text" maxLength={LARGO.titulo} name="titulo" value={valores.titulo} onChange={cambiar} />
          </Campo>

          <Campo id="novedad-resumen" id="resumen" etiqueta="Resumen" error={errores.resumen}
            ayuda={`Una o dos líneas: es lo que se ve en las tarjetas. ${valores.resumen.length} / ${LARGO.resumen}`}>
            <textarea rows={2} maxLength={LARGO.resumen} name="resumen" value={valores.resumen} onChange={cambiar} />
          </Campo>

          <Campo id="novedad-contenido" id="contenido" etiqueta="Texto completo" error={errores.contenido}
            ayuda="Cada renglón es un párrafo en el sitio.">
            <textarea rows={10} maxLength={LARGO.contenido} name="contenido" value={valores.contenido} onChange={cambiar} />
          </Campo>

          <Campo id="novedad-imagenUrl" id="imagenUrl" etiqueta="Imagen" opcional error={errores.imagenUrl}
            ayuda="Dirección de la imagen (https://... o /img/...). Sin imagen se muestra un recuadro con el nombre del local.">
            <input type="url" maxLength={LARGO.imagenUrl} name="imagenUrl" value={valores.imagenUrl} onChange={cambiar}
              placeholder="https://..." />
          </Campo>

          <Campo id="novedad-productoId" id="productoId" etiqueta="Producto relacionado" opcional
            ayuda="Si elegís uno, el detalle de la novedad muestra un botón para verlo.">
            <select name="productoId" value={valores.productoId} onChange={cambiar}>
              <option value="">Ninguno</option>
              {opcionesProducto.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}{p.activo ? '' : ' (desactivado)'}</option>
              ))}
            </select>
          </Campo>
        </div>

        {/* ---------- Columna derecha: publicación y vista previa ---------- */}
        <div className="novedad-form-lateral">
          <fieldset className="admin-caja novedad-form-publicacion">
            <legend className="admin-caja-titulo">Publicación</legend>

            <label className="novedad-form-opcion">
              <input type="radio" name="publicada" checked={!valores.publicada}
                onChange={() => setValores((v) => ({ ...v, publicada: false }))} />
              <span>
                <span className="novedad-form-opcion-titulo">Borrador</span>
                <span className="campo-ayuda">No se ve en el sitio. Para ir armándola tranquilo.</span>
              </span>
            </label>
            <label className="novedad-form-opcion">
              <input type="radio" name="publicada" checked={valores.publicada}
                onChange={() => setValores((v) => ({ ...v, publicada: true }))} />
              <span>
                <span className="novedad-form-opcion-titulo">Publicada</span>
                <span className="campo-ayuda">Se ve en el sitio a partir de la fecha de abajo.</span>
              </span>
            </label>

            <Campo id="novedad-fecha" etiqueta="Fecha de publicación" error={errores.fecha}>
              <input type="datetime-local" name="fecha" value={valores.fecha} onChange={cambiar} />
            </Campo>
            <button type="button" className="novedad-form-ahora"
              onClick={() => setValores((v) => ({ ...v, fecha: fechaParaInput(new Date()) }))}>
              Usar la fecha y hora de ahora
            </button>

            {/* Resumen en palabras de lo que va a pasar al guardar. */}
            <p className="novedad-form-resultado" aria-live="polite">
              {!valores.publicada
                ? 'Al guardar queda como borrador.'
                : esFutura
                  ? `Al guardar queda programada: aparece sola el ${formatearFechaHora(fechaElegida)}.`
                  : 'Al guardar se ve en el sitio enseguida.'}
            </p>
            {fechaElegida && <EstadoNovedad novedad={comoQueda} />}
          </fieldset>

          {/* Vista previa: la tarjeta como la va a ver un cliente. */}
          <section aria-labelledby="titulo-vista-previa" className="admin-caja novedad-form-previa">
            <h2 id="titulo-vista-previa" className="admin-caja-titulo">Vista previa</h2>
            <div className="novedad-tarjeta">
              <FotoNovedad novedad={{ imagenUrl: errores.imagenUrl ? '' : valores.imagenUrl.trim() }} />
              {fechaElegida && <FechaNovedad iso={fechaElegida.toISOString()} />}
              <span className="novedad-tarjeta-titulo">{valores.titulo || 'Título de la novedad'}</span>
              <span className="novedad-resumen">{valores.resumen || 'Acá va el resumen.'}</span>
            </div>
          </section>
        </div>
      </form>

      <div className="novedad-form-botones">
        <Link to="/admin/novedades" className="boton boton-secundario">
          {esNueva ? 'Cancelar' : 'Volver a novedades'}
        </Link>
        <button type="submit" form="form-novedad" className="boton" disabled={guardando}>
          {guardando ? 'Guardando...' : esNueva ? 'Crear novedad' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}

export default AdminNovedadForm