import { Routes, Route } from 'react-router-dom'
import LayoutPublico from './components/LayoutPublico'
import Inicio from './pages/Inicio'
import Catalogo from './pages/Catalogo'
import DetalleProducto from './pages/DetalleProducto'
import Novedades from './pages/Novedades'
import DetalleNovedad from './pages/DetalleNovedad'
import Nosotros from './pages/Nosotros'
import Contacto from './pages/Contacto'
import NoEncontrado from './pages/NoEncontrado'
import RutaProtegida from './components/RutaProtegida'
import LayoutAdmin from './components/admin/LayoutAdmin'
import AdminLogin from './pages/admin/AdminLogin'
import AdminInicio from './pages/admin/AdminInicio'
import PanelEnConstruccion from './pages/admin/PanelEnConstruccion'
import AdminConsultas from './pages/admin/AdminConsultas'
import AdminProductos from './pages/admin/AdminProductos'
import AdminProductoForm from './pages/admin/AdminProductoForm'

function App() {
  return (
    <Routes>
      {/* ---------- Sitio público ---------- */}
      {/* Ruta "padre" sin path: todas las de adentro se dibujan
          dentro del LayoutPublico (Navbar + página + Footer). */}
      <Route element={<LayoutPublico />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/productos/:id" element={<DetalleProducto />} />
        <Route path="/novedades" element={<Novedades />} />
        <Route path="/novedades/:id" element={<DetalleNovedad />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/contacto" element={<Contacto />} />
        {/* "*" atrapa cualquier URL que no coincida con las de arriba. */}
        <Route path="*" element={<NoEncontrado />} />
      </Route>

      {/* ---------- Panel admin ---------- */}
      {/* El login va solo, sin layout: es una pantalla completa. */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Todo lo demás de /admin pasa primero por RutaProtegida
          (si no hay sesión, al login) y se dibuja dentro del LayoutAdmin. */}
      <Route
        path="/admin"
        element={
          <RutaProtegida>
            <LayoutAdmin />
          </RutaProtegida>
        }
      >
        {/* index = la ruta exacta del padre: /admin */}
        <Route index element={<AdminInicio />} />
        {/* Rutas relativas al padre: "consultas" = /admin/consultas */}
        <Route path="consultas" element={<AdminConsultas />} />
        <Route path="productos" element={<AdminProductos />} />
        <Route path="productos/nuevo" element={<AdminProductoForm />} />
        <Route path="productos/:id" element={<AdminProductoForm />} />
        <Route path="*" element={<PanelEnConstruccion />} />
      </Route>
    </Routes>
  )
}

export default App