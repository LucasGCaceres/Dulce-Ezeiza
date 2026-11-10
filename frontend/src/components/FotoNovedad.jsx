import './FotoNovedad.css'

// Imagen de una novedad. imagenUrl es opcional en el backend (en el
// seed ninguna tiene), así que si no hay, dibujamos un recuadro con el
// nombre del local para que la grilla de tarjetas no quede despareja.
// alt="" porque siempre va acompañada del título de la novedad.
function FotoNovedad({ novedad, className = '' }) {
  if (!novedad.imagenUrl) {
    return (
      <div className={`foto-novedad foto-novedad-vacia ${className}`} aria-hidden="true">
        Dulce Ezeiza
      </div>
    )
  }
  return <img src={novedad.imagenUrl} alt="" className={`foto-novedad ${className}`} loading="lazy" />
}

export default FotoNovedad