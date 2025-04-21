'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [persona, categoria] = await Promise.all([
      queryInterface.sequelize.query(
        'SELECT id FROM Personas WHERE email = ?',
        {
          replacements: ['maria@example.com'],
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      ),
      queryInterface.sequelize.query(
        'SELECT clave FROM CategoriaEmpleados LIMIT 1',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
    ]);

    await queryInterface.bulkInsert('Docentes', [
      { 
        numEmpleado: 2001,
        personaId: persona[0].id,
        categoriaId: categoria[0].clave,
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Docentes', null, {});
  }
};