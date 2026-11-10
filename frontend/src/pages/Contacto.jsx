import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePedido } from '../hooks/usePedido'
import { obtenerProductos } from '../services/productos'
import { obtenerComercio } from '../services/comercio'
import { enviarConsulta } from '../services/consultas'
import { validarConsulta, LARGO_MAXIMO, MAXIMO_PRODUCTOS } from '../utils/validarConsulta'
import FotoProducto from '../components/FotoProducto'
import './Contacto.css'

const FORMULARIO_VACIO = { nombre: '', email: '', telefono: '', asunto: '', mensaje: '' }

// ============================================================
//  Contacto: /contacto (o /contacto?productoId=5 desde un producto)
// ============================================================

function Contacto() {
  const [parametros] = useSearchParams()

  // Los textos del formulario, todos en un solo objeto.
  const [valores, setValores] = useState(FORMULARIO_VACIO)

  // Productos elegidos. Si se llegó desde "Consultar por este producto",
  // arranca con ese. La función adentro de useState se ejecuta UNA sola
  // vez, al montar la página (se llama "inicialización perezosa").
  const [productoIds, setProductoIds] = useState(() => {
    const id = Number(parametros.get('productoId'))
    return Number.isInteger(id) && id > 0 ? [id] : []
  })

  // 'editando' | 'enviando' | 'enviado'
  const [estado, setEstado] = useState('editando')
  // Los errores se muestran recién después del primer intento de envío:
  // no tiene sentido marcar "el nombre es obligatorio" a alguien que
  // todavía no empezó a escribir.
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  // Error que devolvió la API (un ErrorApi), si lo hubo.
  const [errorServidor, setErrorServidor] = useState(null)

  const productos = usePedido(obtenerProductos)
  const comercio = usePedido(obtenerComercio)

  // Los errores NO se guardan en un estado: se calculan a partir de los
  // valores en cada render. Así nunca pueden quedar desactualizados.
  const errores = intentoEnviar ? validarConsulta(valores) : {}

  // Productos elegidos con sus datos completos (para mostrar el nombre).
  // Si el id de la URL no existe (?productoId=999), simplemente no aparece.
  const seleccionados = productos.datos
    ? productoIds.map((id) => productos.datos.find((p) => p.id === id)).filter(Boolean)
    : []

  // Un solo manejador para todos los campos: usa el atributo "name"
  // del input para saber cuál actualizar.
  function alCambiar(evento) {
    const { name, value } = evento.target
    setValores((anteriores) => ({ ...anteriores, [name]: value }))
  }

  function agregarProducto(evento) {
    const id = Number(evento.target.value)
    if (id) setProductoIds((anteriores) => [...anteriores, id])
  }

  function quitarProducto(id) {
    setProductoIds((anteriores) => anteriores.filter((elegido) => elegido !== id))
  }

  async function alEnviar(evento) {
    evento.preventDefault()
    setIntentoEnviar(true)

    // Si hay errores, no se manda nada y el cursor va al primer campo con
    // problemas (así quien usa teclado o lector de pantalla llega directo).
    const encontrados = Object.keys(validarConsulta(valores))
    if (encontrados.length > 0) {
      document.getElementById(encontrados[0])?.focus()
      return
    }

    setEstado('enviando')
    setErrorServidor(null)
    try {
      await enviarConsulta({
        nombre: valores.nombre.trim(),
        email: valores.email.trim(),
        telefono: valores.telefono.trim(),
        asunto: valores.asunto.trim(),
        mensaje: valores.mensaje.trim(),
        // Solo los ids de productos que existen: si llegó un ?productoId=999,
        // no lo mandamos, porque el backend rechazaría toda la consulta.
        productoIds: productos.datos ? seleccionados.map((p) => p.id) : productoIds
      })
      setEstado('enviado')
    } catch (error) {
      setErrorServidor(error)
      setEstado('editando')
    }
  }

  // Después de enviar, "Enviar otra consulta" limpia el formulario pero
  // conserva nombre, email y teléfono: es la misma persona.
  function otraConsulta() {
    setValores((anteriores) => ({ ...anteriores, asunto: '', mensaje: '' }))
    setProductoIds([])
    setIntentoEnviar(false)
    setEstado('editando')
  }

  return (
    <div className="contenedor contacto">
      <title>Contacto - Dulce Ezeiza</title>

      <h1 className="contacto-titulo">Hacé tu consulta</h1>
      <p className="contacto-bajada">
        Encargos, dudas sobre un producto o lo que necesites. Te respondemos por mail.
      </p>

      <div className="contacto-columnas">
        <div className="contacto-caja">
          {estado === 'enviado' ? (
            <div role="status" className="contacto-enviado">
              <p className="contacto-enviado-titulo">
                ¡Listo, {valores.nombre.trim().split(' ')[0]}! Recibimos tu consulta.
              </p>
              <p>
                Te vamos a responder a <strong>{valores.email.trim()}</strong> lo antes posible.
              </p>
              <div>
                <button type="button" className="boton boton-secundario" onClick={otraConsulta}>
                  Enviar otra consulta
                </button>
              </div>
            </div>
          ) : (
            // noValidate: apaga los globitos de error del navegador, porque
            // mostramos los nuestros (más claros y con el estilo del sitio).
            <form onSubmit={alEnviar} noValidate className="contacto-formulario">
              {errorServidor && <ErrorServidor error={errorServidor} />}

              <div className="contacto-fila">
                <Campo id="nombre" etiqueta="Nombre" error={errores.nombre}>
                  <input id="nombre" name="nombre" type="text" autoComplete="name"
                    value={valores.nombre} onChange={alCambiar} maxLength={LARGO_MAXIMO.nombre}
                    {...propsDeError('nombre', errores)} />
                </Campo>
                <Campo id="email" etiqueta="Email" error={errores.email}>
                  <input id="email" name="email" type="email" autoComplete="email"
                    value={valores.email} onChange={alCambiar} maxLength={LARGO_MAXIMO.email}
                    {...propsDeError('email', errores)} />
                </Campo>
              </div>

              <Campo id="telefono" etiqueta="Teléfono" opcional error={errores.telefono}>
                <input id="telefono" name="telefono" type="tel" autoComplete="tel"
                  value={valores.telefono} onChange={alCambiar} maxLength={LARGO_MAXIMO.telefono}
                  {...propsDeError('telefono', errores)} />
              </Campo>

              <SelectorProductos
                productos={productos.datos}
                seleccionados={seleccionados}
                onAgregar={agregarProducto}
                onQuitar={quitarProducto}
              />

              <Campo id="asunto" etiqueta="Asunto" error={errores.asunto}>
                <input id="asunto" name="asunto" type="text" placeholder="Ej.: Torta para 20 personas"
                  value={valores.asunto} onChange={alCambiar} maxLength={LARGO_MAXIMO.asunto}
                  {...propsDeError('asunto', errores)} />
              </Campo>

              <Campo
                id="mensaje"
                etiqueta="Mensaje"
                error={errores.mensaje}
                ayuda={`Contanos para cuándo y para cuántas personas. ${valores.mensaje.length} / ${LARGO_MAXIMO.mensaje}`}
              >
                <textarea id="mensaje" name="mensaje" rows={6}
                  value={valores.mensaje} onChange={alCambiar} maxLength={LARGO_MAXIMO.mensaje}
                  {...propsDeError('mensaje', errores, true)} />
              </Campo>

              <div>
                <button type="submit" className="boton contacto-enviar" disabled={estado === 'enviando'}>
                  {estado === 'enviando' ? 'Enviando...' : 'Enviar consulta'}
                </button>
              </div>
            </form>
          )}
        </div>

        <DatosDelLocal comercio={comercio.datos} />
      </div>
    </div>
  )
}

