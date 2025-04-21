'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Persona extends Model {
    static associate(models) {
      Persona.hasOne(models.Estudiante, {
        foreignKey: 'personaId',
        as: 'estudiante',
        onDelete: 'CASCADE' 
    });
    
    Persona.hasOne(models.Docente, {
        foreignKey: 'personaId',
        as: 'docente',
        onDelete: 'CASCADE' 
    });
    }
  }

  Persona.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    }
  }, {
    sequelize,
    modelName: 'Persona',
    tableName: 'Personas',
    timestamps: true,
    paranoid: true
  });

  return Persona;
};