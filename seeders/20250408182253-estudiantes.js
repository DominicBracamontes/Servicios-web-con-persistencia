'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const personas = await queryInterface.sequelize.query(
      `SELECT id FROM Personas WHERE email IN (?, ?) ORDER BY CASE 
        WHEN email = 'juan@example.com' THEN 1 
        WHEN email = 'carlos@example.com' THEN 2 
        END`,
      {
        replacements: ['juan@example.com', 'carlos@example.com'],
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    if (personas.length < 2) {
      throw new Error('Faltan las personas requeridas (Juan y Carlos)');
    }

    await queryInterface.bulkInsert('Estudiantes', [
      { 
        matricula: 1001,
        personaId: personas[0].id,  
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        matricula: 1002,
        personaId: personas[1].id,  
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Estudiantes', null, {});
  }
};