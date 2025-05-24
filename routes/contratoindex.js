const express = require('express');
const router = express.Router();
const controladorContrato = require('../controladores/controladorContrato');

router.get('/', controladorContrato.obtenerContratos);
router.get('/:id', controladorContrato.obtenerContratoPorId);
router.get('/asignaturas/:clave', controladorContrato.obtenerContratosPorClave);

router.post('/', controladorContrato.crearContrato);
router.delete('/:numEmpleado', controladorContrato.eliminarContrato);
router.put('/:numEmpleado', controladorContrato.putContrato);
router.patch('/:numEmpleado', controladorContrato.actualizarContratoParcial);

module.exports = router;