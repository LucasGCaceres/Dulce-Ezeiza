import { pedir, pedirAdmin, simularRed, simularFallo, USAR_MOCKS } from './api'
import { novedades as novedadesMock } from '../mocks/novedades'

// ¿La ve un visitante? Publicada y con la fecha de publicación ya cumplida.
// Una novedad "programada" (publicada con fecha futura) todavía no se ve.
// Es el mismo criterio que usa Novedad.service.js en el backend.
export function esVisible(novedad) {
  return novedad.publicada && new Date(novedad.fechaPublicacion) <= new Date()
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
        Producto: n.Producto ? { id: n.Producto.id, nombre: n.Producto.nombre, activo: true } : null
      }))
    return simularRed(todas)
  })
}