// Atributos de accesibilidad de un campo según tenga error o no.
// aria-invalid hace que el lector de pantalla diga "inválido", y
// aria-describedby le hace leer el mensaje de error (y la ayuda).
function propsDeError(id, errores, tieneAyuda = false) {
  const descripciones = []
  if (tieneAyuda) descripciones.push(`${id}-ayuda`)
  if (errores[id]) descripciones.push(`${id}-error`)
  return {
    className: errores[id] ? 'campo-control con-error' : 'campo-control',
    'aria-invalid': errores[id] ? true : undefined,
    'aria-describedby': descripciones.length > 0 ? descripciones.join(' ') : undefined
  }
}

// Envoltorio de un campo: etiqueta arriba, el input (children) en el
// medio y la ayuda o el error abajo. Así no repetimos esa estructura
// en cada campo del formulario.
function Campo({ id, etiqueta, opcional = false, ayuda, error, children }) {
  return (
    <div className="campo">
      <label htmlFor={id} className="campo-etiqueta">
        {etiqueta} {opcional && <span className="campo-opcional">(opcional)</span>}
      </label>
      {children}
      {ayuda && <span id={`${id}-ayuda`} className="campo-ayuda">{ayuda}</span>}
      {error && <span id={`${id}-error`} className="campo-error">{error}</span>}
    </div>
  )
}

