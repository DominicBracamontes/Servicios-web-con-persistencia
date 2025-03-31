'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Estudiante extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Estudiante.hasMany(models.Inscripcion, {
        foreignKey: 'estudianteld',
        as: 'inscripciones'
      });
    }
  }
  Estudiante.init({
    matricula: {
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
    modelName: 'Estudiantes',
    name: {
      singular:'Estudiante',
      plural:'Estudiantes'
    }    
  });
  return Estudiante;
};