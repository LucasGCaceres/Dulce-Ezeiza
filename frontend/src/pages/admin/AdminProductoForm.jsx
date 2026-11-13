import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePedido } from '../../hooks/usePedido'
import {
  obtenerProductoAdmin, crearProducto, editarProducto,
  agregarImagenes, eliminarImagenes, reordenarImagenes
} from '../../services/productos'
import { obtenerCategoriasAdmin } from '../../services/categorias'
import ErrorCarga from '../../components/ErrorCarga'
import ImagenesProducto from '../../components/admin/ImagenesProducto'
import './AdminProductoForm.css'

// Mismos largos que las columnas de la tabla Productos en la base.
const LARGO = { nombre: 150, descripcion: 1000 }

const OPCIONES = [
  {
    campo: 'activo',
    titulo: 'Visible en el sitio',
    ayuda: 'Si lo desactivás, deja de aparecer en el catálogo. Las consultas que lo mencionan se conservan.'
  },
  {
    campo: 'disponible',
    titulo: 'Disponible por ahora',
    ayuda: 'Si lo apagás, sigue a la vista pero con el aviso "No disponible por ahora".'
  },
  {
    campo: 'destacado',
    titulo: 'Destacado en el inicio',
    ayuda: 'Aparece en "Especialidades de la casa".'
  },
  {
    campo: 'sinGluten',
    titulo: 'Apto celíacos (sin TACC)',
    ayuda: 'Lleva la etiqueta "Sin TACC" y aparece en ese filtro del catálogo.'
  }
]

// ============================================================
//  /admin/productos/nuevo  y  /admin/productos/:id
//  El mismo formulario sirve para crear y para editar.
// ============================================================

function AdminProductoForm() {
  const { id } = useParams()   // en /admin/productos/nuevo no hay id
  const esNuevo = id === undefined

  const categorias = usePedido(obtenerCategoriasAdmin)
  // Si es nuevo no hay nada que pedir: Promise.resolve(null) es una
  // promesa que "ya terminó" con null, para que usePedido funcione igual.
  const pedidoProducto = usePedido(() => (esNuevo ? Promise.resolve(null) : obtenerProductoAdmin(id)), [id])
  const producto = pedidoProducto.datos ?? pedidoProducto.ultimosDatos

  if (pedidoProducto.error?.status === 404) {
    return (
      <div className="producto-form-vacio">
        <h1 className="panel-titulo">Ese producto no existe</h1>
        <p className="panel-bajada">Puede que lo hayan eliminado.</p>
        <Link to="/admin/productos" className="boton">Volver a productos</Link>
      </div>
    )
  }

  if (pedidoProducto.error && !producto) {
    return <ErrorCarga titulo="No pudimos cargar el producto." onReintentar={pedidoProducto.reintentar} />
  }

  // El formulario se dibuja recién cuando tenemos los datos: así puede
  // arrancar su useState con los valores del producto. (Si se dibujara
  // antes, arrancaría vacío y habría que "rellenarlo" después.)
  const listo = categorias.datos && (esNuevo || producto)
  if (!listo) return <div className="esqueleto" style={{ height: 480 }} aria-label="Cargando" />

  return (
    <FormularioProducto
      // key: si pasás de un producto a otro, el formulario arranca de cero.
      key={id ?? 'nuevo'}
      producto={producto}
      categorias={categorias.datos}
      onImagenesCambiaron={pedidoProducto.reintentar}
    />
  )
}

