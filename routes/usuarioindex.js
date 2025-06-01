const express = require('express');
const router = express.Router();
const controladorUsuario = require('../controladores/controladorUsuario');

router.get('/', controladorUsuario.obtenerUsuarios); 
router.post('/', controladorUsuario.crearUsuario);
router.post('/verificar', controladorUsuario.verificarUsuario);  
module.exports = router;
