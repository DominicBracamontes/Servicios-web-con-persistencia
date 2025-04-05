const models = require('./models');
const Persona = models.Persona;
const sequelize = models.sequelize;

async function test() {
  try {
    console.log('\n=== CREATE TEST ===');
    const newPersona = await Persona.create({
      nombre: 'Juan Pérez',
      email: 'juan@example.com'
    });
    console.log('New Persona created:', newPersona.toJSON());

    // READ - Find all Personas
    console.log('\n=== READ TEST (All) ===');
    const allPersonas = await Persona.findAll();
    console.log('All Personas:', JSON.stringify(allPersonas, null, 2));

    // READ - Find one Persona by ID
    console.log('\n=== READ TEST (Single) ===');
    const foundPersona = await Persona.findByPk(newPersona.id);
    console.log('Found Persona:', foundPersona.toJSON());

    // UPDATE - Modify a Persona
    console.log('\n=== UPDATE TEST ===');
    const updatedPersona = await foundPersona.update({
      nombre: 'Juan Carlos Pérez',
      email: 'juan.carlos@example.com'
    });
    console.log('Updated Persona:', updatedPersona.toJSON());
    
    const estudiante = await models.Estudiante.create({
      matricula: 1234,
      personaId: newPersona.id
    });
    console.log('Estudiante creado:', estudiante.toJSON());

    // ===== NUEVO CÓDIGO AÑADIDO =====
    // CREAR UNA ASIGNATURA Y ASOCIARLA A UN ESTUDIANTE
    console.log('\n=== CREAR ASIGNATURA ===');
    const nuevaAsignatura = await models.Asignatura.create({
      clave: 101,
      nombre: 'Matemáticas Avanzadas',
      creditos: 6
    });
    console.log('Asignatura creada:', nuevaAsignatura.toJSON());

    console.log('\n=== ASOCIAR ASIGNATURA CON ESTUDIANTE ===');
    // Opción 1: Usar el método addAsignatura (si las asociaciones están bien configuradas)
    await estudiante.addAsignatura(nuevaAsignatura, {
      through: {
        semestre: 2025,
        calificacion: 0
      }
    });
    
    // Opción 2: Crear directamente la inscripción (más explícito)
    /*
    await models.Inscripcion.create({
      estudianteId: estudiante.id,
      asignaturaId: nuevaAsignatura.id,
      semestre: 2025,
      calificacion: 0
    });
    */
    
    console.log('Asociación creada exitosamente');

    // Verificar la asociación
    console.log('\n=== VERIFICAR ASOCIACIÓN ===');
    const estudianteConAsignaturas = await models.Estudiante.findByPk(estudiante.id, {
      include: [{
        model: models.Asignatura,
        as: 'asignaturas',
        through: {
          attributes: ['semestre', 'calificacion']
        }
      }]
    });
    console.log('Estudiante con asignaturas:', JSON.stringify(estudianteConAsignaturas, null, 2));
    // ===== FIN DE NUEVO CÓDIGO =====

    /*
    estudiante.setPersona(foundPersona);
    // DELETE - Remove a Persona
    console.log('\n=== DELETE TEST ===');
    await updatedPersona.destroy();
    console.log('Persona deleted');

    // Verify deletion
    const deletedPersona = await Persona.findByPk(newPersona.id);
    console.log('Verify deletion:', deletedPersona ? 'Still exists' : 'Not found (correct)');
    */

  } catch (error) {
    console.error('Error during CRUD tests:', error);
  } finally {
    // Close connection
    await sequelize.close();
    console.log('\nConnection closed');
  }
}

test();