const novedadService = require('../services/Novedad.service');

// Largos maximos: los mismos que las columnas de la tabla Novedades.
// contenido es NVARCHAR(MAX) en la base (sin limite real); el tope de
// aca es nuestro, para que nadie mande un texto de varios megas.
const LARGO_MAXIMO = {
    titulo: 150,
    resumen: 300,
    contenido: 20000
};

const LARGO_MAXIMO_URL = 500;
const LIMITE_MAXIMO_LISTADO = 50;

// Devuelve el texto sin espacios en los extremos, o null si no vino un
// string o quedo vacio. (Misma funcion que en Consulta.controller.js.)
function limpiarTexto(valor) {
    if (typeof valor !== 'string') {
        return null;
    }
    const limpio = valor.trim();
    return limpio === '' ? null : limpio;
}

// Valida el body y arma el objeto 'datos' para el service.
// - Al CREAR (esEdicion = false): titulo, resumen y contenido son obligatorios.
// - Al EDITAR (esEdicion = true): todo es opcional; lo que no viene queda
//   undefined y el service deja el valor que ya tenia. Lo que SI viene se
//   valida igual que al crear.
// Junta todos los errores en una lista, como el formulario de contacto.
function validarNovedad(body, esEdicion) {
    const datos = {};
    const errores = [];

    // 1. Textos obligatorios, con su largo maximo.
    for (const campo in LARGO_MAXIMO) {
        if (esEdicion && body[campo] === undefined) {
            continue;
        }
        const valor = limpiarTexto(body[campo]);
        if (!valor) {
            errores.push(`El campo ${campo} es obligatorio`);
        } else if (valor.length > LARGO_MAXIMO[campo]) {
            errores.push(`El campo ${campo} no puede superar los ${LARGO_MAXIMO[campo]} caracteres`);
        } else {
            datos[campo] = valor;
        }
    }

    // 2. imagenUrl: opcional. null (o "") la quita.
    if (body.imagenUrl !== undefined) {
        if (body.imagenUrl === null) {
            datos.imagenUrl = null;
        } else if (typeof body.imagenUrl !== 'string') {
            errores.push('imagenUrl debe ser un texto (la URL de la imagen)');
        } else if (body.imagenUrl.trim().length > LARGO_MAXIMO_URL) {
            errores.push(`imagenUrl no puede superar los ${LARGO_MAXIMO_URL} caracteres`);
        } else {
            datos.imagenUrl = limpiarTexto(body.imagenUrl);
        }
    }

    // 3. productoId: opcional. Numero entero positivo, o null para quitarlo.
    //    Que el producto exista lo chequea el service (necesita la base).
    if (body.productoId !== undefined) {
        if (body.productoId === null) {
            datos.productoId = null;
        } else if (!Number.isInteger(body.productoId) || body.productoId <= 0) {
            errores.push('productoId debe ser un numero entero positivo');
        } else {
            datos.productoId = body.productoId;
        }
    }

    // 4. publicada: opcional, booleano de verdad (no el string "true").
    if (body.publicada !== undefined) {
        if (typeof body.publicada !== 'boolean') {
            errores.push('publicada debe ser true o false');
        } else {
            datos.publicada = body.publicada;
        }
    }

    // 5. fechaPublicacion: opcional, un string de fecha valido (ej. "2026-10-25").
    //    Si es futura, la novedad queda "programada": el publico no la ve
    //    hasta ese dia aunque este publicada.
    if (body.fechaPublicacion !== undefined) {
        const fecha = new Date(body.fechaPublicacion);
        if (typeof body.fechaPublicacion !== 'string' || isNaN(fecha.getTime())) {
            errores.push('fechaPublicacion no es una fecha valida');
        } else {
            datos.fechaPublicacion = fecha;
        }
    }

    return { datos, errores };
}

// ------------------------------------------------------------
//  LISTAR (publico): GET /api/novedades?limite=3
// ------------------------------------------------------------
exports.obtenerPublicadas = async function (req, res) {
    let limite;

    if (req.query.limite !== undefined) {
        limite = Number(req.query.limite);
        if (!Number.isInteger(limite) || limite <= 0 || limite > LIMITE_MAXIMO_LISTADO) {
            return res.status(400).json({
                mensaje: `limite debe ser un numero entero entre 1 y ${LIMITE_MAXIMO_LISTADO}`
            });
        }
    }

    try {
        const novedades = await novedadService.obtenerPublicadas(limite);
        return res.status(200).json(novedades);
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  BUSCAR POR ID (publico): GET /api/novedades/:id
// ------------------------------------------------------------
exports.obtenerPublicadaPorId = async function (req, res) {
    const id = req.params.id;

    try {
        const novedad = await novedadService.obtenerPublicadaPorId(id);
        if (!novedad) {
            return res.status(404).json({ mensaje: 'Novedad no encontrada' });
        }
        return res.status(200).json(novedad);
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  LISTAR TODAS (admin): GET /api/novedades/admin/todas
// ------------------------------------------------------------
exports.obtenerTodas = async function (req, res) {
    try {
        const novedades = await novedadService.obtenerTodas();
        return res.status(200).json(novedades);
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  CREAR (admin): POST /api/novedades
// ------------------------------------------------------------
exports.crear = async function (req, res) {
    const { datos, errores } = validarNovedad(req.body || {}, false);

    if (errores.length > 0) {
        return res.status(400).json({ mensaje: 'Hay datos invalidos en la novedad', errores: errores });
    }

    try {
        const nuevaNovedad = await novedadService.crear(datos);
        return res.status(201).json({
            novedad: nuevaNovedad,
            mensaje: 'Novedad creada correctamente'
        });
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  EDITAR (admin): PUT /api/novedades/:id
// ------------------------------------------------------------
exports.editar = async function (req, res) {
    const id = req.params.id;
    const { datos, errores } = validarNovedad(req.body || {}, true);

    if (errores.length > 0) {
        return res.status(400).json({ mensaje: 'Hay datos invalidos en la novedad', errores: errores });
    }

    try {
        const novedadEditada = await novedadService.editar(id, datos);
        return res.status(200).json({
            novedad: novedadEditada,
            mensaje: 'Novedad actualizada correctamente'
        });
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  ELIMINAR (admin): DELETE /api/novedades/:id
// ------------------------------------------------------------
exports.eliminar = async function (req, res) {
    const id = req.params.id;

    try {
        await novedadService.eliminar(id);
        return res.status(200).json({ mensaje: 'Novedad eliminada correctamente' });
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};