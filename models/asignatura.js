// models/asignatura.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Asignatura extends Model {
    static associate(models) {
      this.belongsToMany(models.Estudiante, {
        through: 'Inscripciones',
        foreignKey: 'asignaturaId',
        otherKey: 'estudianteId',
        as: 'estudiantes' // Asegúrate que este alias coincida
      });
      
      this.belongsToMany(models.Docente, {
        through: 'Contratos',
        foreignKey: 'asignaturaId',
        otherKey: 'docenteId',
        as: 'docentes'
      });
    }
  }

  Asignatura.init({
    clave: {
      type: DataTypes.INTEGER,
      unique: true, // Esto debe coincidir con la migración
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    creditos: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Asignatura',
    timestamps: true
  });

  return Asignatura;
};