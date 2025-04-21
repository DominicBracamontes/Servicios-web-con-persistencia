const express = require('express');
const router = express.Router();
const controlador = require('../controladores/controladorCategoriaEmpleado');

router.get('/', controlador.obtenerCategorias);
router.get('/:clave', controlador.obtenerCategoria);
router.post('/', controlador.crearCategoria);
router.put('/:clave', controlador.actualizarCategoriaPUT);
router.patch('/:clave', controlador.modificarCategoriaPATCH);
router.delete('/:clave', controlador.eliminarCategoria);

module.exports = router;