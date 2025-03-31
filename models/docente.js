'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Docente extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Docente.hasMany(models.Contrato, {
        foreignKey: 'docenteld',
        as: 'contratos'
      });

      Docente.belongsTo(models.CategoriaEmpleado, {
        foreignKey: 'categoriaId',
        as: 'categoria'
      });
    }
  }
  Docente.init({
    numEmpleado: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Docente',
    name:{
      singular: "Docente",
      plural: "Docentes"
    },
    
  });
  return Docente;
};