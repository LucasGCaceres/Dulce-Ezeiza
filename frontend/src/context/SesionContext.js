import { createContext } from 'react'

// El "contexto" de la sesión: una caja que el SesionProvider llena con
// { usuario, iniciarSesion, cerrarSesion, motivoSalida } y que cualquier
// componente de adentro puede leer con useSesion(), sin pasarlo por props.
//
// Está en un archivo aparte del Provider por una regla de Vite: un archivo
// .jsx que exporta componentes no debería exportar otras cosas, o la
// recarga en caliente (cuando guardás y el navegador se actualiza solo)
// deja de funcionar bien.
export const SesionContext = createContext(null)