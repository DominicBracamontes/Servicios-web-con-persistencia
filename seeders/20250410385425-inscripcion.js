'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [estudiantes, asignaturas] = await Promise.all([
      queryInterface.sequelize.query(
        'SELECT matricula FROM Estudiantes ORDER BY matricula',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        'SELECT clave FROM Asignaturas ORDER BY clave',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
    ]);

    if (estudiantes.length === 0 || asignaturas.length < 2) {
      throw new Error('No hay suficientes estudiantes o asignaturas disponibles');
    }

    const inscripciones = [];
    const semestres = [20241, 20242]; 
    
    estudiantes.forEach((estudiante, index) => {
      inscripciones.push({
        estudianteId: estudiante.matricula,
        asignaturaId: asignaturas[index % asignaturas.length].clave,
        semestre: semestres[0],
        calificacion: (8.0 + Math.random() * 2.0).toFixed(1), 
        createdAt: new Date(),
        updatedAt: new Date()
      });

      inscripciones.push({
        estudianteId: estudiante.matricula,
        asignaturaId: asignaturas[(index + 2) % asignaturas.length].clave,
        semestre: semestres[1],
        calificacion: (5.0 + Math.random() * 2.0).toFixed(1), 
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    await queryInterface.bulkInsert('Inscripciones', inscripciones, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Inscripciones', null, {});
  }
};