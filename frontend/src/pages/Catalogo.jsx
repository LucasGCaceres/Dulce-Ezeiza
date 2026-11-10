import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { usePedido } from '../hooks/usePedido'
import { obtenerProductos } from '../services/productos'
import { obtenerCategorias } from '../services/categorias'
import FotoProducto from '../components/FotoProducto'
import ErrorCarga from '../components/ErrorCarga'
import './Catalogo.css'

// Cuánto esperar después de la última tecla antes de buscar.
const DEMORA_BUSQUEDA = 350

// ============================================================
//  Catálogo. Los filtros NO se guardan en un useState: viven en la
//  URL (/catalogo?categoriaId=3&sinGluten=true&busqueda=pan).
//  Así funcionan los links desde Inicio, el botón "atrás" del
//  navegador y un link compartido abre el catálogo ya filtrado.
// ============================================================

function Catalogo() {
  const [parametros, setParametros] = useSearchParams()
  const busqueda = parametros.get('busqueda') ?? ''
  const categoriaId = parametros.get('categoriaId') ?? ''
  const sinGluten = parametros.get('sinGluten') === 'true'
  const hayFiltros = busqueda !== '' || categoriaId !== '' || sinGluten

  // Cada vez que cambia un filtro de la URL, se vuelve a pedir.
  const productos = usePedido(
    () => obtenerProductos({ busqueda: busqueda.trim(), categoriaId, sinGluten }),
    [busqueda, categoriaId, sinGluten]
  )
  const categorias = usePedido(obtenerCategorias)

  // ---------- Buscador ----------
  // El input tiene su propio estado (texto) para responder al instante,
  // y la URL se actualiza recién cuando el usuario deja de escribir.
  // Si no, cada tecla haría un pedido a la API.
  const [texto, setTexto] = useState(busqueda)
  const temporizador = useRef(null)

  // Si la búsqueda de la URL cambia por otro motivo (botón "atrás" del
  // navegador, "Limpiar filtros"), el input se pone al día. Se hace
  // durante el render y no en un useEffect: es la forma que recomienda
  // React para "ajustar un estado cuando cambia un dato".
  const [busquedaAnterior, setBusquedaAnterior] = useState(busqueda)
  if (busqueda !== busquedaAnterior) {
    setBusquedaAnterior(busqueda)
    setTexto(busqueda)
  }

  // Si el usuario se va de la página con una búsqueda pendiente, se cancela.
  useEffect(() => () => clearTimeout(temporizador.current), [])

  // Cambia (o borra) un parámetro de la URL sin tocar los demás.
  // reemplazar: true no agrega una entrada al historial; lo usamos para
  // el buscador, así "atrás" no recorre letra por letra lo que se tipeó.
  function cambiarFiltro(nombre, valor, { reemplazar = false } = {}) {
    setParametros(
      (anteriores) => {
        const nuevos = new URLSearchParams(anteriores)
        if (valor) nuevos.set(nombre, valor)
        else nuevos.delete(nombre)
        return nuevos
      },
      { replace: reemplazar }
    )
  }

  function alEscribir(evento) {
    const valor = evento.target.value
    setTexto(valor)
    // "Debounce": cada tecla cancela el temporizador anterior y arranca
    // uno nuevo. Solo se busca cuando pasan 350 ms sin escribir.
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => {
      cambiarFiltro('busqueda', valor, { reemplazar: true })
    }, DEMORA_BUSQUEDA)
  }

  // Enter busca en el momento, sin esperar el temporizador.
  function alEnviar(evento) {
    evento.preventDefault()   // un <form> recargaría la página
    clearTimeout(temporizador.current)
    cambiarFiltro('busqueda', texto, { reemplazar: true })
  }

  function limpiarFiltros() {
    clearTimeout(temporizador.current)
    setTexto('')
    setParametros({})
  }

  // ---------- Qué mostrar ----------
  // Mientras llegan los resultados de un filtro nuevo, seguimos mostrando
  // los anteriores (atenuados) en vez de vaciar la grilla: así la página
  // no "parpadea" con cada clic. Los esqueletos son solo para la primera carga.
  const lista = productos.cargando ? productos.ultimosDatos : productos.datos
  const nombreCategoria = categorias.datos?.find((c) => String(c.id) === categoriaId)?.nombre

  let resumen = ''
  if (lista && !productos.error) {
    resumen = `${lista.length} ${lista.length === 1 ? 'producto' : 'productos'}`
    if (nombreCategoria) resumen += ` en ${nombreCategoria}`
  }

  return (
    <div className="contenedor catalogo">
      <h1 className="catalogo-titulo">Catálogo</h1>
      <p className="catalogo-bajada">
        Todo lo que horneamos en el local. Para encargos o si buscás algo que no está, hacenos una consulta.
      </p>

      <form role="search" className="catalogo-filtros" onSubmit={alEnviar}>
        <div className="catalogo-filtros-fila">
          <div className="catalogo-campo-busqueda">
            <label htmlFor="buscar">Buscar un producto</label>
            <input
              id="buscar"
              type="search"
              value={texto}
              onChange={alEscribir}
              placeholder="Ej.: medialunas, torta, pan"
              className="catalogo-input"
            />
          </div>

          <label className="catalogo-check">
            <input
              type="checkbox"
              checked={sinGluten}
              onChange={(e) => cambiarFiltro('sinGluten', e.target.checked ? 'true' : '')}
            />
            Solo sin TACC
          </label>
        </div>

        {categorias.datos && (
          <div role="group" aria-label="Filtrar por categoría" className="catalogo-pildoras">
            <BotonCategoria activa={categoriaId === ''} onClick={() => cambiarFiltro('categoriaId', '')}>
              Todas
            </BotonCategoria>
            {categorias.datos.map((categoria) => (
              <BotonCategoria
                key={categoria.id}
                activa={categoriaId === String(categoria.id)}
                onClick={() => cambiarFiltro('categoriaId', String(categoria.id))}
              >
                {categoria.nombre}
              </BotonCategoria>
            ))}
          </div>
        )}
      </form>

      {/* aria-live: el lector de pantalla anuncia "6 productos" cada vez
          que cambia, sin que el usuario tenga que ir a buscarlo. */}
      <p aria-live="polite" className="catalogo-resumen">{resumen}</p>

      {productos.error && (
        <ErrorCarga titulo="No pudimos cargar el catálogo." onReintentar={productos.reintentar} />
      )}

      {!lista && productos.cargando && <GrillaCargando />}

      {lista && !productos.error && lista.length > 0 && (
        <ul className={productos.cargando ? 'catalogo-grilla actualizando' : 'catalogo-grilla'} aria-busy={productos.cargando}>
          {lista.map((producto) => (
            <li key={producto.id}>
              <TarjetaProducto producto={producto} />
            </li>
          ))}
        </ul>
      )}

      {lista && !productos.cargando && !productos.error && lista.length === 0 && (
        <div className="catalogo-vacio">
          {hayFiltros ? (
            <>
              <p className="catalogo-vacio-titulo">No encontramos productos con esos filtros.</p>
              <p>Probá con otra palabra o sacá algún filtro. Si es algo especial, también lo podés consultar.</p>
              <button type="button" className="boton" onClick={limpiarFiltros}>Limpiar filtros</button>
            </>
          ) : (
            <>
              <p className="catalogo-vacio-titulo">Todavía no hay productos cargados.</p>
              <p>Volvé a pasar en unos días, o consultanos por lo que estés buscando.</p>
              <Link to="/contacto" className="boton">Hacer una consulta</Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Botón de categoría. aria-pressed le dice al lector de pantalla
// que es un botón que queda "apretado" (seleccionado) o no.
function BotonCategoria({ activa, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={activa ? 'catalogo-pildora activa' : 'catalogo-pildora'}
    >
      {children}
    </button>
  )
}

function TarjetaProducto({ producto }) {
  return (
    <Link to={`/productos/${producto.id}`} className="catalogo-tarjeta">
      <FotoProducto producto={producto} />
      <span className="catalogo-tarjeta-texto">
        <span className="catalogo-tarjeta-categoria">{producto.Categorium?.nombre}</span>
        <span className="catalogo-tarjeta-nombre">{producto.nombre}</span>
        {(producto.sinGluten || !producto.disponible) && (
          <span className="catalogo-etiquetas">
            {producto.sinGluten && <span className="etiqueta">Sin TACC</span>}
            {!producto.disponible && <span className="etiqueta etiqueta-apagada">No disponible por ahora</span>}
          </span>
        )}
      </span>
    </Link>
  )
}

function GrillaCargando() {
  return (
    <ul className="catalogo-grilla" aria-busy="true" aria-label="Cargando productos">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
        <li key={n} className="catalogo-tarjeta">
          <div className="esqueleto" style={{ aspectRatio: '4 / 3' }} />
          <div className="esqueleto" style={{ width: '40%', height: 14 }} />
          <div className="esqueleto" style={{ width: '85%', height: 22 }} />
        </li>
      ))}
    </ul>
  )
}

export default Catalogo