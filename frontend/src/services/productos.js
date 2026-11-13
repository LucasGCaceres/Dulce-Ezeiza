import { pedir, pedirAdmin, simularRed, simularFallo, USAR_MOCKS } from './api'
import { productos as productosMock } from '../mocks/productos'
import { categorias as categoriasMock } from '../mocks/categorias'
import { consultas as consultasMock } from '../mocks/consultas'
import { normalizarTexto } from '../utils/formato'

// SQL Server compara sin tildes ni mayúsculas (LIKE no distingue "pan"
// de "Pán"), y el mock tiene que hacer lo mismo: por eso normalizarTexto.

// Lo mismo que hace Producto.service.js para un visitante: solo productos
// activos de categorías activas, más los filtros que lleguen.
function filtrarMock({ busqueda, categoriaId, sinGluten, destacado }) {
  return productosMock.filter((p) => {
    if (!p.activo || !p.Categorium.activa) return false
    if (busqueda && !normalizarTexto(p.nombre).includes(normalizarTexto(busqueda))) return false
    if (categoriaId && p.categoriaId !== Number(categoriaId)) return false
    if (sinGluten && !p.sinGluten) return false
    if (destacado && !p.destacado) return false
    return true
  })
}

// GET /api/productos (público).
// filtros (todos opcionales): { busqueda, categoriaId, sinGluten, destacado }
export function obtenerProductos(filtros = {}) {
  if (USAR_MOCKS) return simularRed(filtrarMock(filtros))

  // URLSearchParams arma "?busqueda=pan&sinGluten=true" y escapa los
  // caracteres raros. Solo mandamos los filtros que tienen valor.
  const parametros = new URLSearchParams()
  if (filtros.busqueda) parametros.set('busqueda', filtros.busqueda)
  if (filtros.categoriaId) parametros.set('categoriaId', filtros.categoriaId)
  if (filtros.sinGluten) parametros.set('sinGluten', 'true')
  if (filtros.destacado) parametros.set('destacado', 'true')

  const consulta = parametros.toString()
  return pedir(consulta ? `/productos?${consulta}` : '/productos')
}

// GET /api/productos/:id (público). Si no existe o no está activo,
// el backend responde 404 { mensaje: 'Producto no encontrado' }.
export function obtenerProducto(id) {
  if (USAR_MOCKS) {
    const producto = productosMock.find((p) => p.id === Number(id))
    // Mismo criterio que el listado: oculto si el producto o su categoría
    // están desactivados. (El backend real hoy no mira la categoría acá:
    // está anotado como pendiente.)
    if (!producto || !producto.activo || !producto.Categorium.activa) {
      return simularFallo('Producto no encontrado', 404)
    }
    return simularRed(producto)
  }
  return pedir(`/productos/${id}`)
}

// ---------- Panel admin ----------

// GET /api/productos con token: el backend reconoce al admin y devuelve
// TODOS, también los dados de baja (activo = false).
export function obtenerProductosAdmin() {
  return pedirAdmin('/productos', {}, () => simularRed(productosMock))
}
// GET /api/productos/:id con token: el admin puede abrir también los
// productos dados de baja (para editarlos y volver a activarlos).
export function obtenerProductoAdmin(id) {
  return pedirAdmin(`/productos/${id}`, {}, () => {
    const producto = productosMock.find((p) => p.id === Number(id))
    return producto ? simularRed(producto) : simularFallo('Producto no encontrado', 404)
  })
}

// ---------- Mock: helpers para modificar los datos de prueba ----------

function buscarEnMock(id) {
  return productosMock.find((p) => p.id === Number(id))
}

function siguienteIdImagen() {
  const ids = productosMock.flatMap((p) => p.imagenes.map((i) => i.id))
  return Math.max(0, ...ids) + 1
}

// Copia en el mock solo los campos que vinieron, como hace el backend con
// "datos.campo ?? producto.campo". Si cambió la categoría, actualiza Categorium.
function aplicarCambiosMock(producto, datos) {
  for (const campo of ['nombre', 'descripcion', 'categoriaId', 'disponible', 'activo', 'destacado', 'sinGluten']) {
    if (datos[campo] !== undefined) producto[campo] = datos[campo]
  }
  producto.Categorium = categoriasMock.find((c) => c.id === producto.categoriaId)
}

