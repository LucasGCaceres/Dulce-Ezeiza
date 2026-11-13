import { pedir, pedirAdmin, simularRed, simularFallo, USAR_MOCKS } from './api'
import { categorias as categoriasMock } from '../mocks/categorias'
import { productos as productosMock } from '../mocks/productos'

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

// ---------- Panel admin ----------

// GET /api/categorias con token: el admin ve también las desactivadas.
export function obtenerCategoriasAdmin() {
  return pedirAdmin('/categorias', {}, () =>
    simularRed([...categoriasMock].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')))
  )
}
// ---------- Mock: helpers ----------

function buscarEnMock(id) {
  return categoriasMock.find((c) => c.id === Number(id))
}

// La columna nombre es UNIQUE en la base: dos categorías no pueden
// llamarse igual. (Sin distinguir mayúsculas, como compara SQL Server.)
function nombreRepetido(nombre, idPropio) {
  return categoriasMock.some((c) => c.id !== idPropio && c.nombre.toLowerCase() === nombre.toLowerCase())
}

// POST /api/categorias  { nombre, descripcion, activa }
// Responde 201 { categoria, mensaje }.
// Ojo: si el nombre está repetido, el backend responde un 400 con un
// mensaje genérico ("Error al crear la categoria"). Por eso la pantalla
// revisa los repetidos ANTES de mandar, con un mensaje más claro.
export function crearCategoria(datos) {
  return pedirAdmin('/categorias', { metodo: 'POST', cuerpo: datos }, () => {
    if (!datos.nombre) return simularFallo('El nombre de la categoria es obligatorio', 400)
    if (nombreRepetido(datos.nombre)) return simularFallo('Error al crear la categoria', 400)
    const nueva = {
      id: Math.max(...categoriasMock.map((c) => c.id)) + 1,
      nombre: datos.nombre,
      descripcion: datos.descripcion ?? null,
      activa: datos.activa ?? true,
      fecha: new Date().toISOString()
    }
    categoriasMock.push(nueva)
    return simularRed({ categoria: nueva, mensaje: 'Categoria creada correctamente' })
  })
}

// PUT /api/categorias/:id  — solo cambia los campos que se manden.
export function editarCategoria(id, datos) {
  return pedirAdmin(`/categorias/${id}`, { metodo: 'PUT', cuerpo: datos }, () => {
    const categoria = buscarEnMock(id)
    if (!categoria) return simularFallo('La categoria no existe', 400)
    if (datos.nombre !== undefined && nombreRepetido(datos.nombre, categoria.id)) {
      return simularFallo('No se pudo actualizar la categoria', 400)
    }
    // Se modifica el MISMO objeto que usan los productos del mock en
    // "Categorium": así, si la desactivás, sus productos se ocultan del
    // catálogo, como pasa con el backend.
    for (const campo of ['nombre', 'descripcion', 'activa']) {
      if (datos[campo] !== undefined) categoria[campo] = datos[campo]
    }
    return simularRed({ categoria, mensaje: 'Categoria actualizada correctamente' })
  })
}

// DELETE /api/categorias/:id
// El backend no deja borrar una categoría que tiene productos (400).
export function eliminarCategoria(id) {
  return pedirAdmin(`/categorias/${id}`, { metodo: 'DELETE' }, () => {
    const posicion = categoriasMock.findIndex((c) => c.id === Number(id))
    if (posicion === -1) return simularFallo('La categoria no existe', 400)
    if (productosMock.some((p) => p.categoriaId === Number(id))) {
      return simularFallo('No se puede eliminar la categoria: tiene productos asociados', 400)
    }
    categoriasMock.splice(posicion, 1)
    return simularRed({ mensaje: 'Categoria eliminada correctamente' })
  })
}