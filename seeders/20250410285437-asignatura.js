'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Asignaturas', [
      { 
        clave: 101,
        nombre: 'Matemáticas Avanzadas',
        creditos: 6,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        clave: 102,
        nombre: 'Programación Orientada a Objetos',
        creditos: 8,
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Asignaturas', null, {});
  }
};