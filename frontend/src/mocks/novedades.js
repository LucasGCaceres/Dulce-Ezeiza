import { productos } from './productos'

// Copia del seed de crear-base.sql (tabla Novedades), con la forma de
// GET /api/novedades: si la novedad tiene productoId, trae el producto
// en "Producto" con su id, nombre e imágenes. Si no, Producto es null.
//
// En el seed las fechas son relativas (DATEADD(DAY, -2, SYSDATETIME())):
// las calculamos igual, así siempre parecen recientes.
// Diferencia con el seed: el seed no tiene imágenes (imagenUrl NULL).
// Acá le pusimos foto a algunas para ver los dos casos en pantalla.

// Con un número negativo da una fecha futura: haceDias(-5) = dentro de 5 días.
function haceDias(dias) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - dias)
  return fecha.toISOString()
}

function productoRelacionado(id) {
  const { nombre, imagenes } = productos.find((p) => p.id === id)
  return { id, nombre, imagenes }
}

export const novedades = [
  {
    id: 1,
    titulo: '¡Cumplimos 10 años!',
    resumen: 'Una década horneando para Ezeiza. Lo festejamos con descuentos toda la semana.',
    contenido: 'Hace diez años abrimos las puertas de Dulce Ezeiza con un horno y muchas ganas. Para agradecerles, esta semana tenemos sorpresas en el local: pasá a conocerlas.',
    imagenUrl: '/img/sitio/torta-de-cumple.svg',
    fechaPublicacion: haceDias(2),
    publicada: true,
    productoId: null,
    Producto: null
  },
  {
    id: 2,
    titulo: 'Día de la Madre',
    resumen: 'Tortas y cajas de regalo por encargo para el día de mamá.',
    contenido: 'Se acerca el Día de la Madre y preparamos tortas, cajas de regalo y desayunos para sorprender a mamá. Hacé tu pedido con anticipación desde el formulario de contacto.',
    imagenUrl: null,
    fechaPublicacion: haceDias(6),
    publicada: true,
    productoId: null,
    Producto: null
  },
  {
    id: 3,
    titulo: 'Nueva torta sin TACC',
    resumen: 'Sumamos la torta de naranja apta celíacos, elaborada en zona separada.',
    contenido: 'Nuestra torta de naranja sin TACC se elabora en un espacio libre de contaminación cruzada. Pensada para que nadie se quede sin postre.',
    imagenUrl: '/img/productos/torta-sin-gluten-de-naranja.svg',
    fechaPublicacion: haceDias(12),
    publicada: true,
    productoId: 18,
    Producto: productoRelacionado(18)
  },
  {
    id: 4,
    titulo: 'Ahora abrimos los domingos',
    resumen: 'Domingos y feriados de 7:30 a 13, con facturas recién hechas.',
    contenido: 'A pedido de ustedes, ahora abrimos domingos y feriados de 7:30 a 13. Medialunas, facturas y pan recién salidos del horno para el desayuno del fin de semana.',
    imagenUrl: '/img/productos/medialunas-de-manteca.svg',
    fechaPublicacion: haceDias(20),
    publicada: true,
    productoId: null,
    Producto: null
  },
  {
    id: 5,
    titulo: 'Café de especialidad',
    resumen: 'Llegó nuestro café en grano de especialidad, para llevar a casa.',
    contenido: 'Ahora podés llevarte a casa el mismo café que servimos en el local: café de especialidad en grano, en bolsa de 500g.',
    imagenUrl: null,
    fechaPublicacion: haceDias(30),
    publicada: true,
    productoId: 19,
    Producto: productoRelacionado(19)
  },

  // Estas dos NO están en el seed. Sirven para probar que el sitio
  // público no las muestra (y después, para el panel admin).
  {
    id: 6,
    titulo: 'Rosca de Pascua por encargo',
    resumen: 'Ya tomamos pedidos de roscas para Pascua.',
    contenido: 'Este año también hacemos roscas de Pascua por encargo. Escribinos desde el formulario de contacto para reservar la tuya.',
    imagenUrl: null,
    fechaPublicacion: haceDias(-5),   // programada: se publica en 5 días
    publicada: true,
    productoId: null,
    Producto: null
  },
  {
    id: 7,
    titulo: 'Borrador: vacaciones de verano',
    resumen: 'Fechas de cierre por vacaciones (a confirmar).',
    contenido: 'Todavía no definimos las fechas.',
    imagenUrl: null,
    fechaPublicacion: haceDias(1),
    publicada: false,                 // borrador: nunca se ve en el sitio
    productoId: null,
    Producto: null
  }
]