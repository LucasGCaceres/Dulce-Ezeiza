// Copia del seed de crear-base.sql: lo que devuelve GET /api/categorias.
// Los ids salen del orden de los INSERT (IDENTITY arranca en 1).
const FECHA = '2026-10-01T12:00:00.000Z'

export const categorias = [
  { id: 1, nombre: 'Panadería', descripcion: 'Panes de todos los días.', activa: true, fecha: FECHA },
  { id: 2, nombre: 'Facturas y Bollería', descripcion: 'Facturas dulces y saladas para la mañana o la merienda.', activa: true, fecha: FECHA },
  { id: 3, nombre: 'Tortas y Tartas', descripcion: 'Tortas enteras y tartas dulces, por porción o para llevar.', activa: true, fecha: FECHA },
  { id: 4, nombre: 'Pastelería individual', descripcion: 'Piezas individuales: alfajores, brownies, cupcakes y más.', activa: true, fecha: FECHA },
  { id: 5, nombre: 'Sin gluten', descripcion: 'Productos aptos para celíacos.', activa: true, fecha: FECHA },
  { id: 6, nombre: 'Bebidas', descripcion: 'Café, té y bebidas para acompañar.', activa: true, fecha: FECHA }
]