import './Interruptor.css'

// Interruptor de encendido/apagado (como los de la configuración del
// celular). Es un <button> con role="switch": el lector de pantalla lo
// anuncia como "interruptor, activado" o "desactivado" (aria-checked).
// etiqueta: texto para el lector de pantalla, porque visualmente no tiene.
function Interruptor({ encendido, onCambiar, etiqueta, deshabilitado = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={encendido}
      aria-label={etiqueta}
      onClick={onCambiar}
      disabled={deshabilitado}
      className={encendido ? 'interruptor encendido' : 'interruptor'}
    >
      <span className="interruptor-perilla" aria-hidden="true" />
    </button>
  )
}

export default Interruptor