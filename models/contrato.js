'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contrato extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
      Contrato.belongsTo(models.Docente, {
        foreignKey: 'docenteld', 
        as: 'docente' 
      });
      Contrato.belongsTo(models.Asignatura, {
        foreignKey: 'asignaturaId',
        as: 'asignatura'
      });
      

    }
  }
  Contrato.init({
    docenteld: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Docentes',
        key: 'id'
      },
      
    },
    asignaturaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { 
        model: 'Asignaturas',
        key: 'id'
      },
      
    }
  }, {
    sequelize,
    modelName: 'Contrato',
    name: {
      singular:'Contrato',
      plural:'Contratos'
    },
    
    indexes: [
      {
        unique: true, 
        fields: ['docenteld', 'asignaturaId'],
      }
    ],
    timestamps: true 
    
  });
  return Contrato;
};