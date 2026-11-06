import { useEffect, useState } from 'react'

// ============================================================
//  Hook para pedir datos a un service y seguir su estado.
// ============================================================
// Todas las pantallas hacen lo mismo: pedir datos al montarse,
// mostrar "cargando", y después los datos o un error con
// "Reintentar". En vez de repetir esos useState y useEffect en
// cada página, se escriben una vez acá.
//
// Uso:
//   const { datos, cargando, error, reintentar } = usePedido(obtenerComercio)
//   const { datos } = usePedido(() => obtenerProductos(filtros), [filtros])
//
// - pedido: función que devuelve una Promise (un service).
// - dependencias: si alguna cambia, se vuelve a pedir (igual que
//   el array de useEffect).

export function usePedido(pedido, dependencias = []) {
  const [intento, setIntento] = useState(0)
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: null })

  // Cada combinación de dependencias + intento forma una "clave".
  // Si la clave del último resultado no es la actual, es porque
  // todavía estamos esperando la respuesta: o sea, cargando.
  const clave = JSON.stringify([...dependencias, intento])

  useEffect(() => {
    // Si el componente se desmonta (o cambian las dependencias)
    // antes de que llegue la respuesta, la ignoramos. Si no, una
    // respuesta vieja podría pisar a una más nueva.
    let vigente = true

    pedido()
      .then((datos) => {
        if (vigente) setResultado({ clave, datos, error: null })
      })
      .catch((error) => {
        if (vigente) setResultado({ clave, datos: null, error })
      })

    return () => {
      vigente = false
    }
    // La clave ya resume las dependencias: no hace falta listar
    // `pedido`, que es una función nueva en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave])

  const cargando = resultado.clave !== clave

  return {
    datos: cargando ? null : resultado.datos,
    error: cargando ? null : resultado.error,
    cargando,
    reintentar: () => setIntento((n) => n + 1)
  }
}