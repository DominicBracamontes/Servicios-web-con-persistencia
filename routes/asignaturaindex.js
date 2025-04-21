const express = require('express');
const router = express.Router(); 
const controladorAsignatura = require('../controladores/controladorAsignatura');

router.get('/', controladorAsignatura.obtenerAsignaturas);
router.get('/:clave', controladorAsignatura.obtenerAsignatura);
router.post('/', controladorAsignatura.crearAsignatura);
router.put('/:clave', controladorAsignatura.actualizarAsignaturaPUT);
router.patch('/:clave', controladorAsignatura.modificarAsignaturaPATCH);
router.delete('/:clave', controladorAsignatura.eliminarAsignatura);

module.exports = router;