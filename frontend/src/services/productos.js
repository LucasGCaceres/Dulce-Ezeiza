import { pedir, simularRed, USAR_MOCKS } from './api'
import { productos as productosMock } from '../mocks/productos'

// Saca tildes y pasa a minúsculas. SQL Server compara así por defecto
// (LIKE no distingue "pan" de "Pán"), y el mock tiene que hacer lo mismo.
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// Lo mismo que hace Producto.service.js para un visitante: solo productos
// activos de categorías activas, más los filtros que lleguen.
function filtrarMock({ busqueda, categoriaId, sinGluten, destacado }) {
  return productosMock.filter((p) => {
    if (!p.activo || !p.Categorium.activa) return false
    if (busqueda && !normalizar(p.nombre).includes(normalizar(busqueda))) return false
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