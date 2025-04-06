// models/inscripcion.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Inscripcion extends Model {
    static associate(models) {
      this.belongsTo(models.Estudiante, {
        foreignKey: 'estudianteId',
        targetKey: 'matricula' // Referenciamos por matrícula
      });
      this.belongsTo(models.Asignatura, {
        foreignKey: 'asignaturaId',
        targetKey: 'clave' // Referenciamos por clave
      });
    }
  }

  Inscripcion.init({
    estudianteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Estudiantes',
        key: 'matricula' // Referencia a matrícula, no a id
      }
    },
    asignaturaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Asignaturas',
        key: 'clave' // Referencia a clave, no a id
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
    timestamps: true
  });

  return Inscripcion;
};