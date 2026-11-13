import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { usePedido } from '../../hooks/usePedido'
import { obtenerProductosAdmin, editarProducto, eliminarProducto } from '../../services/productos'
import { obtenerCategoriasAdmin } from '../../services/categorias'
import FotoProducto from '../../components/FotoProducto'
import ErrorCarga from '../../components/ErrorCarga'
import Interruptor from '../../components/admin/Interruptor'
import DialogoConfirmar from '../../components/admin/DialogoConfirmar'
import { normalizarTexto } from '../../utils/formato'
import './AdminProductos.css'

// ============================================================
//  /admin/productos — tabla con todos los productos (también los
//  dados de baja), filtros y acciones rápidas.
//  Los filtros son estado local y no van a la URL: es una pantalla
//  de trabajo interna, nadie va a compartir el link.
// ============================================================

function AdminProductos() {
  const location = useLocation()
  const productos = usePedido(obtenerProductosAdmin)
  const categorias = usePedido(obtenerCategoriasAdmin)
  const lista = productos.datos ?? productos.ultimosDatos

  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [estado, setEstado] = useState('todos')

  // Mensaje arriba de la tabla. Puede venir del formulario ("Producto
  // creado"), que lo manda en el state de la navegación.
  const [aviso, setAviso] = useState(location.state?.aviso ? { tipo: 'ok', texto: location.state.aviso } : null)

  // id del producto cuyo "destacado" se está guardando (para deshabilitar
  // ese interruptor mientras tanto).
  const [cambiandoDestacado, setCambiandoDestacado] = useState(null)

  // Borrado: qué producto, si se está procesando y si el backend lo rechazó.
  const [aBorrar, setABorrar] = useState(null)
  const [borrando, setBorrando] = useState(false)
  const [conConsultas, setConConsultas] = useState(false)

  // ---------- Filtrado (en el front: ya tenemos todos) ----------
  const filtrados = (lista ?? []).filter((p) => {
    if (busqueda && !normalizarTexto(p.nombre).includes(normalizarTexto(busqueda))) return false
    if (categoriaId && p.categoriaId !== Number(categoriaId)) return false
    if (estado === 'activos' && !p.activo) return false
    if (estado === 'inactivos' && p.activo) return false
    if (estado === 'sin-stock' && (!p.activo || p.disponible)) return false
    return true
  })

  const inactivos = lista?.filter((p) => !p.activo).length ?? 0

  // ---------- Acciones ----------

  async function alternarDestacado(producto) {
    setCambiandoDestacado(producto.id)
    setAviso(null)
    try {
      // PUT con un solo campo: el backend deja el resto como estaba.
      await editarProducto(producto.id, { destacado: !producto.destacado })
      productos.reintentar()
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message })
    } finally {
      setCambiandoDestacado(null)
    }
  }

  function pedirBorrado(producto) {
    setABorrar(producto)
    setConConsultas(false)
    setAviso(null)
  }

  function cerrarDialogo() {
    setABorrar(null)
  }

  async function confirmarBorrado() {
    setBorrando(true)
    try {
      await eliminarProducto(aBorrar.id)
      setAviso({ tipo: 'ok', texto: `Se eliminó "${aBorrar.nombre}".` })
      setABorrar(null)
      productos.reintentar()
    } catch (error) {
      // El backend no deja borrar un producto que aparece en consultas.
      // Lo reconocemos por el mensaje (el backend responde 400 para todo;
      // un código propio sería más prolijo, pero alcanza).
      if (error.message.includes('consultas asociadas')) {
        setConConsultas(true)
      } else {
        setAviso({ tipo: 'error', texto: error.message })
        setABorrar(null)
      }
    } finally {
      setBorrando(false)
    }
  }

  // La salida cuando no se puede borrar: sacarlo del sitio sin perder el
  // historial de consultas.
  async function desactivarEnSuLugar() {
    setBorrando(true)
    try {
      await editarProducto(aBorrar.id, { activo: false })
      setAviso({ tipo: 'ok', texto: `"${aBorrar.nombre}" quedó desactivado: ya no se ve en el sitio.` })
      setABorrar(null)
      productos.reintentar()
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message })
      setABorrar(null)
    } finally {
      setBorrando(false)
    }
  }

  return (
    <div className="admin-productos">
      <title>Productos - Panel Dulce Ezeiza</title>

      <div className="admin-productos-encabezado">
        <div>
          <h1 className="panel-titulo">Productos</h1>
          <p className="panel-bajada">
            {lista
              ? `${lista.length} productos${inactivos > 0 ? ` · ${inactivos} ${inactivos === 1 ? 'desactivado' : 'desactivados'} (no se ven en el sitio)` : ''}`
              : 'Cargando...'}
          </p>
        </div>
        <Link to="/admin/productos/nuevo" className="boton">Nuevo producto</Link>
      </div>

      {aviso && (
        <div role={aviso.tipo === 'error' ? 'alert' : 'status'} className={`admin-aviso admin-aviso-${aviso.tipo}`}>
          <span>{aviso.texto}</span>
          <button type="button" onClick={() => setAviso(null)} aria-label="Cerrar aviso">×</button>
        </div>
      )}

      <div className="admin-productos-filtros">
        <div className="campo admin-productos-buscar">
          <label htmlFor="buscar" className="campo-etiqueta">Buscar</label>
          <input id="buscar" type="search" className="campo-control" placeholder="Nombre del producto"
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="filtro-categoria" className="campo-etiqueta">Categoría</label>
          <select id="filtro-categoria" className="campo-control" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
            <option value="">Todas</option>
            {categorias.datos?.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}{c.activa ? '' : ' (desactivada)'}</option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="filtro-estado" className="campo-etiqueta">Estado</label>
          <select id="filtro-estado" className="campo-control" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Desactivados</option>
            <option value="sin-stock">No disponibles por ahora</option>
          </select>
        </div>
      </div>

      {productos.error && !lista && (
        <ErrorCarga titulo="No pudimos cargar los productos." onReintentar={productos.reintentar} />
      )}

      {!lista && productos.cargando && <div className="esqueleto" style={{ height: 400 }} />}

      {lista && (
        <div className="admin-tabla-contenedor">
          <table className="admin-tabla">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Categoría</th>
                <th scope="col">Destacado</th>
                <th scope="col">Estado</th>
                {/* Columna sin título visible, pero con nombre para el lector. */}
                <th scope="col"><span className="solo-lector">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((producto) => (
                <tr key={producto.id} className={producto.activo ? '' : 'fila-apagada'}>
                  <td>
                    <div className="admin-producto-celda">
                      <FotoProducto producto={producto} className="admin-producto-foto" />
                      <span>
                        <Link to={`/admin/productos/${producto.id}`} className="admin-producto-nombre">{producto.nombre}</Link>
                        {producto.sinGluten && <span className="etiqueta admin-producto-etiqueta">Sin TACC</span>}
                      </span>
                    </div>
                  </td>
                  <td>{producto.Categorium?.nombre}</td>
                  <td>
                    <Interruptor
                      encendido={producto.destacado}
                      onCambiar={() => alternarDestacado(producto)}
                      etiqueta={`Destacar ${producto.nombre} en el inicio`}
                      deshabilitado={cambiandoDestacado === producto.id}
                    />
                  </td>
                  <td>
                    <EstadoProducto producto={producto} />
                  </td>
                  <td>
                    <div className="admin-producto-acciones">
                      <Link to={`/admin/productos/${producto.id}`} className="boton boton-secundario boton-chico">Editar</Link>
                      <button type="button" className="admin-enlace-peligro" onClick={() => pedirBorrado(producto)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtrados.length === 0 && <p className="admin-tabla-vacia">Ningún producto coincide con los filtros.</p>}
        </div>
      )}

      <DialogoConfirmar
        abierto={aBorrar !== null}
        titulo={conConsultas ? 'No se puede eliminar' : `¿Eliminar "${aBorrar?.nombre}"?`}
        textoConfirmar={conConsultas ? 'Desactivarlo' : 'Eliminar'}
        peligroso={!conConsultas}
        onConfirmar={conConsultas ? desactivarEnSuLugar : confirmarBorrado}
        onCancelar={cerrarDialogo}
        ocupado={borrando}
      >
        {conConsultas ? (
          <p>
            Este producto aparece en consultas de clientes, así que no se puede borrar.
            Podés <strong>desactivarlo</strong>: deja de verse en el sitio y lo volvés a activar cuando quieras.
          </p>
        ) : (
          <p>
            Se borra junto con sus imágenes y no se puede deshacer. Si solo querés sacarlo del sitio
            por un tiempo, desactivalo desde Editar.
          </p>
        )}
      </DialogoConfirmar>
    </div>
  )
}

function EstadoProducto({ producto }) {
  if (!producto.activo) return <span className="etiqueta etiqueta-apagada">Desactivado</span>
  if (!producto.disponible) return <span className="etiqueta">No disponible</span>
  return <span className="admin-estado-activo">Activo</span>
}

export default AdminProductos