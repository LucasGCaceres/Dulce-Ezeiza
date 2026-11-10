// Copia del seed de crear-base.sql (tablas Consultas y ConsultaProductos),
// con la forma que devuelve el backend: cada consulta trae sus productos
// en "productos", solo con id y nombre.
// La va a usar el panel admin. Las consultas que se envían desde el
// formulario (en modo mocks) se agregan a esta misma lista.
const FECHA = '2026-10-01T12:00:00.000Z'

export const consultas = [
  {
    id: 1,
    nombre: 'María González',
    email: 'maria.gonzalez@ejemplo.com',
    telefono: '1133445566',
    asunto: 'Torta para cumpleaños',
    mensaje: '¿Hacen tortas por encargo para 20 personas?',
    estado: 'pendiente',
    fecha: FECHA,
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
    fecha: FECHA,
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
    fecha: FECHA,
    productos: []
  }
]