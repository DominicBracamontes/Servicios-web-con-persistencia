'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [estudiante, asignatura] = await Promise.all([
      queryInterface.sequelize.query(
        'SELECT matricula FROM Estudiantes LIMIT 1',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        'SELECT clave FROM Asignaturas LIMIT 1',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
    ]);

    await queryInterface.bulkInsert('Inscripciones', [
      { 
        estudianteId: estudiante[0].matricula,
        asignaturaId: asignatura[0].clave,
        semestre: 20241,
        calificacion: 8.5,
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Inscripciones', null, {});
  }
};