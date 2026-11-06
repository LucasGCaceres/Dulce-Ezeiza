// Página provisoria para las rutas que todavía no armamos.
// Se borra cuando estén todas las pantallas.
function EnConstruccion({ titulo }) {
  return (
    <div className="contenedor" style={{ padding: '72px 24px 96px' }}>
      <h1 style={{ fontFamily: 'var(--fuente-titulos)', margin: 0 }}>{titulo}</h1>
      <p style={{ color: 'var(--color-texto-tenue)' }}>Esta pantalla todavía está en construcción.</p>
    </div>
  )
}

export default EnConstruccion