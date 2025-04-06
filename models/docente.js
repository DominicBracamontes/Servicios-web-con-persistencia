'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Docente extends Model {
    static associate(models) {
      this.belongsTo(models.Persona, {
        foreignKey: 'personaId',
        as: 'persona'
      });
      this.belongsTo(models.CategoriaEmpleado, {
        foreignKey: 'categoriaId',
        as: 'categoria'
      });
    }
  }

  Docente.init({
    numEmpleado: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      validate: {
        notNull: true,
        isInt: true
      }
    },
    personaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Personas',
        key: 'id'
      }
    },
    categoriaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CategoriaEmpleados',
        key: 'clave'
      }
    }
  }, {
    sequelize,
    modelName: 'Docente',
    tableName: 'Docentes',
    timestamps: true,
    paranoid: true
  });

  return Docente;
};