// migrations/XXXXXX-create-docente.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Docentes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      numEmpleado: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false
      },
      personaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Personas',
          key: 'id'
        }
      },
      categoriaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CategoriaEmpleados',
          key: 'clave' // Referencia al campo único
        }
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
  async down(queryInterface) {
    await queryInterface.dropTable('Docentes');
  }
};