import { useEffect, useRef } from 'react'
import './DialogoConfirmar.css'

// ============================================================
//  Ventana de confirmación ("¿Eliminar X?") con el <dialog> de HTML.
// ============================================================
// <dialog> abierto con showModal() ya hace solo lo difícil de una
// ventana modal: oscurece el fondo, no deja tocar lo de atrás, mantiene
// el foco adentro (Tab no se escapa) y se cierra con Esc.
//
// Props:
// - abierto: si se muestra o no (lo controla la página).
// - titulo, textoConfirmar: textos.
// - children: el cuerpo (explicación, mensaje de error, etc.).
// - onConfirmar / onCancelar: qué hacer con cada botón.
// - ocupado: mientras se procesa, los botones se deshabilitan.
// - peligroso: botón principal rojo (borrar) o normal (otras acciones).
function DialogoConfirmar({ abierto, titulo, textoConfirmar, children, onConfirmar, onCancelar, ocupado = false, peligroso = true }) {
  const referencia = useRef(null)

  // React no tiene una prop para "abrir modal": hay que llamar al método
  // showModal() del elemento. useRef nos da el elemento real del DOM, y
  // el efecto sincroniza la prop "abierto" con el estado del <dialog>.
  useEffect(() => {
    const dialogo = referencia.current
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  // Esc dispara el evento "cancel". Lo frenamos para que el que decida
  // cerrar sea siempre la página (y no se cierre a mitad de una operación).
  function alCancelar(evento) {
    evento.preventDefault()
    if (!ocupado) onCancelar()
  }

  return (
    <dialog ref={referencia} className="dialogo" aria-labelledby="dialogo-titulo" onCancel={alCancelar}>
      <h2 id="dialogo-titulo" className="dialogo-titulo">{titulo}</h2>
      <div className="dialogo-cuerpo">{children}</div>
      <div className="dialogo-acciones">
        <button type="button" className="boton boton-secundario" onClick={onCancelar} disabled={ocupado}>
          Cancelar
        </button>
        <button type="button" className={peligroso ? 'boton boton-peligro' : 'boton'} onClick={onConfirmar} disabled={ocupado}>
          {ocupado ? 'Un momento...' : textoConfirmar}
        </button>
      </div>
    </dialog>
  )
}

export default DialogoConfirmar