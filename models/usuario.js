'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
    }
  }
  Usuario.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    contraseña: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 100] 
      }
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, 
      validate: {
        notEmpty: true,
        isEmail: true
      }
    }
  }, {
    sequelize,
    modelName: 'Usuario',
  });
  return Usuario;
};
