// ============================================================
//  Validación del formulario de contacto.
// ============================================================
// Son las MISMAS reglas que Consulta.controller.js en el backend.
// ¿Por qué validar dos veces?
// - En el frontend es por comodidad: el usuario ve el error al lado
//   del campo, al instante y sin esperar al servidor.
// - En el backend es por seguridad: cualquiera puede mandarle un POST
//   a la API sin pasar por este formulario (con Postman, por ejemplo),
//   así que el backend nunca puede confiar en lo que llega.
// Si cambia una regla, hay que cambiarla en los dos lados.

// Mismos largos que las columnas de la tabla Consultas.
export const LARGO_MAXIMO = {
  nombre: 100,
  email: 150,
  telefono: 50,
  asunto: 200,
  mensaje: 2000
}

export const MAXIMO_PRODUCTOS = 10

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Devuelve un objeto { campo: 'mensaje de error' } con un error por
// campo. Si el objeto está vacío, el formulario está bien.
export function validarConsulta(valores) {
  const errores = {}
  const limpio = (campo) => valores[campo].trim()

  if (!limpio('nombre')) errores.nombre = 'Contanos tu nombre.'

  if (!limpio('email')) {
    errores.email = 'Necesitamos tu email para poder responderte.'
  } else if (!FORMATO_EMAIL.test(limpio('email'))) {
    errores.email = 'Revisá el email, parece que le falta algo (ej.: nombre@mail.com).'
  }

  if (!limpio('asunto')) errores.asunto = 'Poné un asunto corto.'
  if (!limpio('mensaje')) errores.mensaje = 'Escribí tu consulta.'

  // Largos máximos (solo si el campo no tiene ya otro error).
  for (const campo in LARGO_MAXIMO) {
    if (!errores[campo] && limpio(campo).length > LARGO_MAXIMO[campo]) {
      errores[campo] = `Puede tener hasta ${LARGO_MAXIMO[campo]} caracteres.`
    }
  }

  return errores
}