import { pedir, simularRed, USAR_MOCKS } from './api'
import { novedades as novedadesMock } from '../mocks/novedades'

// GET /api/novedades (público): solo las publicadas con fecha ya
// cumplida, de la más nueva a la más vieja, igual que Novedad.service.js.
// limite (opcional): cuántas traer. Inicio pide 3.
export function obtenerNovedades({ limite } = {}) {
  if (USAR_MOCKS) {
    const ahora = new Date()
    const visibles = novedadesMock
      .filter((n) => n.publicada && new Date(n.fechaPublicacion) <= ahora)
      .sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion))
    return simularRed(limite ? visibles.slice(0, limite) : visibles)
  }
  return pedir(limite ? `/novedades?limite=${limite}` : '/novedades')
}