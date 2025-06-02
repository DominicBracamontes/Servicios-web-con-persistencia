'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CategoriaEmpleados', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      clave: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
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
    await queryInterface.dropTable('CategoriaEmpleados');
  }
};