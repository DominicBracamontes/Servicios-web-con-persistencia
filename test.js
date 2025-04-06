const models = require('./models');
const { sequelize } = models;

async function test() {
  try {
    // Limpieza inicial (en orden inverso a las dependencias)
    await sequelize.query('DELETE FROM Inscripciones');
    await sequelize.query('DELETE FROM Contratos');
    await models.Estudiante.destroy({ where: {}, force: true });
    await models.Docente.destroy({ where: {}, force: true });
    await models.Asignatura.destroy({ where: {}, force: true });
    await models.Persona.destroy({ where: {}, force: true });
    await models.CategoriaEmpleado.destroy({ where: {}, force: true });

    console.log('\n=== CREAR PERSONA ESTUDIANTE ===');
    const personaEstudiante = await models.Persona.create({
      nombre: 'Juan Pérez',
      email: 'juan@example.com'
    });
    console.log('Persona (estudiante) creada:', personaEstudiante.toJSON());

    console.log('\n=== CREAR ESTUDIANTE ===');
    const estudiante = await models.Estudiante.create({
      matricula: 1234,
      personaId: personaEstudiante.id
    });
    console.log('Estudiante creado:', estudiante.toJSON());

    console.log('\n=== CREAR PERSONA DOCENTE ===');
    const personaDocente = await models.Persona.create({
      nombre: 'María García',
      email: 'maria@example.com'
    });
    console.log('Persona (docente) creada:', personaDocente.toJSON());

    console.log('\n=== CREAR CATEGORÍA EMPLEADO ===');
    const categoria = await models.CategoriaEmpleado.create({
      clave: 1,
      nombre: 'Profesor Titular'
    });
    console.log('Categoría creada:', categoria.toJSON());

    console.log('\n=== CREAR DOCENTE ===');
    const docente = await models.Docente.create({
      numEmpleado: 5678,
      personaId: personaDocente.id,
      categoriaId: categoria.clave
    });
    console.log('Docente creado:', docente.toJSON());

    console.log('\n=== CREAR ASIGNATURA ===');
    const asignatura = await models.Asignatura.create({
      clave: 101,
      nombre: 'Matemáticas Avanzadas',
      creditos: 6
    });
    console.log('Asignatura creada:', asignatura.toJSON());

    console.log('\n=== INSCRIBIR ESTUDIANTE A ASIGNATURA ===');
    const inscripcion = await models.Inscripcion.create({
      estudianteId: estudiante.id,
      asignaturaId: asignatura.id,
      semestre: 20251,
      calificacion: 8.5
    });
    console.log('Inscripción creada:', inscripcion.toJSON());

    console.log('\n=== ASIGNAR DOCENTE A ASIGNATURA ===');
    const contrato = await models.Contrato.create({
      docenteId: docente.id,
      asignaturaId: asignatura.id
    });
    console.log('Contrato creado:', contrato.toJSON());

    console.log('\n=== VERIFICAR RELACIONES ===');

    // 1. Verificación desde Estudiante (sin paranoid)
    const estudianteConAsignaturas = await models.Estudiante.findOne({
      where: { id: estudiante.id },
      include: [{
        model: models.Asignatura,
        as: 'asignaturas',
        through: {
          attributes: ['semestre', 'calificacion']
        }
      }],
      paranoid: false // Desactiva paranoid para esta consulta
    });
    console.log('Estudiante con asignaturas:', JSON.stringify(estudianteConAsignaturas.toJSON(), null, 2));

    // 2. Verificación desde Asignatura (sin paranoid)
    const asignaturaCompleta = await models.Asignatura.findOne({
      where: { id: asignatura.id },
      include: [
        {
          model: models.Estudiante,
          as: 'estudiantes',
          through: {
            attributes: ['semestre', 'calificacion']
          },
          paranoid: false
        },
        {
          model: models.Docente,
          as: 'docentes',
          through: {
            attributes: []
          },
          paranoid: false
        }
      ],
      paranoid: false
    });
    console.log('Asignatura con estudiantes y docentes:', JSON.stringify(asignaturaCompleta.toJSON(), null, 2));

    // 3. Verificación desde Docente (sin paranoid)
    const docenteConAsignaturas = await models.Docente.findOne({
      where: { id: docente.id },
      include: [{
        model: models.Asignatura,
        as: 'asignaturas',
        paranoid: false
      }],
      paranoid: false
    });
    console.log('Docente con asignaturas:', JSON.stringify(docenteConAsignaturas.toJSON(), null, 2));

  } catch (error) {
    console.error('\n=== ERROR EN LAS PRUEBAS ===');
    console.error('Tipo:', error.name);
    console.error('Mensaje:', error.message);
    
    if (error.errors) {
      console.error('Errores de validación:');
      error.errors.forEach(err => {
        console.error(`- Campo: ${err.path}, Error: ${err.message}`);
      });
    }
    
    if (error.parent) {
      console.error('Error SQL:', error.parent.sqlMessage);
      console.error('SQL:', error.parent.sql);
    }
  } finally {
    await sequelize.close();
    console.log('\n=== PRUEBAS COMPLETADAS ===');
    console.log('Conexión cerrada');
  }
}

test();