'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Estudiante extends Model {
    static associate(models) {
      this.belongsTo(models.Persona, {
        foreignKey: 'personaId',
        as: 'persona'
      });

      this.belongsToMany(models.Asignatura, {
        through: "Inscripciones",
        foreignKey: 'estudianteId',
        as: 'asignaturas'
      });
    }
  }

  Estudiante.init({
    matricula: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      validate: {
        notNull: true,
        isInt: true
      }
    },
    personaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Personas',
        key: 'id'
      }
      
    }
    
    
  }, {
    sequelize,
    modelName: 'Estudiante',
    tableName: 'Estudiantes',
    timestamps: true,
    paranoid: true
  });

  return Estudiante;
};