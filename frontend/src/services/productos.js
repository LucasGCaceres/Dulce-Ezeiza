const API_URL = 'http://localhost:8080/api/productos'

export async function obtenerProductos() {
  const respuesta = await fetch(API_URL)

  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener los productos')
  }

  return respuesta.json()
}