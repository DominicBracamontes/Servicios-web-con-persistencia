'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CategoriaEmpleado extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CategoriaEmpleado.hasMany(models.Docente, {
        foreignKey: 'categoriaId',
        as: 'docentes'
      });
    }
  }
  CategoriaEmpleado.init({
    clave: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'CategoriaEmpleado',
    name:{
      singular: "CategoriaEmpleado",
      plural: "CategoriaEmpleados"
    }
  });
  return CategoriaEmpleado;
};