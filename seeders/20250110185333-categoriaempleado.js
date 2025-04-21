'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('CategoriaEmpleados', [
      { clave: 0, nombre: 'Sin Categoría', createdAt: new Date(), updatedAt: new Date() },
      { clave: 1, nombre: 'Profesor Titular', createdAt: new Date(), updatedAt: new Date() },
      { clave: 2, nombre: 'Profesor Asociado', createdAt: new Date(), updatedAt: new Date() },
      { clave: 3, nombre: 'Profesor Ayudante', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CategoriaEmpleados', null, {});
  }
};