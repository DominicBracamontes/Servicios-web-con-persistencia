'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Asignatura extends Model {
    static associate(models) {

      this.hasMany(models.Inscripcion, {
        foreignKey: 'asignaturaId',
        as: 'inscripciones'
      });
      this.belongsToMany(models.Estudiante, {
        through: 'Inscripciones',
        foreignKey: 'asignaturaId',
        otherKey: 'estudianteId',
        as: 'estudiantes',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });

      this.belongsToMany(models.Docente, {
        through: 'Contratos',
        foreignKey: 'asignaturaId',
        otherKey: 'docenteId',
        as: 'docentes',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    }
  }

  Asignatura.init({
    clave: {
      type: DataTypes.INTEGER,
      unique: true,
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