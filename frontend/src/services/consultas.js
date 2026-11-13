import { pedir, pedirAdmin, simularRed, simularFallo, USAR_MOCKS } from './api'
import { consultas as consultasMock } from '../mocks/consultas'
import { productos as productosMock } from '../mocks/productos'

// El backend acepta 5 consultas por hora desde la misma IP (rate limit)
// y a la sexta responde 429. El mock lo imita contando los envíos.
// El contador vive en memoria: se reinicia al recargar la página.
const LIMITE_POR_HORA = 5
let enviadasEnMock = 0

// POST /api/consultas (público).
// datos: { nombre, email, telefono, asunto, mensaje, productoIds: [5, 9] }
// Responde 201 { consulta, mensaje }.
// Errores posibles: 400 { mensaje, errores: [...] } si hay datos inválidos,
// 400 { mensaje } si un producto no existe, 429 { mensaje } por el límite.
export function enviarConsulta(datos) {
  if (USAR_MOCKS) {
    enviadasEnMock++
    if (enviadasEnMock > LIMITE_POR_HORA) {
      return simularFallo('Enviaste demasiadas consultas. Probá de nuevo más tarde.', 429)
    }

    // Como Consulta.service.js: todos los productos tienen que existir y estar activos.
    const productos = datos.productoIds.map((id) => productosMock.find((p) => p.id === id && p.activo))
    if (productos.some((p) => !p)) {
      return simularFallo('Alguno de los productos elegidos no existe o no esta disponible', 400)
    }

    const nueva = {
      id: consultasMock.length + 1,
      nombre: datos.nombre,
      email: datos.email,
      telefono: datos.telefono || null,
      asunto: datos.asunto,
      mensaje: datos.mensaje,
      estado: 'pendiente',
      fecha: new Date().toISOString(),
      productos: productos.map(({ id, nombre }) => ({ id, nombre }))
    }
    consultasMock.push(nueva)
    return simularRed({ consulta: nueva, mensaje: 'Consulta enviada correctamente' }, 700)
  }

  return pedir('/consultas', { metodo: 'POST', cuerpo: datos })
}

// ---------- Panel admin ----------

// GET /api/consultas (admin), de la más nueva a la más vieja.
// estado (opcional): 'pendiente' | 'respondida' | 'cerrada'.
export function obtenerConsultas({ estado } = {}) {
  return pedirAdmin(estado ? `/consultas?estado=${estado}` : '/consultas', {}, () => {
    const lista = consultasMock
      .filter((c) => !estado || c.estado === estado)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    return simularRed(lista)
  })
}

export const ESTADOS_CONSULTA = ['pendiente', 'respondida', 'cerrada']

// PATCH /api/consultas/:id/estado  { estado }
// Responde 200 { consulta, mensaje }. 400 si el estado no es válido o la
// consulta no existe. Las transiciones son libres (se puede reabrir).
export function cambiarEstadoConsulta(id, estado) {
  return pedirAdmin(`/consultas/${id}/estado`, { metodo: 'PATCH', cuerpo: { estado } }, () => {
    const consulta = consultasMock.find((c) => c.id === id)
    if (!consulta) return simularFallo('Consulta no encontrada', 400)
    if (!ESTADOS_CONSULTA.includes(estado)) return simularFallo('Estado invalido', 400)
    consulta.estado = estado
    return simularRed({ consulta, mensaje: 'Estado actualizado correctamente' })
  })
}

// DELETE /api/consultas/:id  →  200 { mensaje }
export function eliminarConsulta(id) {
  return pedirAdmin(`/consultas/${id}`, { metodo: 'DELETE' }, () => {
    const posicion = consultasMock.findIndex((c) => c.id === id)
    if (posicion === -1) return simularFallo('Consulta no encontrada', 400)
    consultasMock.splice(posicion, 1)
    return simularRed({ mensaje: 'Consulta eliminada correctamente' })
  })
}