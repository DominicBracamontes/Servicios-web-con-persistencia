'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Asignatura extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.Estudiante, {
        through: "Inscripciones",
        foreignKey: 'asignaturaId',
        as: 'estudiantes'
      });
      
      this.hasMany(models.Contrato, {
        foreignKey: 'asignaturaId',
        as: 'contratos'
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
    name: {
      singular:'Asignatura',
      plural:'Asignaturas'
    }
  });
  return Asignatura;
};