import { categorias } from './categorias'

// Copia del seed de crear-base.sql, con la MISMA forma que devuelve
// GET /api/productos: cada producto trae su categoría en "Categorium"
// (así la nombra Sequelize) y sus fotos en "imagenes", ordenadas.
//
// Diferencia con el seed: el seed no carga fotos (ImagenesProducto está
// vacía). Acá cada producto tiene las del maquetado, que viven en
// public/img/productos. Cuando conectemos el backend, se agregan al seed
// los INSERT con estas mismas URLs.

const FECHA = '2026-10-01T12:00:00.000Z'
let siguienteIdImagen = 1

function producto(id, nombre, descripcion, categoriaId, opciones = {}) {
  const { disponible = true, destacado = false, sinGluten = false, fotos = [] } = opciones
  return {
    id,
    nombre,
    descripcion,
    disponible,
    activo: true,
    destacado,
    sinGluten,
    categoriaId,
    fecha: FECHA,
    Categorium: categorias.find((c) => c.id === categoriaId),
    imagenes: fotos.map((archivo, orden) => ({
      id: siguienteIdImagen++,
      productoId: id,
      url: `/img/productos/${archivo}.svg`,
      orden
    }))
  }
}

export const productos = [
  // Panadería
  producto(1, 'Pan Francés', 'Pan francés clásico, horneado todos los días.', 1, { fotos: ['pan-frances'] }),
  producto(2, 'Pan de Campo', 'Pan de campo de miga tierna y corteza crocante.', 1, { fotos: ['pan-de-campo'] }),
  producto(3, 'Pan Lactal', 'Pan lactal casero, ideal para sándwiches.', 1, { fotos: ['pan-lactal'] }),
  producto(4, 'Pan de Salvado', 'Pan de salvado, alto en fibra.', 1, { fotos: ['pan-de-salvado'] }),

  // Facturas y Bollería
  producto(5, 'Medialunas de Manteca', 'Docena de medialunas de manteca, bien dulces.', 2, {
    destacado: true,
    fotos: ['medialunas-de-manteca', 'medialunas-de-manteca-2']
  }),
  producto(6, 'Medialunas de Grasa', 'Docena de medialunas de grasa, estilo tradicional.', 2, { fotos: ['medialunas-de-grasa'] }),
  producto(7, 'Vigilantes', 'Factura rellena de dulce de batata.', 2, { fotos: ['vigilantes'] }),
  producto(8, 'Sacramentos', 'Factura hojaldrada rellena de crema pastelera.', 2, { fotos: ['sacramentos'] }),

  // Tortas y Tartas
  producto(9, 'Torta de Chocolate', 'Torta de chocolate con ganache, porción individual.', 3, {
    destacado: true,
    fotos: ['torta-de-chocolate']
  }),
  producto(10, 'Torta Selva Negra', 'Bizcochuelo de chocolate, crema y cerezas.', 3, {
    disponible: false,
    fotos: ['torta-selva-negra']
  }),
  producto(11, 'Tarta de Manzana', 'Tarta de manzana con masa sablée, porción individual.', 3, { fotos: ['tarta-de-manzana'] }),
  producto(12, 'Cheesecake de Frutos Rojos', 'Cheesecake horneado con coulis de frutos rojos.', 3, {
    destacado: true,
    fotos: ['cheesecake-de-frutos-rojos']
  }),

  // Pastelería individual
  producto(13, 'Alfajor de Maicena', 'Dos tapas de maicena rellenas de dulce de leche.', 4, { fotos: ['alfajor-de-maicena'] }),
  producto(14, 'Lemon Pie Individual', 'Porción individual de lemon pie con merengue.', 4, { fotos: ['lemon-pie-individual'] }),
  producto(15, 'Brownie', 'Brownie de chocolate con nueces.', 4, { fotos: ['brownie'] }),
  producto(16, 'Cupcake de Vainilla', 'Cupcake de vainilla con frosting de manteca.', 4, { fotos: ['cupcake-de-vainilla'] }),

  // Aptos celíacos: cada uno en su categoría, con sinGluten: true.
  // (Sin TACC es una característica del producto, no una categoría.)
  producto(17, 'Pan Sin Gluten', 'Pan apto celíacos, elaborado en zona libre de contaminación cruzada.', 1, {
    sinGluten: true,
    fotos: ['pan-sin-gluten']
  }),
  producto(18, 'Torta Sin Gluten de Naranja', 'Torta de naranja apta celíacos.', 3, {
    destacado: true,
    sinGluten: true,
    fotos: ['torta-sin-gluten-de-naranja']
  }),

  // Bebidas
   producto(19, 'Café en Grano 500g', 'Café de especialidad en grano, bolsa de 500g.', 5, { fotos: ['cafe-en-grano'] }),
  producto(20, 'Limonada Casera 1L', 'Limonada casera con menta, botella de 1 litro.', 5, { fotos: ['limonada-casera'] })
]