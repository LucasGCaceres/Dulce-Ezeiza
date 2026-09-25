const comercioService = require('../services/Comercio.service');

// ------------------------------------------------------------
//  OBTENER: GET /api/comercio  (publico, lo ve cualquier visitante)
// ------------------------------------------------------------
exports.obtener = async function (req, res) {
    try {
        const comercio = await comercioService.obtener();
        if (!comercio) {
            return res.status(404).json({ mensaje: 'No se cargo la informacion del comercio' });
        }
        return res.status(200).json(comercio);
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  EDITAR: PUT /api/comercio  (admin)
// ------------------------------------------------------------
exports.editar = async function (req, res) {
    const datos = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        direccion: req.body.direccion,
        telefono: req.body.telefono,
        instagram: req.body.instagram,
        facebook: req.body.facebook,
        whatsapp: req.body.whatsapp,
        tiktok: req.body.tiktok,
        horarios: req.body.horarios
    };

    try {
        const comercio = await comercioService.editar(datos);
        return res.status(200).json({
            comercio: comercio,
            mensaje: 'Informacion del comercio actualizada correctamente'
        });
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};