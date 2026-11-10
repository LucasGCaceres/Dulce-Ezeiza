import { pedir, simularRed, simularFallo, USAR_MOCKS } from './api'
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