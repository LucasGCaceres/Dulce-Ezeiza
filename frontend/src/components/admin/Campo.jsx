import { cloneElement } from 'react'

// ============================================================
//  Un campo de formulario: etiqueta + control + ayuda o error.
// ============================================================
// El control (input, textarea o select) llega como children, y
// cloneElement le agrega lo que todos necesitan: id, clase, y los
// atributos aria que conectan el control con su mensaje.
//
//   <Campo id="local-nombre" etiqueta="Nombre" error={errores.nombre}>
//     <input type="text" value={...} onChange={...} />
//   </Campo>
function Campo({ id, etiqueta, opcional = false, ayuda, error, children }) {
  const idDescripcion = error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined
  return (
    <div className="campo">
      <label htmlFor={id} className="campo-etiqueta">
        {etiqueta} {opcional && <span className="campo-opcional">(opcional)</span>}
      </label>
      {cloneElement(children, {
        id,
        className: error ? 'campo-control con-error' : 'campo-control',
        'aria-invalid': error ? true : undefined,
        'aria-describedby': idDescripcion
      })}
      {error
        ? <span id={`${id}-error`} className="campo-error">{error}</span>
        : ayuda && <span id={`${id}-ayuda`} className="campo-ayuda">{ayuda}</span>}
    </div>
  )
}

export default Campo