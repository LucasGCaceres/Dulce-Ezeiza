import { pedir, simularRed, USAR_MOCKS } from './api'
import { categorias as categoriasMock } from '../mocks/categorias'

// GET /api/categorias (público): solo las activas, ordenadas por nombre,
// igual que Categoria.service.js.
export function obtenerCategorias() {
  if (USAR_MOCKS) {
    const activas = categoriasMock
      .filter((c) => c.activa)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    return simularRed(activas)
  }
  return pedir('/categorias')
}