const API_URL = `${import.meta.env.VITE_API_URL}/productos`

// Recibe filtros opcionales: { busqueda, categoriaId, soloActivos, sinGluten }
// - El catalogo publico pide { soloActivos: true } para no mostrar los dados de baja.
// - El panel admin llama sin filtros para ver todos (activos e inactivos).
export async function obtenerProductos(filtros = {}) {
  const params = new URLSearchParams()

  // Solo agregamos a la URL los filtros que tienen valor.
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '' && valor !== false) {
      params.append(clave, valor)
    }
  })

  const query = params.toString()
  const url = query ? `${API_URL}?${query}` : API_URL

  const respuesta = await fetch(url)

  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener los productos')
  }

  return respuesta.json()
}