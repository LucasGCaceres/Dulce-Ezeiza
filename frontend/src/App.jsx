import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import FondoDecorativo from './components/FondoDecorativo'
import Inicio from './pages/Inicio'
import Catalogo from './pages/Catalogo'
import DetalleProducto from './pages/DetalleProducto'
import Nosotros from './pages/Nosotros'
import Contacto from './pages/Contacto'
import './App.css'

function App() {
  return (
    <>
      <FondoDecorativo />
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/productos/:id" element={<DetalleProducto />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/contacto" element={<Contacto />} />
      </Routes>
    </>
  )
}

export default App