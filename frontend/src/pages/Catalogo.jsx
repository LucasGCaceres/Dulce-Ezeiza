import { useState, useEffect } from 'react'
import { obtenerProductos } from '../services/productos'
import './Catalogo.css'

function agruparPorCategoria(productos) {
  const grupos = {}
  productos.forEach((producto) => {
    const categoria = producto.Categorium?.nombre || 'Otros'
    if (!grupos[categoria]) {
      grupos[categoria] = []
    }
    grupos[categoria].push(producto)
  })
  return grupos
}

function Catalogo() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('Todas')

  useEffect(() => {
    obtenerProductos({ soloActivos: true })
      .then((datos) => {
        setProductos(datos)
        setCargando(false)
      })
      .catch((err) => {
        setError(err.message)
        setCargando(false)
      })
  }, [])

  if (cargando) return <p className="catalogo-estado">Cargando productos...</p>
  if (error) return <p className="catalogo-estado">Hubo un error: {error}</p>

  const categorias = ['Todas', ...new Set(productos.map((p) => p.Categorium?.nombre || 'Otros'))]

  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaActiva === 'Todas' || producto.Categorium?.nombre === categoriaActiva
    return coincideBusqueda && coincideCategoria
  })

  const grupos = agruparPorCategoria(productosFiltrados)
  const hayResultados = productosFiltrados.length > 0

  return (
    <div>
      <section className="catalogo-hero">
        <div className="catalogo-hero-overlay">
          <h1>Nuestro Catálogo</h1>
          <p>Pan, facturas, tortas y pastelería, horneados todos los días en Ezeiza.</p>
        </div>
      </section>

      <div className="catalogo-contenido">
        <div className="catalogo-controles">
          <input
            type="text"
            placeholder="Buscar un producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="catalogo-buscador"
          />
          <div className="catalogo-filtros">
            {categorias.map((categoria) => (
              <button
                key={categoria}
                className={`filtro-pill ${categoriaActiva === categoria ? 'filtro-pill-activo' : ''}`}
                onClick={() => setCategoriaActiva(categoria)}
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>

        {!hayResultados && (
          <p className="catalogo-estado">No encontramos productos que coincidan con la búsqueda.</p>
        )}

        {Object.entries(grupos).map(([categoria, items]) => (
          <section key={categoria} className="catalogo-categoria">
            <h2>{categoria}</h2>
            <ul className="catalogo-lista">
              {items.map((producto) => (
                <li
                  key={producto.id}
                  className={`catalogo-item ${!producto.disponible ? 'catalogo-item-agotado' : ''}`}
                >
                  <div className="item-fila">
                    <span className="item-nombre">
                      {producto.nombre}
                      {producto.destacado && <span className="badge badge-destacado">Destacado</span>}
                      {producto.sinGluten && <span className="badge badge-sin-gluten">Sin gluten</span>}
                    </span>
                    <span className="item-linea"></span>
                    <span className="item-precio">
                      {producto.disponible ? `` : 'Agotado'}
                    </span>
                  </div>
                  <p className="item-descripcion">{producto.descripcion}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

export default Catalogo