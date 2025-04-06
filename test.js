const models = require('./models');
const { sequelize } = models;

async function test() {
  try {
    // Limpieza inicial
    await sequelize.query('DELETE FROM Inscripciones');
    await models.Estudiante.destroy({ where: {}, force: true });
    await models.Asignatura.destroy({ where: {}, force: true });
    await models.Persona.destroy({ where: {}, force: true });

    console.log('\n=== CREAR PERSONA ===');
    const persona = await models.Persona.create({
      nombre: 'Juan Pérez',
      email: 'juan@example.com'
    });
    console.log('Persona creada:', persona.toJSON());

    console.log('\n=== CREAR ESTUDIANTE ===');
    const estudiante = await models.Estudiante.create({
      matricula: 1234,
      personaId: persona.id
    });
    console.log('Estudiante creado:', estudiante.toJSON());

    console.log('\n=== CREAR ASIGNATURA ===');
    const asignatura = await models.Asignatura.create({
      clave: 101,
      nombre: 'Matemáticas Avanzadas',
      creditos: 6
    });
    console.log('Asignatura creada:', asignatura.toJSON());

    console.log('\n=== ASOCIAR ASIGNATURA CON ESTUDIANTE ===');
    const inscripcion = await models.Inscripcion.create({
      estudianteId: estudiante.id,
      asignaturaId: asignatura.id,
      semestre: 20251,
      calificacion: 8.5
    });
    console.log('Inscripción creada:', inscripcion.toJSON());

    console.log('\n=== VERIFICAR ASOCIACIÓN ===');
    
    // Verificación directa desde la tabla Inscripciones (CORREGIDO)
    const inscripciones = await models.Inscripcion.findAll({
      where: { estudianteId: estudiante.id },
      include: [
        { 
          model: models.Estudiante,
          as: 'estudiante' // Alias definido en el modelo Inscripcion
        },
        { 
          model: models.Asignatura,
          as: 'asignatura' // Alias definido en el modelo Inscripcion
        }
      ]
    });
    console.log('Inscripciones directas:', JSON.stringify(inscripciones, null, 2));

    // Verificación desde el modelo Estudiante (CORRECTO)
    const estudianteConAsignaturas = await models.Estudiante.findByPk(estudiante.id, {
      include: [{
        model: models.Asignatura,
        as: 'asignaturas', // Alias definido en el modelo Estudiante
        through: {
          attributes: ['semestre', 'calificacion']
        }
      }]
    });
    console.log('Estudiante con asignaturas:', JSON.stringify(estudianteConAsignaturas, null, 2));

    // Verificación desde el modelo Asignatura (CORRECTO)
    const asignaturaConEstudiantes = await models.Asignatura.findByPk(asignatura.id, {
      include: [{
        model: models.Estudiante,
        as: 'estudiantes', // Alias definido en el modelo Asignatura
        through: {
          attributes: ['semestre', 'calificacion']
        }
      }]
    });
    console.log('Asignatura con estudiantes:', JSON.stringify(asignaturaConEstudiantes, null, 2));

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
    }
  } finally {
    await sequelize.close();
    console.log('\n=== PRUEBAS COMPLETADAS ===');
    console.log('Conexión cerrada');
  }
}

test();