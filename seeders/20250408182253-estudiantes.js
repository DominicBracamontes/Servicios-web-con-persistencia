'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const personas = await queryInterface.sequelize.query(
      `SELECT id, email FROM Personas WHERE email IN (
        'juan@example.com', 
        'maria@example.com',
        'carlos@example.com',
        'ana.martinez@example.com',
        'luis.rod@example.com'
      ) ORDER BY CASE
        WHEN email = 'juan@example.com' THEN 1
        WHEN email = 'maria@example.com' THEN 2
        WHEN email = 'carlos@example.com' THEN 3
        WHEN email = 'ana.martinez@example.com' THEN 4
        WHEN email = 'luis.rod@example.com' THEN 5
        END`,
      {
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    if (personas.length < 5) {
      throw new Error('Faltan algunas de las personas requeridas (deben ser 5)');
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
      },
      { 
        matricula: 1003,
        personaId: personas[2].id,  
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        matricula: 1004,
        personaId: personas[3].id,  
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        matricula: 1005,
        personaId: personas[4].id, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Estudiantes', null, {});
  }
};