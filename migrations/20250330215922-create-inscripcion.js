'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Inscripciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      estudianteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
          model: 'Estudiantes',
          key: 'id'
        }
      },
      asignaturaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
          model: 'Asignaturas',
          key: 'id'
        }
      },
      semestre: {
        type: Sequelize.INTEGER
      },
      calificacion: {
        type: Sequelize.FLOAT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
      
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Inscripciones');
  }
};