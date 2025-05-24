const express = require('express');
const router = express.Router();
const personaController = require('../controladores/controladorPersona');

router.get('/', personaController.obtenerPersonas);
router.get('/nombre/:nombre', personaController.obtenerPersonaPorNombre);
router.post('/', personaController.crearPersona);
router.put('/actualizar/:nombre', personaController.actualizarPersonaPorNombre);
router.patch('/modificar/:nombre', personaController.modificarPersonaPorNombre);
router.delete('/eliminar/:nombre', personaController.eliminarPersonaPorNombre);router.post('/:id/restaurar', personaController.restaurarPersona);

module.exports = router;