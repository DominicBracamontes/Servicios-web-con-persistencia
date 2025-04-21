const express = require('express');
const router = express.Router();
const estudianteController = require('../controladores/controladorEstudiante');

router.get('/', estudianteController.obtenerEstudiantes);
router.get('/:matricula', estudianteController.obtenerEstudiante);
router.post('/', estudianteController.crearEstudiante);
router.put('/por-matricula/:matricula', estudianteController.actualizarEstudiantePUT);
router.patch('/por-matricula/:matricula', estudianteController.actualizarEstudiantePATCH);
router.delete('/por-matricula/:matricula', estudianteController.eliminarEstudiante);
router.post('/:id/restaurar', estudianteController.restaurarEstudiante);
router.get('/:id/asignaturas', estudianteController.obtenerAsignaturas);
router.post('/:id/asignaturas', estudianteController.inscribirAsignatura);
router.delete('/:id/asignaturas/:asignaturaId', estudianteController.desinscribirAsignatura);

module.exports = router;