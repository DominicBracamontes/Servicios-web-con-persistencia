'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Docente extends Model {
    static associate(models) {
      // Relación con Persona (hereda nombre y email)
      this.belongsTo(models.Persona, {
        foreignKey: 'personaId',
        as: 'persona'
      });
      
      // Relación con CategoriaEmpleado
      this.belongsTo(models.CategoriaEmpleado, {
        foreignKey: 'categoriaId',
        as: 'categoria'
      });
      
      // Relación many-to-many con Asignatura a través de Contrato
      this.belongsToMany(models.Asignatura, {
        through: 'Contratos',
        foreignKey: 'docenteId',  // Esto debe coincidir con numEmpleado
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