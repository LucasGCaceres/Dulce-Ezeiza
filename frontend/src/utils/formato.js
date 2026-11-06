// Funciones chicas para mostrar datos, compartidas por varias páginas.

// "2026-10-14T15:00:00.000Z" → "14 de octubre de 2026"
export function formatearFecha(fechaIso) {
  return new Date(fechaIso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// "2026-10-14T15:00:00.000Z" → "2026-10-14", el formato que pide
// el atributo dateTime de <time>. Se arma con la fecha LOCAL: si se
// usara toISOString(), una novedad publicada a las 22 hs de Argentina
// quedaría con el día siguiente, porque esa hora ya es otro día en UTC.
export function fechaParaTime(fechaIso) {
  const fecha = new Date(fechaIso)
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}