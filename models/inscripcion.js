'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Inscripcion extends Model {
    static associate(models) {
      // Definir relación con Estudiante
      this.belongsTo(models.Estudiante, {
        foreignKey: 'estudianteId',
        as: 'estudiante'
      });
      
      // Definir relación con Asignatura
      this.belongsTo(models.Asignatura, {
        foreignKey: 'asignaturaId',
        as: 'asignatura'
      });
    }
  }
  
  Inscripcion.init({
    estudianteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Estudiantes',
        key: 'id'
      }
    },
    asignaturaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Asignaturas',
        key: 'id'
      }
    },
    semestre: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    calificacion: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Inscripcion',
    tableName: 'Inscripciones',
    name: {
      singular: "Inscripcion",
      plural: "Inscripciones"
    },
    indexes: [
      {
        unique: true,
        fields: ['estudianteId', 'asignaturaId', 'semestre']
      }
    ]
  });
  
  return Inscripcion;
};