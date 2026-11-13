import { useState } from 'react'
import { usePedido } from '../../hooks/usePedido'
import { obtenerComercio, editarComercio } from '../../services/comercio'
import ErrorCarga from '../../components/ErrorCarga'
import Campo from '../../components/admin/Campo'
import { REDES } from '../../utils/redes'
import './AdminComercio.css'

// Los campos que se editan, con el largo de su columna en la tabla Comercio.
const LARGO = {
  nombre: 150, descripcion: 1000, direccion: 300, telefono: 50, horarios: 500,
  instagram: 150, facebook: 150, whatsapp: 50, tiktok: 150
}
const CAMPOS = Object.keys(LARGO)

// Ayuda y ejemplo de cada red: el backend guarda solo el usuario.
const AYUDA_REDES = {
  instagram: { ayuda: 'Solo el usuario, con o sin @.', ejemplo: '@dulceezeiza' },
  facebook: { ayuda: 'Lo que va después de facebook.com/ en la dirección de la página.', ejemplo: 'dulceezeiza' },
  tiktok: { ayuda: 'Solo el usuario, con o sin @.', ejemplo: '@dulceezeiza' },
  whatsapp: { ayuda: 'Con código de país y de área (54 9 11...). Los espacios y guiones no importan.', ejemplo: '54 9 11 2345-6789' }
}

// ============================================================
//  /admin/configuracion — los datos del local (una sola fila en la
//  base). Se ven en el pie de todas las páginas y en Contacto.
// ============================================================

function AdminComercio() {
  const comercio = usePedido(obtenerComercio)

  if (comercio.error) {
    return <ErrorCarga titulo="No pudimos cargar los datos del local." onReintentar={comercio.reintentar} />
  }
  if (!comercio.datos) return <div className="esqueleto" style={{ height: 520 }} aria-label="Cargando" />

  return <FormularioComercio comercio={comercio.datos} />
}

// null → '' (los inputs no aceptan null como valor).
function aValores(comercio) {
  const valores = {}
  for (const campo of CAMPOS) valores[campo] = comercio[campo] ?? ''
  return valores
}

