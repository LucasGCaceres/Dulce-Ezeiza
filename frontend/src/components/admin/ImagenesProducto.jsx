import { useState } from 'react'
import { urlImagenValida } from '../../utils/urls'
import './ImagenesProducto.css'

// Largo de la columna url en la tabla ImagenesProducto.
const LARGO_URL = 500

// ============================================================
//  Lista de imágenes de un producto: agregar por URL, quitar y ordenar.
//  No sabe si los cambios van al backend o quedan en memoria: eso lo
//  decide quien lo usa, a través de "acciones" { agregar, quitar, reordenar }.
// ============================================================
function ImagenesProducto({ imagenes, acciones, seGuardanAlInstante }) {
  const [nuevaUrl, setNuevaUrl] = useState('')
  const [errorUrl, setErrorUrl] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  // Envuelve cada acción: deshabilita los botones mientras corre y
  // muestra el error si falla.
  async function ejecutar(accion) {
    setOcupado(true)
    setError(null)
    try {
      await accion()
    } catch (e) {
      setError(e.message)
    } finally {
      setOcupado(false)
    }
  }

  function agregar() {
    const url = nuevaUrl.trim()
    if (!urlImagenValida(url)) {
      setErrorUrl('Pegá una dirección que empiece con https:// (o /img/... si está en el sitio).')
      return
    }
    if (imagenes.some((i) => i.url === url)) {
      setErrorUrl('Esa imagen ya está en la lista.')
      return
    }
    setErrorUrl(null)
    ejecutar(async () => {
      await acciones.agregar(url)
      setNuevaUrl('')
    })
  }

  // Mueve la imagen de la posición "desde" una lugar arriba (-1) o abajo (+1).
  function mover(desde, direccion) {
    const hasta = desde + direccion
    const nuevaLista = [...imagenes]
    // Intercambio de dos posiciones con desestructuración.
    ;[nuevaLista[desde], nuevaLista[hasta]] = [nuevaLista[hasta], nuevaLista[desde]]
    ejecutar(() => acciones.reordenar(nuevaLista))
  }

  return (
    <section aria-labelledby="titulo-imagenes" className="admin-caja imagenes-producto">
      <h2 id="titulo-imagenes" className="admin-caja-titulo">Imágenes</h2>
      <p className="campo-ayuda">
        La primera es la portada en el catálogo.
        {seGuardanAlInstante && ' Los cambios de esta sección se guardan al instante.'}
      </p>

      {error && <p role="alert" className="imagenes-error">{error}</p>}

      {imagenes.length === 0 ? (
        <p className="imagenes-vacio">Sin imágenes. En el sitio se muestra un recuadro "Sin foto".</p>
      ) : (
        <ol className="imagenes-lista">
          {imagenes.map((imagen, indice) => (
            <li key={imagen.id} className="imagen-item">
              <Miniatura url={imagen.url} />
              <span className="imagen-etiqueta">{indice === 0 ? 'Portada' : `Foto ${indice + 1}`}</span>
              <div className="imagen-botones">
                <button type="button" onClick={() => mover(indice, -1)} disabled={ocupado || indice === 0}
                  aria-label={`Subir imagen ${indice + 1}`}>↑</button>
                <button type="button" onClick={() => mover(indice, 1)} disabled={ocupado || indice === imagenes.length - 1}
                  aria-label={`Bajar imagen ${indice + 1}`}>↓</button>
                <button type="button" onClick={() => ejecutar(() => acciones.quitar(imagen))} disabled={ocupado}
                  className="admin-enlace-peligro" aria-label={`Quitar imagen ${indice + 1}`}>Quitar</button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="campo">
        <label htmlFor="nueva-url" className="campo-etiqueta">Agregar imagen por URL</label>
        <div className="imagenes-agregar">
          <input
            id="nueva-url"
            type="url"
            placeholder="https://..."
            maxLength={LARGO_URL}
            value={nuevaUrl}
            onChange={(e) => setNuevaUrl(e.target.value)}
            // Enter agrega la imagen (y no envía el formulario del producto).
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                agregar()
              }
            }}
            className={errorUrl ? 'campo-control con-error' : 'campo-control'}
            aria-invalid={errorUrl ? true : undefined}
            aria-describedby={errorUrl ? 'nueva-url-error' : undefined}
          />
          <button type="button" className="boton boton-secundario" onClick={agregar} disabled={ocupado || !nuevaUrl.trim()}>
            Agregar
          </button>
        </div>
        {errorUrl && <span id="nueva-url-error" className="campo-error">{errorUrl}</span>}
      </div>
    </section>
  )
}

// Miniatura que avisa si la URL no carga (link roto, no es una imagen...).
function Miniatura({ url }) {
  const [rota, setRota] = useState(false)
  if (rota) return <span className="imagen-miniatura imagen-rota">No carga</span>
  return <img src={url} alt="" className="imagen-miniatura" onError={() => setRota(true)} />
}

export default ImagenesProducto