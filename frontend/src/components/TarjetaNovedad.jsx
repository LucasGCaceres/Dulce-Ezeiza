import { Link } from 'react-router-dom'
import FotoNovedad from './FotoNovedad'
import { formatearFecha, fechaParaTime } from '../utils/formato'
import './TarjetaNovedad.css'

// Tarjeta de una novedad (foto, fecha, título y resumen), que lleva a su
// detalle. La usan el listado de Novedades y "Otras novedades" del detalle.
function TarjetaNovedad({ novedad, conResumen = true }) {
  return (
    <Link to={`/novedades/${novedad.id}`} className="novedad-tarjeta">
      <FotoNovedad novedad={novedad} />
      <FechaNovedad iso={novedad.fechaPublicacion} />
      <span className="novedad-tarjeta-titulo">{novedad.titulo}</span>
      {conResumen && <span className="novedad-resumen">{novedad.resumen}</span>}
    </Link>
  )
}

// Fecha de publicación en un <time>: se lee "14 de octubre de 2026" y
// el atributo dateTime le da la fecha exacta a buscadores y lectores.
export function FechaNovedad({ iso }) {
  return (
    <time dateTime={fechaParaTime(iso)} className="novedad-fecha">
      {formatearFecha(iso)}
    </time>
  )
}

export default TarjetaNovedad