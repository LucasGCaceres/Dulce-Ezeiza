import './FotoProducto.css'

// Muestra la portada de un producto: la imagen de orden 0, que el
// backend ya manda primera porque las ordena. Si el producto no tiene
// fotos (en el seed real ninguno tiene), dibuja un recuadro de reemplazo
// en vez de una imagen rota.
//
// alt="" a propósito: la foto siempre va junto al nombre del producto,
// así que describirla haría que el lector de pantalla lo lea dos veces.
function FotoProducto({ producto, className = '' }) {
  const portada = producto.imagenes?.[0]?.url

  if (!portada) {
    return (
      <div className={`foto-producto foto-producto-vacia ${className}`} aria-hidden="true">
        Sin foto
      </div>
    )
  }

  return <img src={portada} alt="" className={`foto-producto ${className}`} loading="lazy" />
}

export default FotoProducto