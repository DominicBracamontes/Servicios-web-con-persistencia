'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Estudiantes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      matricula: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false // Faltaba este constraint que sí está en el modelo
      },
      personaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Personas',
          key: 'id'
        },
        onUpdate: 'CASCADE', // Recomendado añadir para consistencia
        onDelete: 'RESTRICT' // O 'CASCADE' según tu lógica
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: { // Necesario si usas paranoid: true
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Índice adicional para mejor performance en búsquedas por matrícula
    await queryInterface.addIndex('Estudiantes', ['matricula'], {
      unique: true,
      name: 'estudiantes_matricula_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Estudiantes');
  }
};