// POST /api/productos  { nombre, descripcion, categoriaId, disponible, activo,
//                        destacado, sinGluten, imagenes: [urls] }
// Responde 201 { producto, mensaje }. 400 si faltan nombre o categoriaId.
export function crearProducto(datos) {
  return pedirAdmin('/productos', { metodo: 'POST', cuerpo: datos }, () => {
    if (!datos.nombre || !datos.categoriaId) {
      return simularFallo('Faltan datos obligatorios: nombre y categoriaId', 400)
    }
    const nuevo = {
      id: Math.max(...productosMock.map((p) => p.id)) + 1,
      disponible: true,
      activo: true,
      destacado: false,
      sinGluten: false,
      fecha: new Date().toISOString(),
      imagenes: []
    }
    aplicarCambiosMock(nuevo, datos)
    let idImagen = siguienteIdImagen()
    nuevo.imagenes = (datos.imagenes ?? []).map((url, orden) => ({ id: idImagen++, productoId: nuevo.id, url, orden }))
    productosMock.push(nuevo)
    return simularRed({ producto: nuevo, mensaje: 'Producto creado correctamente' })
  })
}

// PUT /api/productos/:id  — solo cambia los campos que se manden.
// Responde 200 { producto, mensaje }.
export function editarProducto(id, datos) {
  return pedirAdmin(`/productos/${id}`, { metodo: 'PUT', cuerpo: datos }, () => {
    const producto = buscarEnMock(id)
    if (!producto) return simularFallo('El producto no existe', 400)
    aplicarCambiosMock(producto, datos)
    return simularRed({ producto, mensaje: 'Producto actualizado correctamente' })
  })
}

// DELETE /api/productos/:id  →  200 { mensaje }
// El backend NO deja eliminar un producto que aparece en alguna consulta
// (400). La alternativa es desactivarlo (activo = false).
export function eliminarProducto(id) {
  return pedirAdmin(`/productos/${id}`, { metodo: 'DELETE' }, () => {
    const posicion = productosMock.findIndex((p) => p.id === Number(id))
    if (posicion === -1) return simularFallo('El producto no existe', 400)
    const tieneConsultas = consultasMock.some((c) => c.productos.some((p) => p.id === Number(id)))
    if (tieneConsultas) {
      return simularFallo('No se puede eliminar el producto: tiene consultas asociadas', 400)
    }
    productosMock.splice(posicion, 1)
    return simularRed({ mensaje: 'Producto eliminado correctamente' })
  })
}

// ---------- Imágenes (cada operación se guarda al instante) ----------

// POST /api/productos/:id/imagenes  { urls: [...] }
// Las agrega al final. Responde 201 { imagenes } con TODAS, ya ordenadas.
export function agregarImagenes(productoId, urls) {
  return pedirAdmin(`/productos/${productoId}/imagenes`, { metodo: 'POST', cuerpo: { urls } }, () => {
    const producto = buscarEnMock(productoId)
    if (!producto) return simularFallo('El producto no existe', 400)
    let idImagen = siguienteIdImagen()
    const desde = producto.imagenes.length
    urls.forEach((url, i) => producto.imagenes.push({ id: idImagen++, productoId: producto.id, url, orden: desde + i }))
    return simularRed({ imagenes: producto.imagenes, mensaje: 'Imagen(es) agregada(s) correctamente' })
  })
}

// DELETE /api/productos/:id/imagenes  { imagenesIds: [...] }
// (Un DELETE con cuerpo: es poco común, pero así lo define el backend.)
export function eliminarImagenes(productoId, imagenesIds) {
  return pedirAdmin(`/productos/${productoId}/imagenes`, { metodo: 'DELETE', cuerpo: { imagenesIds } }, () => {
    const producto = buscarEnMock(productoId)
    if (!producto) return simularFallo('El producto no existe', 400)
    producto.imagenes = producto.imagenes.filter((i) => !imagenesIds.includes(i.id))
    return simularRed({ mensaje: 'Imagen(es) eliminada(s) correctamente' })
  })
}

// PUT /api/productos/:id/imagenes/orden  { orden: [ids de TODAS, en el orden nuevo] }
export function reordenarImagenes(productoId, orden) {
  return pedirAdmin(`/productos/${productoId}/imagenes/orden`, { metodo: 'PUT', cuerpo: { orden } }, () => {
    const producto = buscarEnMock(productoId)
    if (!producto) return simularFallo('El producto no existe', 400)
    producto.imagenes = orden.map((id, posicion) => ({ ...producto.imagenes.find((i) => i.id === id), orden: posicion }))
    return simularRed({ mensaje: 'Orden actualizado' })
  })
}