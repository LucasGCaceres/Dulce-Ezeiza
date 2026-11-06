import { pedir, simularRed, USAR_MOCKS } from './api'
import { comercio as comercioMock } from '../mocks/comercio'

// GET /api/comercio (público): datos del local para el footer,
// Nosotros y Contacto.
export function obtenerComercio() {
  if (USAR_MOCKS) return simularRed(comercioMock)
  return pedir('/comercio')
}