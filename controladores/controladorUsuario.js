const { Usuario } = require('../models');
const bcrypt = require('bcrypt');

module.exports = {
  async obtenerUsuarios(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        attributes: ['correo']
      });
      res.json(usuarios);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({
        error: 'Error al obtener usuarios',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  },

  async crearUsuario(req, res) {
    try {
      const { correo, contrasena } = req.body;
      if (!correo || !contrasena) {
        return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        return res.status(400).json({ error: 'Formato de correo inválido' });
      }

      const existe = await Usuario.findOne({ where: { correo } });
      if (existe) {
        return res.status(409).json({ error: 'El correo ya está registrado' });
      }

      const hashedPassword = await bcrypt.hash(contrasena, 10);
      const nuevoUsuario = await Usuario.create({
        correo,
        contraseña: hashedPassword  // 🔥 Campo correcto
      });

      res.status(201).json({ mensaje: 'Usuario creado exitosamente', usuario: { correo: nuevoUsuario.correo } });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({
        error: 'Error al crear usuario',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  },

  async verificarUsuario(req, res) {
    try {
      const { correo, contrasena } = req.body;
      if (!correo || !contrasena) {
        return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
      }

      const usuario = await Usuario.findOne({ where: { correo } });
      if (!usuario) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }

      const esValida = await bcrypt.compare(contrasena, usuario.contraseña);
      if (esValida) {
        return res.status(200).json({ mensaje: 'Login exitoso', correo: usuario.correo });
      } else {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      res.status(500).json({
        error: 'Error al verificar usuario',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }
};
