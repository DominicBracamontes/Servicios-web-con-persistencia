'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up (queryInterface, Sequelize) {
    const passwordJuan = await bcrypt.hash('123456', 10);
    const passwordAna = await bcrypt.hash('abcdef', 10);

    await queryInterface.bulkInsert('Usuarios', [
      {
        nombre: 'Juan Pérez',
        contraseña: passwordJuan, 
        correo: 'juanperez@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Ana García',
        contraseña: passwordAna, 
        correo: 'anagarcia@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Usuarios', null, {});
  }
};
