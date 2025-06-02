'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CategoriaEmpleado extends Model {

    static associate(models) {
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
    name: {
      singular: "CategoriaEmpleado",
      plural: "CategoriaEmpleados"
    }
  });
  return CategoriaEmpleado;
};