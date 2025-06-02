'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Estudiante extends Model {
    static associate(models) {
      this.belongsTo(models.Persona, {
        foreignKey: 'personaId',
        as: 'persona',
        onDelete: 'CASCADE'
      });

      this.belongsToMany(models.Asignatura, {
        through: 'Inscripciones',
        foreignKey: 'estudianteId',
        otherKey: 'asignaturaId',
        as: 'asignaturas',
        onDelete: 'CASCADE'
      });
    }
  }

  Estudiante.init({
    matricula: {
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
        key: 'id',
        onDelete: 'CASCADE'
      }

    }


  }, {
    sequelize,
    modelName: 'Estudiante',
    tableName: 'Estudiantes',
    timestamps: true,
    paranoid: false
  });

  return Estudiante;
};