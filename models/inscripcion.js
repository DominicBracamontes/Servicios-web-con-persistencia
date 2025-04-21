'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Inscripcion extends Model {
    static associate(models) {
      this.belongsTo(models.Estudiante, {
        foreignKey: 'estudianteId',
        targetKey: 'matricula', 
        as: 'estudiante',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      this.belongsTo(models.Asignatura, {
        foreignKey: 'asignaturaId',
        targetKey: 'clave', 
        as: 'asignatura',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      });
    }
  }

  Inscripcion.init({
    estudianteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Estudiantes',
        key: 'matricula', 
         onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
      },
      
    },
    asignaturaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Asignaturas',
        key: 'clave', 
        onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
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