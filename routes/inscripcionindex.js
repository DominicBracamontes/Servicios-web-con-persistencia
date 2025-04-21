const express = require('express');
const router = express.Router();
const controller = require('../controladores/controladorInscripcion');

router.get('/', controller.obtenerInscripciones);
router.get('/:id', controller.obtenerInscripcionesPorAsignatura);
router.post('/', controller.crearInscripcion);
router.delete('/:matricula', controller.eliminarInscripcion);
router.put('/:matricula', controller.actualizarInscripcion);
router.patch('/:matricula', controller.actualizarParcialInscripcion); 
router.get('/estudiante/:estudianteId', controller.obtenerInscripcionesEstudiante);
router.get('/asignatura/:asignaturaId', controller.obtenerInscripcionesAsignatura);

module.exports = router;