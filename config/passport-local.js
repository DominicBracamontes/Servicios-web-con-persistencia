const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario'); 

module.exports = function(passport) {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      // 1. Buscar usuario por email
      const usuario = await Usuario.findOne({ where: { email } });
      
      if (!usuario) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }
      
      // 2. Verificar contraseña
      const esValida = await bcrypt.compare(password, usuario.password);
      
      if (!esValida) {
        return done(null, false, { message: 'Contraseña incorrecta' });
      }
      
      // 3. Si todo es correcto, retornar usuario
      return done(null, usuario);
    } catch (error) {
      return done(error);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Usuario.findByPk(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};