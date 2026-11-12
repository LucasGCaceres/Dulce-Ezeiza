// Copia del seed de crear-base.sql (tablas Consultas y ConsultaProductos),
// con la forma que devuelve el backend: cada consulta trae sus productos
// en "productos", solo con id y nombre.
// La va a usar el panel admin. Las consultas que se envían desde el
// formulario (en modo mocks) se agregan a esta misma lista.
//
// Diferencia con el seed: allá las tres tienen la fecha en que se creó la
// base. Acá les ponemos fechas relativas para que el panel muestre
// "hace 3 horas", "hace 2 días", etc.
function haceHoras(horas) {
  return new Date(Date.now() - horas * 60 * 60 * 1000).toISOString()
}

export const consultas = [
  {
    id: 1,
    nombre: 'María González',
    email: 'maria.gonzalez@ejemplo.com',
    telefono: '1133445566',
    asunto: 'Torta para cumpleaños',
    mensaje: '¿Hacen tortas por encargo para 20 personas?',
    estado: 'pendiente',
    fecha: haceHoras(3),
    productos: []
  },
  {
    id: 2,
    nombre: 'Juan Pérez',
    email: 'juan.perez@ejemplo.com',
    telefono: null,
    asunto: 'Consulta sin TACC',
    mensaje: '¿El pan y la torta sin gluten se elaboran en un espacio separado?',
    estado: 'respondida',
    fecha: haceHoras(50),
    productos: [
      { id: 17, nombre: 'Pan Sin Gluten' },
      { id: 18, nombre: 'Torta Sin Gluten de Naranja' }
    ]
  },
  {
    id: 3,
    nombre: 'Sofía Martínez',
    email: 'sofia.martinez@ejemplo.com',
    telefono: '1155667788',
    asunto: 'Horarios',
    mensaje: '¿Abren los domingos?',
    estado: 'cerrada',
    fecha: haceHoras(130),
    productos: []
  }
]