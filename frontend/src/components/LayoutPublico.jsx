import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import './LayoutPublico.css'

// Marco común de todas las páginas del sitio público.
// <Outlet /> es el "hueco" donde React Router dibuja la página que
// corresponde a la URL. Así Navbar y Footer se escriben una sola vez.
function LayoutPublico() {
  const { pathname } = useLocation()

  // En una SPA el navegador no recarga la página al cambiar de ruta,
  // así que no vuelve solo al principio: lo hacemos nosotros.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="layout-publico">
      <Navbar />
      <main className="layout-contenido">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default LayoutPublico