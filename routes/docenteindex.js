const express = require('express');
const router = express.Router();
const controladorDocente = require('../controladores/controladorDocente');

router.get('/', controladorDocente.obtenerDocentes);
router.get('/:id', controladorDocente.obtenerDocente);
router.post('/', controladorDocente.crearDocente);
router.put('/:numEmpleado', controladorDocente.actualizarDocentePUT);
router.patch('/:numEmpleado', controladorDocente.modificaDocentePATCH);
router.delete('/:id', controladorDocente.eliminarDocente);
router.get('/:docenteId/contratos', controladorDocente.obtenerContratosDeDocente);

module.exports = router;