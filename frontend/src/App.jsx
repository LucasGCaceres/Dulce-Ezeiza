import { Routes, Route } from 'react-router-dom'
import LayoutPublico from './components/LayoutPublico'
import EnConstruccion from './pages/EnConstruccion'
import Inicio from './pages/Inicio'
import Catalogo from './pages/Catalogo'
import DetalleProducto from './pages/DetalleProducto'
import NoEncontrado from './pages/NoEncontrado'
import Contacto from './pages/Contacto'
import Novedades from './pages/Novedades'
import DetalleNovedad from './pages/DetalleNovedad'

// Rutas del sitio. Las páginas se van reemplazando a medida que
// las armamos; por ahora casi todas muestran "en construcción".
function App() {
  return (
    <Routes>
      {/* Ruta "padre" sin path: todas las de adentro se dibujan
          dentro del LayoutPublico (Navbar + página + Footer). */}
      <Route element={<LayoutPublico />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/productos/:id" element={<DetalleProducto />} />
        <Route path="/novedades" element={<Novedades />} />
        <Route path="/novedades/:id" element={<DetalleNovedad />} />
        <Route path="/nosotros" element={<EnConstruccion titulo="Nosotros" />} />
        <Route path="/contacto" element={<Contacto />} />
        {/* "*" atrapa cualquier URL que no coincida con las de arriba. */}
        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  )
}

export default App