// Elegir productos: un <select> para agregar y una lista de los elegidos
// con un botón para quitar cada uno. El backend acepta hasta 10.
function SelectorProductos({ productos, seleccionados, onAgregar, onQuitar }) {
  const lleno = seleccionados.length >= MAXIMO_PRODUCTOS
  const elegidosIds = seleccionados.map((p) => p.id)
  const disponibles = productos ? productos.filter((p) => !elegidosIds.includes(p.id)) : []

  // Agrupamos las opciones por categoría para el <optgroup>.
  const porCategoria = {}
  for (const producto of disponibles) {
    const categoria = producto.Categorium?.nombre ?? 'Otros'
    if (!porCategoria[categoria]) porCategoria[categoria] = []
    porCategoria[categoria].push(producto)
  }

  return (
    <div className="campo">
      <label htmlFor="producto" className="campo-etiqueta">
        ¿Es por algún producto? <span className="campo-opcional">(opcional)</span>
      </label>

      {seleccionados.length > 0 && (
        <ul className="contacto-elegidos" aria-label="Productos elegidos">
          {seleccionados.map((producto) => (
            <li key={producto.id} className="contacto-elegido">
              <FotoProducto producto={producto} className="contacto-elegido-foto" />
              <span className="contacto-elegido-nombre">{producto.nombre}</span>
              <button
                type="button"
                className="contacto-quitar"
                onClick={() => onQuitar(producto.id)}
                aria-label={`Quitar ${producto.nombre}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* value="" siempre: después de elegir, el select vuelve a mostrar
          el texto de ayuda y el producto pasa a la lista de arriba. */}
      <select id="producto" className="campo-control" value="" onChange={onAgregar} disabled={!productos || lleno}>
        <option value="">
          {!productos ? 'Cargando productos...' : seleccionados.length > 0 ? 'Agregar otro producto...' : 'Ninguno en particular'}
        </option>
        {Object.entries(porCategoria).map(([categoria, lista]) => (
          <optgroup key={categoria} label={categoria}>
            {lista.map((producto) => (
              <option key={producto.id} value={producto.id}>{producto.nombre}</option>
            ))}
          </optgroup>
        ))}
      </select>

      {lleno && <span className="campo-ayuda">Podés elegir hasta {MAXIMO_PRODUCTOS} productos por consulta.</span>}
    </div>
  )
}

// Caja con el error que devolvió la API al enviar.
function ErrorServidor({ error }) {
  // 400 con lista de errores de validación: los mostramos todos.
  // (El formulario ya valida lo mismo, así que esto solo aparecería si
  // las reglas del frontend y del backend se desincronizan.)
  const hayLista = error.errores && error.errores.length > 0

  return (
    <div role="alert" className="contacto-error-servidor">
      <p className="contacto-error-servidor-titulo">
        {hayLista ? 'Revisá estos datos:' : 'No pudimos enviar tu consulta.'}
      </p>
      {hayLista ? (
        <ul>
          {error.errores.map((texto) => <li key={texto}>{texto}</li>)}
        </ul>
      ) : (
        <p>{error.message}</p>
      )}
    </div>
  )
}

// Columna derecha: foto del local y datos de GET /api/comercio.
function DatosDelLocal({ comercio }) {
  return (
    <aside className="contacto-local" aria-label="Datos del local">
      <img src="/img/sitio/fachada.svg" alt="Fachada del local de Dulce Ezeiza" className="contacto-local-foto" />

      {comercio && (
        <>
          <dl className="contacto-datos">
            {comercio.direccion && (
              <div>
                <dt>Dirección</dt>
                <dd>{comercio.direccion}</dd>
              </div>
            )}
            {comercio.horarios && (
              <div>
                <dt>Horarios</dt>
                <dd className="contacto-horarios">{comercio.horarios}</dd>
              </div>
            )}
            {comercio.telefono && (
              <div>
                <dt>Teléfono</dt>
                <dd>
                  <a href={`tel:${comercio.telefono.replace(/[^\d+]/g, '')}`}>{comercio.telefono}</a>
                </dd>
              </div>
            )}
          </dl>

          {comercio.direccion && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(comercio.direccion)}`}
              target="_blank"
              rel="noreferrer"
              className="boton boton-secundario contacto-como-llegar"
            >
              Cómo llegar
            </a>
          )}
        </>
      )}
    </aside>
  )
}

export default Contacto