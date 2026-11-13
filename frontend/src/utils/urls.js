// ¿Es una dirección de imagen que podemos guardar?
// - "https://..." o "http://...": una imagen de internet.
// - "/img/...": una imagen que está en la carpeta public del propio sitio.
// La usan las imágenes de productos y la imagen de las novedades.
export function urlImagenValida(texto) {
  if (texto.startsWith('/')) return true
  try {
    const url = new URL(texto)   // si no tiene forma de URL, lanza un error
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}