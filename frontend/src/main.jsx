import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import SesionProvider from './context/SesionProvider'
import './index.css'
import App from './App.jsx'

// SesionProvider envuelve a App: así cualquier pantalla puede saber si
// hay un admin logueado (con useSesion). Va adentro de BrowserRouter
// por si algún día necesita navegar.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SesionProvider>
        <App />
      </SesionProvider>
    </BrowserRouter>
  </StrictMode>,
)