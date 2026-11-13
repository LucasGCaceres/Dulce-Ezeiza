import { pedir, pedirAdmin, simularRed, simularFallo, USAR_MOCKS } from './api'
import { novedades as novedadesMock } from '../mocks/novedades'
import { productos as productosMock } from '../mocks/productos'

// ¿La ve un visitante? Publicada y con la fecha de publicación ya cumplida.
// Una novedad "programada" (publicada con fecha futura) todavía no se ve.
// Es el mismo criterio que usa Novedad.service.js en el backend.
export function esVisible(novedad) {
  return novedad.publicada && new Date(novedad.fechaPublicacion) <= new Date()
}
// Los tres estados que ve el admin:
// - 'borrador': publicada = false. No se ve nunca.
// - 'programada': publicada, pero con fecha futura. Se va a ver sola ese día.
// - 'publicada': publicada y con la fecha cumplida. Se ve en el sitio.
export function estadoNovedad(novedad) {
  if (!novedad.publicada) return 'borrador'
  return esVisible(novedad) ? 'publicada' : 'programada'
}

// GET /api/novedades (público): solo las visibles, de la más nueva
// a la más vieja.
// limite (opcional): cuántas traer. Inicio pide 3.
export function obtenerNovedades({ limite } = {}) {
  if (USAR_MOCKS) {
    const visibles = novedadesMock
      .filter(esVisible)
      .sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion))
    return simularRed(limite ? visibles.slice(0, limite) : visibles)
  }
  return pedir(limite ? `/novedades?limite=${limite}` : '/novedades')
}

// GET /api/novedades/:id (público). Si no existe, es un borrador o
// todavía no llegó su fecha, el backend responde 404 'Novedad no encontrada'.
export function obtenerNovedad(id) {
  if (USAR_MOCKS) {
    const novedad = novedadesMock.find((n) => n.id === Number(id))
    if (!novedad || !esVisible(novedad)) return simularFallo('Novedad no encontrada', 404)
    return simularRed(novedad)
  }
  return pedir(`/novedades/${id}`)
}

// ---------- Panel admin ----------

// GET /api/novedades/admin/todas: todas, también borradores y programadas,
// de la más nueva a la más vieja. Para el admin, el producto relacionado
// viene solo con { id, nombre, activo } (sin imágenes).
export function obtenerTodasLasNovedades() {
  return pedirAdmin('/novedades/admin/todas', {}, () => {
    const todas = [...novedadesMock]
      .sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion))
      .map((n) => ({
        ...n,
        Producto: n.Producto ? { id: n.Producto.id, nombre: n.Producto.nombre, activo: productosMock.find((p) => p.id === n.Producto.id)?.activo ?? true } : null
      }))
    return simularRed(todas)
  })
}

// ---------- Mock: helpers ----------

// El mock guarda el producto con la forma del sitio público
// ({ id, nombre, imagenes }), como el resto de mocks/novedades.js.
function productoParaMock(productoId) {
  if (productoId == null) return null
  const producto = productosMock.find((p) => p.id === productoId)
  return producto ? { id: producto.id, nombre: producto.nombre, imagenes: producto.imagenes } : null
}

// Las mismas validaciones que validarNovedad() en Novedad.controller.js.
function validarMock(datos, esEdicion) {
  const errores = []
  const largos = { titulo: 150, resumen: 300, contenido: 20000 }
  for (const campo in largos) {
    if (esEdicion && datos[campo] === undefined) continue
    const valor = datos[campo]?.trim()
    if (!valor) errores.push(`El campo ${campo} es obligatorio`)
    else if (valor.length > largos[campo]) errores.push(`El campo ${campo} no puede superar los ${largos[campo]} caracteres`)
  }
  if (datos.productoId != null && !productoParaMock(datos.productoId)) {
    return simularFallo('El producto relacionado no existe', 400)
  }
  if (errores.length > 0) {
    // El backend manda la lista aparte ({ mensaje, errores }); el mock la
    // junta en el mensaje. El formulario valida antes, así que casi nunca llega.
    return simularFallo(`Hay datos invalidos en la novedad: ${errores.join('; ')}`, 400)
  }
  return null
}

function aplicarCambiosMock(novedad, datos) {
  for (const campo of ['titulo', 'resumen', 'contenido', 'fechaPublicacion', 'publicada']) {
    if (datos[campo] !== undefined && datos[campo] !== null) novedad[campo] = datos[campo]
  }
  // imagenUrl y productoId se pueden quitar mandando null (como en el backend).
  if (datos.imagenUrl !== undefined) novedad.imagenUrl = datos.imagenUrl || null
  if (datos.productoId !== undefined) {
    novedad.productoId = datos.productoId
    novedad.Producto = productoParaMock(datos.productoId)
  }
}

// POST /api/novedades  { titulo, resumen, contenido, imagenUrl, productoId,
//                        publicada, fechaPublicacion }
// Responde 201 { novedad, mensaje }. Sin "publicada", queda en borrador.
export function crearNovedad(datos) {
  return pedirAdmin('/novedades', { metodo: 'POST', cuerpo: datos }, () => {
    const error = validarMock(datos, false)
    if (error) return error
    const nueva = {
      id: Math.max(...novedadesMock.map((n) => n.id)) + 1,
      fechaPublicacion: new Date().toISOString(),
      publicada: false,
      imagenUrl: null,
      productoId: null,
      Producto: null
    }
    aplicarCambiosMock(nueva, datos)
    novedadesMock.push(nueva)
    return simularRed({ novedad: nueva, mensaje: 'Novedad creada correctamente' })
  })
}

// PUT /api/novedades/:id — solo cambia lo que se mande.
export function editarNovedad(id, datos) {
  return pedirAdmin(`/novedades/${id}`, { metodo: 'PUT', cuerpo: datos }, () => {
    const novedad = novedadesMock.find((n) => n.id === Number(id))
    if (!novedad) return simularFallo('La novedad no existe', 400)
    const error = validarMock(datos, true)
    if (error) return error
    aplicarCambiosMock(novedad, datos)
    return simularRed({ novedad, mensaje: 'Novedad actualizada correctamente' })
  })
}

// DELETE /api/novedades/:id
export function eliminarNovedad(id) {
  return pedirAdmin(`/novedades/${id}`, { metodo: 'DELETE' }, () => {
    const posicion = novedadesMock.findIndex((n) => n.id === Number(id))
    if (posicion === -1) return simularFallo('La novedad no existe', 400)
    novedadesMock.splice(posicion, 1)
    return simularRed({ mensaje: 'Novedad eliminada correctamente' })
  })
}