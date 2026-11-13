import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { usePedido } from '../../hooks/usePedido'
import { obtenerTodasLasNovedades, editarNovedad, eliminarNovedad, estadoNovedad } from '../../services/novedades'
import ErrorCarga from '../../components/ErrorCarga'
import FotoNovedad from '../../components/FotoNovedad'
import DialogoConfirmar from '../../components/admin/DialogoConfirmar'
import EstadoNovedad from '../../components/admin/EstadoNovedad'
import { formatearFechaHora } from '../../utils/formato'
import './AdminNovedades.css'

const FILTROS = [
  { valor: 'todas', texto: 'Todas' },
  { valor: 'publicada', texto: 'Publicadas' },
  { valor: 'programada', texto: 'Programadas' },
  { valor: 'borrador', texto: 'Borradores' }
]

// ============================================================
//  /admin/novedades — listado con todas: publicadas, programadas
//  (publicadas con fecha futura) y borradores.
// ============================================================

function AdminNovedades() {
  const location = useLocation()
  const novedades = usePedido(obtenerTodasLasNovedades)
  const lista = novedades.datos ?? novedades.ultimosDatos

  const [filtro, setFiltro] = useState('todas')
  const [aviso, setAviso] = useState(location.state?.aviso ? { tipo: 'ok', texto: location.state.aviso } : null)
  const [cambiando, setCambiando] = useState(null)
  const [aBorrar, setABorrar] = useState(null)
  const [borrando, setBorrando] = useState(false)

  // Cuántas hay de cada estado, para los números de las pestañas.
  const cantidades = { todas: lista?.length ?? 0, publicada: 0, programada: 0, borrador: 0 }
  for (const novedad of lista ?? []) cantidades[estadoNovedad(novedad)]++

  const filtradas = (lista ?? []).filter((n) => filtro === 'todas' || estadoNovedad(n) === filtro)

  // Publicar un borrador / pasar a borrador una publicada, sin abrir el editor.
  async function alternarPublicada(novedad) {
    setCambiando(novedad.id)
    setAviso(null)
    try {
      await editarNovedad(novedad.id, { publicada: !novedad.publicada })
      setAviso({
        tipo: 'ok',
        texto: novedad.publicada
          ? `"${novedad.titulo}" volvió a borrador: ya no se ve en el sitio.`
          : `Se publicó "${novedad.titulo}".`
      })
      novedades.reintentar()
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message })
    } finally {
      setCambiando(null)
    }
  }

  async function confirmarBorrado() {
    setBorrando(true)
    try {
      await eliminarNovedad(aBorrar.id)
      setAviso({ tipo: 'ok', texto: `Se eliminó "${aBorrar.titulo}".` })
      novedades.reintentar()
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message })
    } finally {
      setABorrar(null)
      setBorrando(false)
    }
  }

  if (novedades.error && !lista) {
    return <ErrorCarga titulo="No pudimos cargar las novedades." onReintentar={novedades.reintentar} />
  }

  return (
    <div className="admin-novedades">
      <title>Novedades - Panel Dulce Ezeiza</title>

      <div className="admin-novedades-encabezado">
        <div>
          <h1 className="panel-titulo">Novedades</h1>
          <p className="panel-bajada">Avisos, lanzamientos y fechas especiales que se ven en el sitio.</p>
        </div>
        <Link to="/admin/novedades/nueva" className="boton">Nueva novedad</Link>
      </div>

      {aviso && (
        <div role={aviso.tipo === 'error' ? 'alert' : 'status'} className={`admin-aviso admin-aviso-${aviso.tipo}`}>
          <span>{aviso.texto}</span>
          <button type="button" onClick={() => setAviso(null)} aria-label="Cerrar aviso">×</button>
        </div>
      )}

      {/* Pestañas de filtro: son botones con aria-pressed (botón "apretado"),
          porque solo filtran la tabla de abajo. */}
      <div className="admin-novedades-filtros" role="group" aria-label="Filtrar por estado">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            type="button"
            aria-pressed={filtro === f.valor}
            className={filtro === f.valor ? 'filtro-pildora activa' : 'filtro-pildora'}
            onClick={() => setFiltro(f.valor)}
          >
            {f.texto} <span className="filtro-cantidad">{lista ? cantidades[f.valor] : '…'}</span>
          </button>
        ))}
      </div>

      {!lista ? (
        <div className="esqueleto" style={{ height: 400 }} aria-label="Cargando" />
      ) : (
        <div className="admin-tabla-contenedor">
          <table className="admin-tabla">
            <thead>
              <tr>
                <th scope="col">Novedad</th>
                <th scope="col">Estado</th>
                <th scope="col">Fecha de publicación</th>
                <th scope="col"><span className="solo-lector">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((novedad) => (
                <tr key={novedad.id} className={novedad.publicada ? '' : 'fila-apagada'}>
                  <td>
                    <div className="admin-novedad-celda">
                      <FotoNovedad novedad={novedad} className="admin-novedad-foto" />
                      <span>
                        <Link to={`/admin/novedades/${novedad.id}`} className="admin-novedad-titulo">{novedad.titulo}</Link>
                        <span className="admin-novedad-resumen">{novedad.resumen}</span>
                      </span>
                    </div>
                  </td>
                  <td><EstadoNovedad novedad={novedad} /></td>
                  <td className="admin-novedad-fecha">{formatearFechaHora(novedad.fechaPublicacion)}</td>
                  <td>
                    <div className="admin-novedad-acciones">
                      <button type="button" className="boton boton-secundario boton-chico"
                        onClick={() => alternarPublicada(novedad)} disabled={cambiando === novedad.id}>
                        {novedad.publicada ? 'Pasar a borrador' : 'Publicar'}
                      </button>
                      <Link to={`/admin/novedades/${novedad.id}`} className="boton boton-secundario boton-chico">Editar</Link>
                      <button type="button" className="admin-enlace-peligro" onClick={() => { setABorrar(novedad); setAviso(null) }}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtradas.length === 0 && <p className="admin-tabla-vacia">No hay novedades en este estado.</p>}
        </div>
      )}

      <DialogoConfirmar
        abierto={aBorrar !== null}
        titulo={`¿Eliminar "${aBorrar?.titulo}"?`}
        textoConfirmar="Eliminar"
        onConfirmar={confirmarBorrado}
        onCancelar={() => setABorrar(null)}
        ocupado={borrando}
      >
        <p>No se puede deshacer. Si solo querés sacarla del sitio, pasala a borrador.</p>
      </DialogoConfirmar>
    </div>
  )
}

export default AdminNovedades