function FormularioComercio({ comercio }) {
  // "original" = lo que está guardado en la base. Comparando contra eso
  // sabemos si hay cambios sin guardar.
  const [original, setOriginal] = useState(() => aValores(comercio))
  const [valores, setValores] = useState(original)
  const [intentoGuardar, setIntentoGuardar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState(null)

  const huboCambios = CAMPOS.some((campo) => valores[campo] !== original[campo])

  function cambiar(evento) {
    const { name, value } = evento.target
    setValores((anteriores) => ({ ...anteriores, [name]: value }))
    setAviso(null)
  }

  // ---------- Validación ----------
  const errores = {}
  if (intentoGuardar && !valores.nombre.trim()) errores.nombre = 'El local necesita un nombre.'
  for (const { campo } of REDES) {
    const valor = valores[campo].trim()
    if (!valor) continue
    if (campo === 'whatsapp') {
      // Solo números, espacios, +, guiones y paréntesis; y al menos 10 dígitos.
      if (/[^\d\s+()-]/.test(valor) || valor.replace(/\D/g, '').length < 10) {
        errores.whatsapp = 'Escribí el número completo, por ejemplo 54 9 11 2345-6789.'
      }
    } else if (valor.includes('/') || valor.includes(' ')) {
      // Si pegaron la dirección entera, el link quedaría mal armado.
      errores[campo] = 'Poné solo el usuario, sin "https://..." ni espacios.'
    }
  }
  const hayErrores = Object.keys(errores).length > 0

  async function guardar(evento) {
    evento.preventDefault()
    setIntentoGuardar(true)
    setAviso(null)
    if (!valores.nombre.trim() || hayErrores) {
      const primero = errores.nombre || !valores.nombre.trim() ? 'nombre' : Object.keys(errores)[0]
      document.getElementById(`local-${primero}`)?.focus()
      return
    }

    // Se mandan todos los campos, con '' en los vacíos: el backend usa
    // "?? valorViejo", así que un null dejaría el dato anterior.
    const datos = {}
    for (const campo of CAMPOS) datos[campo] = valores[campo].trim()

    setGuardando(true)
    try {
      await editarComercio(datos)
      setValores(datos)     // sin los espacios de más que sacó el trim
      setOriginal(datos)    // lo guardado pasa a ser el nuevo "original"
      setIntentoGuardar(false)
      setAviso({ tipo: 'ok', texto: 'Listo: los cambios ya se ven en el sitio.' })
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message })
    } finally {
      setGuardando(false)
    }
  }

  function descartar() {
    setValores(original)
    setIntentoGuardar(false)
    setAviso(null)
  }

  return (
    <div className="admin-comercio">
      <title>Datos del local - Panel Dulce Ezeiza</title>

      <div>
        <h1 className="panel-titulo">Datos del local</h1>
        <p className="panel-bajada">Se ven en el pie de todas las páginas y en Contacto.</p>
      </div>

      {aviso && (
        <div role={aviso.tipo === 'error' ? 'alert' : 'status'} className={`admin-aviso admin-aviso-${aviso.tipo}`}>
          <span>{aviso.texto}</span>
          <button type="button" onClick={() => setAviso(null)} aria-label="Cerrar aviso">×</button>
        </div>
      )}

      <form onSubmit={guardar} noValidate className="admin-comercio-form">
        <div className="admin-comercio-columnas">
          <section aria-labelledby="titulo-local" className="admin-caja admin-comercio-caja">
            <h2 id="titulo-local" className="admin-caja-titulo">El local</h2>

            <Campo id="local-nombre" etiqueta="Nombre" error={errores.nombre}>
              <input type="text" name="nombre" maxLength={LARGO.nombre} value={valores.nombre} onChange={cambiar} />
            </Campo>
            <Campo id="local-descripcion" etiqueta="Descripción corta" opcional
              ayuda="Una frase que aparece debajo del nombre, en el pie de página.">
              <textarea name="descripcion" rows={2} maxLength={LARGO.descripcion} value={valores.descripcion} onChange={cambiar} />
            </Campo>
            <Campo id="local-direccion" etiqueta="Dirección" opcional
              ayuda="Con la localidad: se usa también para el mapa y el botón «Cómo llegar».">
              <input type="text" name="direccion" maxLength={LARGO.direccion} value={valores.direccion} onChange={cambiar} />
            </Campo>
            <Campo id="local-telefono" etiqueta="Teléfono" opcional
              ayuda="Como querés que se lea. En el celular, tocarlo abre el marcador.">
              <input type="tel" name="telefono" maxLength={LARGO.telefono} value={valores.telefono} onChange={cambiar} />
            </Campo>
            <Campo id="local-horarios" etiqueta="Horarios" opcional
              ayuda="Texto libre. Cada renglón se muestra en un renglón aparte.">
              <textarea name="horarios" rows={3} maxLength={LARGO.horarios} value={valores.horarios} onChange={cambiar} />
            </Campo>
          </section>

          <section aria-labelledby="titulo-redes" className="admin-caja admin-comercio-caja">
            <h2 id="titulo-redes" className="admin-caja-titulo">Redes sociales</h2>
            <p className="campo-ayuda admin-comercio-intro">
              Las que dejes vacías no aparecen en el sitio.
            </p>

            {REDES.map((red) => {
              const valor = valores[red.campo].trim()
              return (
                <div key={red.campo} className="admin-comercio-red">
                  <Campo id={`local-${red.campo}`} etiqueta={red.nombre} opcional
                    error={errores[red.campo]} ayuda={AYUDA_REDES[red.campo].ayuda}>
                    <input type="text" name={red.campo} maxLength={LARGO[red.campo]}
                      placeholder={AYUDA_REDES[red.campo].ejemplo}
                      value={valores[red.campo]} onChange={cambiar} />
                  </Campo>
                  {/* El mismo armado de link que usa el Footer: lo que ves acá
                      es exactamente a donde va a llevar en el sitio. */}
                  {valor && !errores[red.campo] && (
                    <a href={red.url(valor)} target="_blank" rel="noreferrer" className="admin-comercio-probar">
                      Probar el link: {red.url(valor)}
                    </a>
                  )}
                </div>
              )
            })}
          </section>
        </div>

        {/* Barra de guardar: queda pegada abajo mientras scrolleás. */}
        <div className="admin-comercio-barra">
          <span className="admin-comercio-estado" aria-live="polite">
            {huboCambios ? 'Tenés cambios sin guardar.' : 'Todo guardado.'}
          </span>
          <button type="button" className="boton boton-secundario" onClick={descartar} disabled={!huboCambios || guardando}>
            Descartar cambios
          </button>
          <button type="submit" className="boton" disabled={!huboCambios || guardando}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminComercio