'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Docente extends Model {
    static associate(models) {
      this.belongsTo(models.Persona, {
        foreignKey: 'personaId',
        as: 'persona',
        onDelete: 'CASCADE'
      });

      Docente.hasMany(models.Contrato, {
        foreignKey: 'docenteId',
        as: 'contratos'
      });
      
      this.belongsTo(models.CategoriaEmpleado, {
        foreignKey: 'categoriaId',
        as: 'categoria'
      });
      
      this.belongsToMany(models.Asignatura, {
        through: 'Contratos',
        foreignKey: 'docenteId',  
        otherKey: 'asignaturaId',
        as: 'asignaturas'
      });
    }
  }

  Docente.init({
    numEmpleado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
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
      defaultValue: 0,
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
    paranoid: false
  });

  return Docente;
};