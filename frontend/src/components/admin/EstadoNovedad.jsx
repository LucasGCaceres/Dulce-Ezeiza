import { estadoNovedad } from '../../services/novedades'

// Etiqueta con el estado de una novedad. La usan el listado y el editor.
function EstadoNovedad({ novedad }) {
  const estado = estadoNovedad(novedad)
  if (estado === 'borrador') return <span className="etiqueta etiqueta-apagada">Borrador</span>
  // Programada: el cuándo ya se ve al lado (columna Fecha, o el texto del editor).
  if (estado === 'programada') return <span className="etiqueta">Programada</span>
  return <span className="admin-estado-activo">Publicada</span>
}

export default EstadoNovedad