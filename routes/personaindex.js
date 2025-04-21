const express = require('express');
const router = express.Router();
const personaController = require('../controladores/controladorPersona');

router.get('/', personaController.obtenerPersonas);
router.get('/:id', personaController.obtenerPersona);
router.post('/', personaController.crearPersona);
router.put('/:id', personaController.actualizarPersona);
router.patch('/:id', personaController.modificarPersona);
router.delete('/:id', personaController.eliminarPersona);
router.post('/:id/restaurar', personaController.restaurarPersona);

module.exports = router;