import { useState } from 'react'
import { usePedido } from '../../hooks/usePedido'
import {
  obtenerCategoriasAdmin, crearCategoria, editarCategoria, eliminarCategoria
} from '../../services/categorias'
import { obtenerProductosAdmin } from '../../services/productos'
import ErrorCarga from '../../components/ErrorCarga'
import Interruptor from '../../components/admin/Interruptor'
import DialogoConfirmar from '../../components/admin/DialogoConfirmar'
import './AdminCategorias.css'

// Mismos largos que las columnas de la tabla Categorias en la base.
const LARGO = { nombre: 100, descripcion: 500 }

// ============================================================
//  /admin/categorias — tabla a la izquierda, formulario a la derecha.
//  Las categorías son pocas y tienen solo 3 campos: no hace falta una
//  pantalla aparte para editarlas como con los productos.
// ============================================================

function AdminCategorias() {
  const categorias = usePedido(obtenerCategoriasAdmin)
  // Los productos se piden solo para contar cuántos tiene cada categoría.
  const productos = usePedido(obtenerProductosAdmin)
  const lista = categorias.datos ?? categorias.ultimosDatos

  // Qué muestra el formulario: null = "Nueva categoría"; un objeto = editarla.
  const [editando, setEditando] = useState(null)
  // Cambia después de crear una, para que el formulario arranque vacío.
  const [versionFormulario, setVersionFormulario] = useState(0)

  const [aviso, setAviso] = useState(null)
  const [cambiandoActiva, setCambiandoActiva] = useState(null)

  // Borrado: qué categoría y si se está procesando.
  const [aBorrar, setABorrar] = useState(null)
  const [borrando, setBorrando] = useState(false)

  // { 1: 5, 3: 4, ... }: cuántos productos tiene cada categoría.
  const cantidades = {}
  for (const producto of productos.datos ?? productos.ultimosDatos ?? []) {
    cantidades[producto.categoriaId] = (cantidades[producto.categoriaId] ?? 0) + 1
  }
  const cantidadDe = (categoria) => cantidades[categoria.id] ?? 0

  // ---------- Formulario ----------

  async function guardar(datos) {
    if (editando) {
      await editarCategoria(editando.id, datos)
      setAviso({ tipo: 'ok', texto: `Se guardaron los cambios de "${datos.nombre}".` })
      setEditando(null)
    } else {
      await crearCategoria(datos)
      setAviso({ tipo: 'ok', texto: `Se creó la categoría "${datos.nombre}".` })
      setVersionFormulario((v) => v + 1)
    }
    categorias.reintentar()
  }

  function empezarEdicion(categoria) {
    setEditando(categoria)
    setAviso(null)
  }

  // ---------- Visible / oculta ----------

  async function alternarActiva(categoria) {
    setCambiandoActiva(categoria.id)
    setAviso(null)
    try {
      await editarCategoria(categoria.id, { activa: !categoria.activa })
      const cantidad = cantidadDe(categoria)
      setAviso({
        tipo: 'ok',
        texto: categoria.activa
          ? `"${categoria.nombre}" quedó oculta${cantidad > 0 ? `: sus ${cantidad} productos dejan de verse en el sitio` : ''}.`
          : `"${categoria.nombre}" se ve de nuevo en el sitio.`
      })
      categorias.reintentar()
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message })
    } finally {
      setCambiandoActiva(null)
    }
  }

  // ---------- Borrado ----------

  // Ya sabemos cuántos productos tiene: si tiene alguno, el diálogo
  // explica por qué no se puede, sin esperar a que el backend lo rechace.
  const borrable = aBorrar !== null && cantidadDe(aBorrar) === 0

  async function confirmarBorrado() {
    setBorrando(true)
    try {
      await eliminarCategoria(aBorrar.id)
      setAviso({ tipo: 'ok', texto: `Se eliminó la categoría "${aBorrar.nombre}".` })
      if (editando?.id === aBorrar.id) setEditando(null)
      setABorrar(null)
      categorias.reintentar()
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message })
      setABorrar(null)
      // Por si la cuenta de productos estaba vieja (otro admin cargó uno).
      productos.reintentar()
    } finally {
      setBorrando(false)
    }
  }

  async function ocultarEnSuLugar() {
    setABorrar(null)
    await alternarActiva(aBorrar)
  }

  let dialogo = null
  if (aBorrar) {
    const cantidad = cantidadDe(aBorrar)
    if (borrable) {
      dialogo = {
        titulo: `¿Eliminar "${aBorrar.nombre}"?`,
        texto: 'No tiene productos, así que se puede borrar. No se puede deshacer.',
        boton: 'Eliminar',
        peligroso: true,
        accion: confirmarBorrado
      }
    } else {
      const motivo = `Tiene ${cantidad} ${cantidad === 1 ? 'producto' : 'productos'}. Para borrarla, primero pasalos a otra categoría desde Productos.`
      dialogo = aBorrar.activa
        ? {
            titulo: 'No se puede eliminar',
            texto: `${motivo} Si lo que querés es sacarla del sitio, podés ocultarla.`,
            boton: 'Ocultarla',
            peligroso: false,
            accion: ocultarEnSuLugar
          }
        : {
            titulo: 'No se puede eliminar',
            texto: `${motivo} Ya está oculta: ni ella ni sus productos se ven en el sitio.`,
            boton: 'Entendido',
            peligroso: false,
            accion: () => setABorrar(null)
          }
    }
  }

  // ---------- Pantalla ----------

  if (categorias.error && !lista) {
    return <ErrorCarga titulo="No pudimos cargar las categorías." onReintentar={categorias.reintentar} />
  }

  return (
    <div className="admin-categorias">
      <title>Categorías - Panel Dulce Ezeiza</title>

      <div>
        <h1 className="panel-titulo">Categorías</h1>
        <p className="panel-bajada">
          Si ocultás una categoría, sus productos dejan de verse en el sitio (pero no se borran).
        </p>
      </div>

      {aviso && (
        <div role={aviso.tipo === 'error' ? 'alert' : 'status'} className={`admin-aviso admin-aviso-${aviso.tipo}`}>
          <span>{aviso.texto}</span>
          <button type="button" onClick={() => setAviso(null)} aria-label="Cerrar aviso">×</button>
        </div>
      )}

      <div className="admin-categorias-columnas">
        {!lista ? (
          <div className="esqueleto" style={{ height: 360 }} aria-label="Cargando" />
        ) : (
          <div className="admin-tabla-contenedor">
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th scope="col">Categoría</th>
                  <th scope="col">Productos</th>
                  <th scope="col">Visible</th>
                  <th scope="col"><span className="solo-lector">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {lista.map((categoria) => (
                  <tr
                    key={categoria.id}
                    className={[
                      categoria.activa ? '' : 'fila-apagada',
                      editando?.id === categoria.id ? 'fila-editando' : ''
                    ].join(' ')}
                  >
                    <td>
                      <span className="admin-categoria-nombre">{categoria.nombre}</span>
                      {categoria.descripcion && <span className="admin-categoria-descripcion">{categoria.descripcion}</span>}
                    </td>
                    <td className="admin-categoria-cantidad">{productos.datos || productos.ultimosDatos ? cantidadDe(categoria) : '…'}</td>
                    <td>
                      <Interruptor
                        encendido={categoria.activa}
                        onCambiar={() => alternarActiva(categoria)}
                        etiqueta={`Mostrar ${categoria.nombre} en el sitio`}
                        deshabilitado={cambiandoActiva === categoria.id}
                      />
                    </td>
                    <td>
                      <div className="admin-categoria-acciones">
                        <button type="button" className="boton boton-secundario boton-chico" onClick={() => empezarEdicion(categoria)}>
                          Editar
                        </button>
                        <button type="button" className="admin-enlace-peligro" onClick={() => { setABorrar(categoria); setAviso(null) }}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lista.length === 0 && <p className="admin-tabla-vacia">Todavía no hay categorías. Creá la primera con el formulario.</p>}
          </div>
        )}

        <FormularioCategoria
          // key: al pasar de "nueva" a editar otra (o después de crear),
          // el formulario se monta de nuevo con los valores que corresponden.
          key={editando ? `editar-${editando.id}` : `nueva-${versionFormulario}`}
          categoria={editando}
          otras={(lista ?? []).filter((c) => c.id !== editando?.id)}
          onGuardar={guardar}
          onCancelar={() => setEditando(null)}
        />
      </div>

      <DialogoConfirmar
        abierto={dialogo !== null}
        titulo={dialogo?.titulo}
        textoConfirmar={dialogo?.boton}
        peligroso={dialogo?.peligroso}
        onConfirmar={dialogo?.accion}
        onCancelar={() => setABorrar(null)}
        ocupado={borrando}
      >
        <p>{dialogo?.texto}</p>
      </DialogoConfirmar>
    </div>
  )
}

// ---------- Formulario de crear / editar ----------
// categoria: null para crear, o la categoría a editar.
// otras: las demás categorías, para avisar si el nombre se repite.
function FormularioCategoria({ categoria, otras, onGuardar, onCancelar }) {
  const esNueva = categoria === null
  const [nombre, setNombre] = useState(categoria?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(categoria?.descripcion ?? '')
  const [activa, setActiva] = useState(true)   // solo se usa al crear
  const [intentoGuardar, setIntentoGuardar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  // El nombre es UNIQUE en la base. Si se repite, el backend responde un
  // error genérico; mejor avisarlo acá con un mensaje claro.
  const repetido = otras.some((c) => c.nombre.toLowerCase() === nombre.trim().toLowerCase())
  let errorNombre = null
  if (intentoGuardar && !nombre.trim()) errorNombre = 'Ponele un nombre.'
  else if (nombre.trim() && repetido) errorNombre = 'Ya hay una categoría con ese nombre.'

  async function enviar(evento) {
    evento.preventDefault()
    setIntentoGuardar(true)
    setError(null)
    if (!nombre.trim() || repetido) {
      document.getElementById('categoria-nombre')?.focus()
      return
    }
    setGuardando(true)
    try {
      // Al editar no se manda "activa": eso se cambia con el interruptor
      // de la tabla (si no, el formulario podría pisar ese cambio).
      const datos = { nombre: nombre.trim(), descripcion: descripcion.trim() }
      await onGuardar(esNueva ? { ...datos, activa } : datos)
      // No hace falta limpiar nada: el padre cambia la key y este
      // formulario se vuelve a montar desde cero.
    } catch (e) {
      setError(e.message)
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="admin-caja admin-categoria-form" aria-labelledby="titulo-form-categoria">
      <h2 id="titulo-form-categoria" className="admin-caja-titulo">
        {esNueva ? 'Nueva categoría' : `Editar "${categoria.nombre}"`}
      </h2>

      {error && <p role="alert" className="admin-categoria-error">{error}</p>}

      <div className="campo">
        <label htmlFor="categoria-nombre" className="campo-etiqueta">Nombre</label>
        <input id="categoria-nombre" type="text" maxLength={LARGO.nombre}
          value={nombre} onChange={(e) => setNombre(e.target.value)}
          className={errorNombre ? 'campo-control con-error' : 'campo-control'}
          aria-invalid={errorNombre ? true : undefined}
          aria-describedby={errorNombre ? 'categoria-nombre-error' : undefined} />
        {errorNombre && <span id="categoria-nombre-error" className="campo-error">{errorNombre}</span>}
      </div>

      <div className="campo">
        <label htmlFor="categoria-descripcion" className="campo-etiqueta">
          Descripción <span className="campo-opcional">(opcional)</span>
        </label>
        <textarea id="categoria-descripcion" rows={3} maxLength={LARGO.descripcion}
          value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="campo-control" />
      </div>

      {esNueva && (
        <label className="admin-categoria-check">
          <input type="checkbox" checked={activa} onChange={() => setActiva(!activa)} />
          Visible en el sitio
        </label>
      )}

      <div className="admin-categoria-botones">
        {!esNueva && (
          <button type="button" className="boton boton-secundario" onClick={onCancelar} disabled={guardando}>
            Cancelar
          </button>
        )}
        <button type="submit" className="boton" disabled={guardando}>
          {guardando ? 'Guardando...' : esNueva ? 'Crear categoría' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

export default AdminCategorias