function FormularioProducto({ producto, categorias, onImagenesCambiaron }) {
  const navigate = useNavigate()
  const esNuevo = producto === null

  const [valores, setValores] = useState(() => ({
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    categoriaId: producto ? String(producto.categoriaId) : '',
    activo: producto?.activo ?? true,
    disponible: producto?.disponible ?? true,
    destacado: producto?.destacado ?? false,
    sinGluten: producto?.sinGluten ?? false
  }))
  const [intentoGuardar, setIntentoGuardar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState(null)

  // Imágenes de un producto NUEVO: todavía no existe en la base, así que
  // se guardan acá y viajan todas juntas en el POST de creación.
  const [imagenesNuevas, setImagenesNuevas] = useState([])

  const errores = {}
  if (intentoGuardar) {
    if (!valores.nombre.trim()) errores.nombre = 'Ponele un nombre.'
    if (!valores.categoriaId) errores.categoriaId = 'Elegí una categoría.'
  }

  function cambiarTexto(evento) {
    const { name, value } = evento.target
    setValores((anteriores) => ({ ...anteriores, [name]: value }))
  }

  function cambiarOpcion(campo) {
    setValores((anteriores) => ({ ...anteriores, [campo]: !anteriores[campo] }))
  }

  async function guardar(evento) {
    evento.preventDefault()
    setIntentoGuardar(true)
    setAviso(null)
    if (!valores.nombre.trim() || !valores.categoriaId) {
      document.getElementById(!valores.nombre.trim() ? 'nombre' : 'categoriaId')?.focus()
      return
    }

    const datos = {
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim(),
      categoriaId: Number(valores.categoriaId),
      activo: valores.activo,
      disponible: valores.disponible,
      destacado: valores.destacado,
      sinGluten: valores.sinGluten
    }

    setGuardando(true)
    try {
      if (esNuevo) {
        await crearProducto({ ...datos, imagenes: imagenesNuevas.map((i) => i.url) })
        // El aviso viaja en el "state" de la navegación y lo muestra el listado.
        navigate('/admin/productos', { state: { aviso: `Se creó "${datos.nombre}".` } })
        return
      }
      await editarProducto(producto.id, datos)
      setAviso({ tipo: 'ok', texto: 'Cambios guardados.' })
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message })
    } finally {
      setGuardando(false)
    }
  }

  // ---------- Imágenes: qué hacer en cada caso ----------
  // Producto nuevo: se modifica la lista local.
  // Producto existente: cada cambio va al backend y después se vuelve a
  // pedir el producto (la lista que se ve es la que tiene la base).
  const imagenes = esNuevo ? imagenesNuevas : producto.imagenes

  const accionesImagenes = esNuevo
    ? {
        agregar: async (url) => {
          // id provisorio (negativo, para que no choque con uno real).
          setImagenesNuevas((anteriores) => [...anteriores, { id: -Date.now(), url }])
        },
        quitar: async (imagen) => {
          setImagenesNuevas((anteriores) => anteriores.filter((i) => i.id !== imagen.id))
        },
        reordenar: async (nuevaLista) => {
          setImagenesNuevas(nuevaLista)
        }
      }
    : {
        agregar: async (url) => {
          await agregarImagenes(producto.id, [url])
          onImagenesCambiaron()
        },
        quitar: async (imagen) => {
          await eliminarImagenes(producto.id, [imagen.id])
          onImagenesCambiaron()
        },
        reordenar: async (nuevaLista) => {
          await reordenarImagenes(producto.id, nuevaLista.map((i) => i.id))
          onImagenesCambiaron()
        }
      }

  const titulo = esNuevo ? 'Nuevo producto' : 'Editar producto'

  return (
    <div className="producto-form">
      <title>{`${titulo} - Panel Dulce Ezeiza`}</title>

      <nav aria-label="Ubicación" className="producto-form-migas">
        <Link to="/admin/productos">Productos</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{esNuevo ? 'Nuevo' : producto.nombre}</span>
      </nav>

      <div className="producto-form-encabezado">
        <h1 className="panel-titulo">{titulo}</h1>
        {!esNuevo && producto.activo && (
          <a href={`/productos/${producto.id}`} target="_blank" rel="noreferrer" className="link-acento">
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

      <div className="producto-form-columnas">
        <form id="form-producto" onSubmit={guardar} noValidate className="admin-caja producto-form-datos">
          <h2 className="admin-caja-titulo">Datos</h2>

          <div className="campo">
            <label htmlFor="nombre" className="campo-etiqueta">Nombre</label>
            <input id="nombre" name="nombre" type="text" maxLength={LARGO.nombre}
              value={valores.nombre} onChange={cambiarTexto}
              className={errores.nombre ? 'campo-control con-error' : 'campo-control'}
              aria-invalid={errores.nombre ? true : undefined}
              aria-describedby={errores.nombre ? 'nombre-error' : undefined} />
            {errores.nombre && <span id="nombre-error" className="campo-error">{errores.nombre}</span>}
          </div>

          <div className="campo">
            <label htmlFor="descripcion" className="campo-etiqueta">
              Descripción <span className="campo-opcional">(opcional)</span>
            </label>
            <textarea id="descripcion" name="descripcion" rows={3} maxLength={LARGO.descripcion}
              value={valores.descripcion} onChange={cambiarTexto} className="campo-control"
              aria-describedby="descripcion-ayuda" />
            <span id="descripcion-ayuda" className="campo-ayuda">
              {valores.descripcion.length} / {LARGO.descripcion}
            </span>
          </div>

          <div className="campo">
            <label htmlFor="categoriaId" className="campo-etiqueta">Categoría</label>
            <select id="categoriaId" name="categoriaId" value={valores.categoriaId} onChange={cambiarTexto}
              className={errores.categoriaId ? 'campo-control con-error' : 'campo-control'}
              aria-invalid={errores.categoriaId ? true : undefined}
              aria-describedby={errores.categoriaId ? 'categoria-error' : undefined}>
              <option value="">Elegí una...</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}{c.activa ? '' : ' (desactivada)'}</option>
              ))}
            </select>
            {errores.categoriaId && <span id="categoria-error" className="campo-error">{errores.categoriaId}</span>}
          </div>

          {/* fieldset + legend: agrupa los checkboxes bajo un título que el
              lector de pantalla lee antes de cada opción. */}
          <fieldset className="producto-form-opciones">
            <legend className="campo-etiqueta">Opciones</legend>
            {OPCIONES.map((opcion) => (
              <label key={opcion.campo} className="producto-form-opcion">
                <input type="checkbox" checked={valores[opcion.campo]} onChange={() => cambiarOpcion(opcion.campo)} />
                <span>
                  <span className="producto-form-opcion-titulo">{opcion.titulo}</span>
                  <span className="campo-ayuda">{opcion.ayuda}</span>
                </span>
              </label>
            ))}
          </fieldset>
        </form>

        <ImagenesProducto
          imagenes={imagenes}
          acciones={accionesImagenes}
          seGuardanAlInstante={!esNuevo}
        />
      </div>

      <div className="producto-form-botones">
        <Link to="/admin/productos" className="boton boton-secundario">
          {esNuevo ? 'Cancelar' : 'Volver a productos'}
        </Link>
        {/* form="form-producto": este botón está fuera del <form>, pero lo
            envía igual (los inputs de imágenes no son parte del formulario). */}
        <button type="submit" form="form-producto" className="boton" disabled={guardando}>
          {guardando ? 'Guardando...' : esNuevo ? 'Crear producto' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}

export default AdminProductoForm