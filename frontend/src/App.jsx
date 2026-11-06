import { Routes, Route } from 'react-router-dom'
import LayoutPublico from './components/LayoutPublico'
import EnConstruccion from './pages/EnConstruccion'
import Inicio from './pages/Inicio'

// Rutas del sitio. Las páginas se van reemplazando a medida que
// las armamos; por ahora casi todas muestran "en construcción".
function App() {
  return (
    <Routes>
      {/* Ruta "padre" sin path: todas las de adentro se dibujan
          dentro del LayoutPublico (Navbar + página + Footer). */}
      <Route element={<LayoutPublico />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/catalogo" element={<EnConstruccion titulo="Catálogo" />} />
        <Route path="/productos/:id" element={<EnConstruccion titulo="Detalle de producto" />} />
        <Route path="/novedades" element={<EnConstruccion titulo="Novedades" />} />
        <Route path="/novedades/:id" element={<EnConstruccion titulo="Detalle de novedad" />} />
        <Route path="/nosotros" element={<EnConstruccion titulo="Nosotros" />} />
        <Route path="/contacto" element={<EnConstruccion titulo="Contacto" />} />
        {/* "*" atrapa cualquier URL que no coincida con las de arriba. */}
        <Route path="*" element={<EnConstruccion titulo="404" />} />
      </Route>
    </Routes>
  )
}

export default App