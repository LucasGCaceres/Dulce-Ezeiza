import './ErrorCarga.css'

// Caja que se muestra cuando falla un pedido a la API, con el botón
// para reintentar. La usan todas las páginas que cargan datos.
// role="alert" hace que el lector de pantalla la anuncie apenas aparece.
function ErrorCarga({ titulo, onReintentar }) {
  return (
    <div role="alert" className="error-carga">
      <p className="error-carga-titulo">{titulo}</p>
      <p className="error-carga-texto">Revisá tu conexión y probá de nuevo en unos segundos.</p>
      <button type="button" className="boton" onClick={onReintentar}>
        Reintentar
      </button>
    </div>
  )
}

export default ErrorCarga