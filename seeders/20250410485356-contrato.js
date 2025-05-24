'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [docentes, asignaturas] = await Promise.all([
      queryInterface.sequelize.query(
        'SELECT numEmpleado FROM Docentes ORDER BY numEmpleado',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        'SELECT clave FROM Asignaturas ORDER BY clave',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
    ]);

    if (docentes.length === 0 || asignaturas.length < 2) {
      throw new Error('No hay suficientes docentes o asignaturas disponibles');
    }

    const contratos = [];
    
    docentes.forEach((docente, index) => {
      contratos.push({
        docenteId: docente.numEmpleado,
        asignaturaId: asignaturas[index % asignaturas.length].clave,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      contratos.push({
        docenteId: docente.numEmpleado,
        asignaturaId: asignaturas[(index + 2) % asignaturas.length].clave,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    await queryInterface.bulkInsert('Contratos', contratos, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Contratos', null, {});
  }
};