'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Personas', [
      { 
        nombre: 'Juan Pérez', 
        email: 'juan@example.com',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        nombre: 'María García', 
        email: 'maria@example.com',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        nombre: 'Carlos López', 
        email: 'carlos@example.com',
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Personas', null, {});
  }
};