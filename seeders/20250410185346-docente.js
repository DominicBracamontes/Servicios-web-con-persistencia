'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const personasDocentes = await queryInterface.sequelize.query(
      `SELECT id FROM Personas WHERE email IN (
        'sofia.h@example.com',
        'pedro.gonzalez@example.com',
        'laura.diaz@example.com',
        'jorge.s@example.com',
        'monica.ramirez@example.com'
      ) ORDER BY email`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const categorias = await queryInterface.sequelize.query(
      'SELECT clave FROM CategoriaEmpleados ORDER BY clave',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (personasDocentes.length < 5) {
      throw new Error('Faltan las 5 personas requeridas para docentes');
    }
    if (categorias.length === 0) {
      throw new Error('No hay categorías de empleados registradas');
    }

    await queryInterface.bulkInsert('Docentes', [
      { 
        numEmpleado: 2001,
        personaId: personasDocentes[0].id,  
        categoriaId: categorias[0].clave,   
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        numEmpleado: 2002,
        personaId: personasDocentes[1].id,  
        categoriaId: categorias[1 % categorias.length].clave, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        numEmpleado: 2003,
        personaId: personasDocentes[2].id, 
        categoriaId: categorias[2 % categorias.length].clave,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        numEmpleado: 2004,
        personaId: personasDocentes[3].id,
        categoriaId: categorias[3 % categorias.length].clave,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        numEmpleado: 2005,
        personaId: personasDocentes[4].id, 
        categoriaId: categorias[4 % categorias.length].clave,
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Docentes', null, {});
  }
};