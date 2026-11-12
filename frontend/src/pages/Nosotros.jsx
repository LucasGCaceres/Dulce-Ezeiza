import { Link } from 'react-router-dom'
import './Nosotros.css'

// ============================================================
//  Nosotros: /nosotros
//  Es la única página sin datos de la API: el backend no tiene una
//  entidad para "la historia del local", así que el texto es fijo.
//  (Dirección, horarios y teléfono ya están en el footer.)
// ============================================================

// Las tarjetas de "Cómo trabajamos". El tono elige el color de fondo.
const FORMAS_DE_TRABAJO = [
  {
    titulo: 'Horneamos todos los días',
    texto: 'Lo que ves en la vidriera salió del horno esa misma mañana.',
    tono: 'calido'
  },
  {
    titulo: 'Sin TACC, en un espacio aparte',
    texto: 'Utensilios y mesada propios para los productos aptos celíacos.',
    tono: 'claro'
  },
  {
    titulo: 'Encargos a medida',
    texto: 'Tortas de cumpleaños, docenas para la oficina o una mesa dulce. Lo charlamos por mail.',
    tono: 'oscuro'
  }
]

function Nosotros() {
  const [horneamos, sinTacc, encargos] = FORMAS_DE_TRABAJO

  return (
    <>
      <title>Nosotros - Dulce Ezeiza</title>

      <section className="contenedor nosotros-portada">
        <div className="nosotros-portada-texto">
          <p className="antetitulo">Nosotros</p>
          <h1 className="nosotros-titulo">Una panadería de barrio, de las de siempre.</h1>
          <p className="nosotros-bajada">
            Amasamos y horneamos en el local, todos los días, para los vecinos de Ezeiza.
          </p>
        </div>
        <img
          src="/img/sitio/horno.svg"
          alt="Horno de ladrillo encendido con panes adentro"
          className="nosotros-foto"
        />
      </section>

      <section aria-labelledby="titulo-historia" className="contenedor nosotros-historia">
        <img
          src="/img/sitio/mesa-de-trabajo.svg"
          alt="Mesa de trabajo con harina, masa, palo de amasar y espigas de trigo"
          className="nosotros-foto"
        />
        <div className="nosotros-historia-texto">
          <h2 id="titulo-historia" className="titulo-seccion">Cómo empezó</h2>
          <p>
            Abrimos hace más de diez años con un horno, una mesa de trabajo y las recetas de la familia.
            Empezamos con pan y medialunas, y de a poco sumamos tortas, tartas y pastelería.
          </p>
          <p>
            Cuando varios clientes nos pidieron opciones para celíacos, armamos un espacio aparte para
            elaborarlas sin contaminación cruzada.
          </p>
        </div>
      </section>

      <section aria-labelledby="titulo-como" className="contenedor nosotros-como">
        <h2 id="titulo-como" className="titulo-seccion nosotros-como-titulo">Cómo trabajamos</h2>

        {/* Grilla tipo "bento": 3 columnas, y la foto de la fachada ocupa 2. */}
        <div className="nosotros-grilla">
          <img
            src="/img/sitio/fachada.svg"
            alt="Fachada del local con la vidriera llena de pan y medialunas"
            className="nosotros-grilla-foto nosotros-grilla-ancha"
          />
          <TarjetaForma forma={horneamos} />
          <TarjetaForma forma={sinTacc} />
          <img
            src="/img/productos/pan-sin-gluten.svg"
            alt="Pan sin gluten sobre una tabla"
            className="nosotros-grilla-foto"
          />
          <TarjetaForma forma={encargos} />
        </div>
      </section>

      <section aria-labelledby="titulo-cta" className="nosotros-cta">
        <div className="contenedor nosotros-cta-interior">
          <h2 id="titulo-cta" className="titulo-seccion nosotros-cta-titulo">
            Pasá a probar algo, o escribinos antes.
          </h2>
          <div className="nosotros-cta-botones">
            <Link to="/catalogo" className="boton">Ver el catálogo</Link>
            <Link to="/contacto" className="boton boton-secundario">Escribinos</Link>
          </div>
        </div>
      </section>
    </>
  )
}

function TarjetaForma({ forma }) {
  return (
    <div className={`nosotros-tarjeta nosotros-tarjeta-${forma.tono}`}>
      <p className="nosotros-tarjeta-titulo">{forma.titulo}</p>
      <p>{forma.texto}</p>
    </div>
  )
}

export default Nosotros