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

// Texto con saltos de línea → lista de párrafos.
// "Hola.\n\nChau." → ['Hola.', 'Chau.']
// Cada línea no vacía es un párrafo; las líneas en blanco se ignoran.
export function dividirEnParrafos(texto) {
  if (!texto) return []
  return texto
    .split('\n')
    .map((linea) => linea.trim())
    .filter((linea) => linea !== '')
}

// Hace cuánto pasó algo, en palabras: "hace 3 horas", "ayer", "hace 5 días".
// Intl.RelativeTimeFormat ya sabe cómo se dice en español; con
// numeric: 'auto' usa "ayer" en vez de "hace 1 día".
const tiempoRelativo = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

export function formatearHace(fechaIso) {
  const minutos = Math.round((new Date(fechaIso) - Date.now()) / 60000)  // negativo = pasado
  if (Math.abs(minutos) < 1) return 'recién'
  if (Math.abs(minutos) < 60) return tiempoRelativo.format(minutos, 'minute')
  const horas = Math.round(minutos / 60)
  if (Math.abs(horas) < 24) return tiempoRelativo.format(horas, 'hour')
  const dias = Math.round(horas / 24)
  if (Math.abs(dias) < 30) return tiempoRelativo.format(dias, 'day')
  return formatearFecha(fechaIso)
}

// Fecha de hoy con el día de la semana: "jueves, 12 de noviembre".
export function formatearHoy() {
  return new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

// Fecha con hora: "12 de noviembre de 2026 a las 15:30".
// hour12: false fuerza el formato de 24 horas (si no, según el navegador
// puede salir "03:30 p. m.").
export function formatearFechaHora(fechaIso) {
  return new Date(fechaIso).toLocaleString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}