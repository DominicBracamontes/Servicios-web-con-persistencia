'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contrato extends Model {
    static associate(models) {
      Contrato.belongsTo(models.Docente, {
        foreignKey: 'docenteId', 
        targetKey: 'numEmpleado', // Asegurar que referencia el campo correcto
        as: 'docente' 
      });
      
      Contrato.belongsTo(models.Asignatura, {
        foreignKey: 'asignaturaId', // Cambiado para coincidir con el diagrama
        targetKey: 'clave', // Referencia a 'clave' en Asignatura según diagrama
        as: 'asignatura'
      });
    }
  }

  Contrato.init({
    docenteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Docentes',
        key: 'numEmpleado' // Debe referenciar numEmpleado, no id
      }
    },
    asignaturaId: { // Cambiado de asignaturaId para coincidir con diagrama
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { 
        model: 'Asignaturas',
        key: 'clave' // Según diagrama, Asignatura usa 'clave' como identificador
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
        fields: ['docenteId', 'asignaturaId'], // Clave compuesta
      }
    ],
    timestamps: true,
    paranoid: true // Opcional, si necesitas soft delete
  });

  return Contrato;
};