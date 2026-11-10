import { Link } from 'react-router-dom'
import './NoEncontrado.css'

// Página 404. Se usa en dos casos:
// - una URL que no existe (la ruta "*" de App.jsx),
// - un producto o novedad que el backend no encuentra (/productos/999).
function NoEncontrado() {
  return (
    <div className="contenedor no-encontrado">
      {/* React 19 lleva este <title> solo al <head>: cambia el título de la pestaña. */}
      <title>Página no encontrada - Dulce Ezeiza</title>

      <div className="no-encontrado-texto">
        <p className="antetitulo">Error 404</p>
        <h1 className="no-encontrado-titulo">No encontramos esa página.</h1>
        <p className="no-encontrado-bajada">
          Puede que el link esté mal escrito o que el producto ya no esté en el catálogo.
        </p>
        <div className="no-encontrado-botones">
          <Link to="/catalogo" className="boton">Ver el catálogo</Link>
          <Link to="/" className="link-acento">Volver al inicio</Link>
        </div>
      </div>

      <img
        src="/img/sitio/medialuna-sola.svg"
        alt="Una medialuna sola sobre la mesa"
        className="no-encontrado-foto"
      />
    </div>
  )
}

export default NoEncontrado