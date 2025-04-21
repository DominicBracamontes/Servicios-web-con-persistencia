'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [docente, asignatura] = await Promise.all([
      queryInterface.sequelize.query(
        'SELECT numEmpleado FROM Docentes LIMIT 1',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        'SELECT clave FROM Asignaturas LIMIT 1',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
    ]);

    await queryInterface.bulkInsert('Contratos', [
      { 
        docenteId: docente[0].numEmpleado,
        asignaturaId: asignatura[0].clave,
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Contratos', null, {});
  }
};