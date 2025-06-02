'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contrato extends Model {
    static associate(models) {
      Contrato.belongsTo(models.Docente, {
        foreignKey: 'docenteId',
        targetKey: 'numEmpleado',
        as: 'docente',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      Contrato.belongsTo(models.Asignatura, {
        foreignKey: 'asignaturaId',
        targetKey: 'clave',
        as: 'asignatura',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Contrato.init({
    docenteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Docentes',
        key: 'numEmpleado',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }

    },
    asignaturaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Asignaturas',
        key: 'clave',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'

      }
    }
  }, {
    sequelize,
    modelName: 'Contrato',
    name: {
      singular: 'Contrato',
      plural: 'Contratos'
    },
    indexes: [
      {
        unique: true,
        fields: ['docenteId', 'asignaturaId'],
      }
    ],
    timestamps: true,
    paranoid: false
  });

  return Contrato;
};