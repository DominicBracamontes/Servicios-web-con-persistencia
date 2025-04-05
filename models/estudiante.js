'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Estudiante extends Model {
    static associate(models) {
      this.belongsTo(models.Persona, {
        foreignKey: 'personaId',
        as: 'persona'
      });

      this.belongsToMany(models.Asignatura, {
        through: "Inscripciones", // Mejor usar el modelo directamente: models.Inscripcion
        foreignKey: 'estudianteId',
        as: 'asignaturas'
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
        isInt: true,
        len: [8, 8] // Si las matrículas tienen longitud fija (ej. 8 dígitos)
      }
    },
    personaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Personas',
        key: 'id'
      },
      onUpdate: 'CASCADE', // Recomendado añadir
      onDelete: 'RESTRICT' // O 'CASCADE' según tu lógica de negocio
    }
  }, {
    sequelize,
    modelName: 'Estudiante',
    tableName: 'Estudiantes',
    timestamps: true,
    paranoid: true // Bueno si necesitas eliminación lógica
  });

  return Estudiante;
};