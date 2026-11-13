import { pedir, pedirAdmin, simularRed, USAR_MOCKS } from './api'
import { comercio as comercioMock } from '../mocks/comercio'

// GET /api/comercio (público): datos del local para el footer,
// Nosotros y Contacto.
export function obtenerComercio() {
  if (USAR_MOCKS) return simularRed(comercioMock)
  return pedir('/comercio')
}

// PUT /api/comercio (admin) → { comercio, mensaje }
// Siempre edita la única fila que existe. Como el backend usa
// "datos.campo ?? valorViejo", un campo en null NO se borra: para
// vaciarlo hay que mandar '' (texto vacío). El front trata '' igual
// que null: no lo muestra.
export function editarComercio(datos) {
  return pedirAdmin('/comercio', { metodo: 'PUT', cuerpo: datos }, () => {
    for (const campo in datos) {
      if (campo !== 'id' && datos[campo] != null) comercioMock[campo] = datos[campo]
    }
    return simularRed({ comercio: comercioMock, mensaje: 'Informacion del comercio actualizada correctamente' })
  })
}