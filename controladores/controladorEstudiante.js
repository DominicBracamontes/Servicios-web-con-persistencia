const { Estudiante, Persona, Asignatura, Inscripcion, sequelize,  } = require('../models');

module.exports = {
  async crearEstudiante(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { matricula, persona } = req.body;

      if (!matricula || !persona || !persona.nombre) {
        return res.status(400).json({
          error: 'La matrícula y el nombre de la persona son obligatorios'
        });
      }

      const personaDuplicada = await Persona.findOne({
        where: { nombre: persona.nombre },
        transaction
      });

      if (personaDuplicada) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Ya existe una persona registrada con ese nombre'
        });
      }

      const matriculaExistente = await Estudiante.findOne({
        where: { matricula },
        transaction
      });

      if (matriculaExistente) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'La matrícula ya está registrada'
        });
      }

      const email = persona.email || 'default@email.com';
      const telefono = persona.telefono || '0000000000';

      const nuevaPersona = await Persona.create({
        nombre: persona.nombre,
        email,
        telefono
      }, { transaction });

      const estudiante = await Estudiante.create({
        matricula,
        personaId: nuevaPersona.id
      }, { transaction });

      await transaction.commit();

      res.status(201).json({
        mensaje: 'Estudiante creado correctamente',
        estudiante,
        persona: nuevaPersona
      });

    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({
        error: 'Error al crear el estudiante',
        detalle: error.message
      });
    }
  },


  async obtenerEstudiantes(req, res) {
    try {
      const estudiantes = await Estudiante.findAll({
        include: [{
          model: Persona,
          as: 'persona'
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json(estudiantes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los estudiantes' });
    }
  },

  async obtenerEstudiante(req, res) {
    try {
        const { matricula } = req.params;

        if (!matricula) {
            return res.status(400).json({
                error: 'Matrícula requerida',
                mensaje: 'Debe proporcionar una matrícula en la URL (/estudiantes/:matricula)',
                ejemplo: '/estudiantes/1001'
            });
        }

        const estudiante = await Estudiante.findOne({
            where: { matricula },
            attributes: ['id', 'matricula', 'personaId', 'createdAt', 'updatedAt'],
            include: [{
                model: Persona,
                as: 'persona',
                attributes: ['id', 'nombre', 'email', 'createdAt', 'updatedAt']
            }]
        });

        if (!estudiante) {
            return res.status(404).json({
                error: 'Estudiante no encontrado',
                matriculaBuscada: matricula,
                sugerencia: 'Verifique que la matrícula sea correcta'
            });
        }

        const respuesta = {
            id: estudiante.id,
            matricula: estudiante.matricula,
            personaId: estudiante.personaId,
            createdAt: estudiante.createdAt,
            updatedAt: estudiante.updatedAt,
            persona: {
                id: estudiante.persona.id,
                nombre: estudiante.persona.nombre,
                email: estudiante.persona.email,
                createdAt: estudiante.persona.createdAt,
                updatedAt: estudiante.persona.updatedAt,
                deletedAt: estudiante.persona.deletedAt
            }
        };

        res.json(respuesta);

    } catch (error) {
        console.error('Error al buscar estudiante:', error);
        
        res.status(500).json({
            error: 'Error al obtener el estudiante',
            detalle: process.env.NODE_ENV === 'development' ? {
                mensaje: error.message,
                tipo: error.name,
                ...(error.errors && { campos: error.errors.map(e => e.path) })
            } : undefined
        });
    }
},

async actualizarEstudiantePUT(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const matriculaActual = req.params.matricula; 
    const { matricula: nuevaMatricula } = req.body; 

    if (!nuevaMatricula) {
      await transaction.rollback();
      return res.status(400).json({ error: 'La matrícula es obligatoria en el body' });
    }

    const estudiante = await Estudiante.findOne({ 
      where: { matricula: matriculaActual },
      transaction
    });

    if (!estudiante) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    if (nuevaMatricula !== matriculaActual) {
      const existeMatricula = await Estudiante.findOne({
        where: { matricula: nuevaMatricula },
        transaction
      });

      if (existeMatricula) {
        await transaction.rollback();
        return res.status(400).json({ error: 'La nueva matrícula ya está en uso' });
      }

      await sequelize.models.Inscripcion.update(
        { matricula: nuevaMatricula },
        { where: { matricula: matriculaActual }, transaction }
      );

      await estudiante.update({ matricula: nuevaMatricula }, { transaction });
    }

    await transaction.commit();
    res.json({ 
      mensaje: 'Estudiante actualizado correctamente',
      estudiante: await Estudiante.findOne({
        where: { matricula: nuevaMatricula },
        include: [{ model: Persona, as: 'persona' }]
      })
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ 
      error: 'Error al actualizar el estudiante',
      detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
},

async actualizarEstudiantePATCH(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const { matricula } = req.params; 
    const { nuevaMatricula } = req.body; 

    const estudiante = await Estudiante.findOne({ 
      where: { matricula },
      transaction
    });

    if (!estudiante) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    if (nuevaMatricula && nuevaMatricula !== matricula) {
      const existeMatricula = await Estudiante.findOne({
        where: { matricula: nuevaMatricula },
        transaction
      });

      if (existeMatricula) {
        await transaction.rollback();
        return res.status(400).json({ error: 'La nueva matrícula ya está en uso' });
      }

      await sequelize.models.Inscripcion.update(
        { matricula: nuevaMatricula },
        { where: { matricula }, transaction }
      );

      await estudiante.update({ matricula: nuevaMatricula }, { transaction });
    }

    await transaction.commit();
    res.json({ 
      mensaje: 'Estudiante actualizado correctamente',
      estudiante: await Estudiante.findOne({
        where: { matricula: nuevaMatricula || matricula },
        include: [{ model: Persona, as: 'persona' }]
      })
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el estudiante' });
  }
},

async eliminarEstudiante(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const { matricula } = req.params; 

    const estudiante = await Estudiante.findOne({
      where: { matricula },
      include: [{ model: Persona, as: 'persona' }],
      transaction
    });

    if (!estudiante) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    const personaId = estudiante.personaId;

    await estudiante.destroy({ force: true, transaction });

    const persona = await Persona.findByPk(personaId, { transaction });

    if (persona) {
      await persona.destroy({ force: true, transaction });
    }

    await transaction.commit();
    return res.json({ mensaje: 'Estudiante y persona eliminados permanentemente' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error en eliminarEstudiante:', error);
    return res.status(500).json({ 
      error: 'Error al eliminar estudiante',
      detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
},

  async restaurarEstudiante(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;

      const estudiante = await Estudiante.findOne({
        where: { id },
        paranoid: false,
        transaction
      });

      if (!estudiante) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Estudiante no encontrado' });
      }

      if (!estudiante.deletedAt) {
        await transaction.rollback();
        return res.status(400).json({ error: 'El estudiante no está eliminado' });
      }

      await estudiante.restore({ transaction });
      await transaction.commit();
      
      res.json({ mensaje: 'Estudiante restaurado correctamente' });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({ error: 'Error al restaurar el estudiante' });
    }
  },

  async obtenerAsignaturas(req, res) {
    try {
      const { id } = req.params;

      const estudiante = await Estudiante.findByPk(id);
      if (!estudiante) {
        return res.status(404).json({ error: 'Estudiante no encontrado' });
      }

      const asignaturas = await estudiante.getAsignaturas();
      res.json(asignaturas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener las asignaturas del estudiante' });
    }
  },

  async inscribirAsignatura(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { asignaturaId } = req.body;

      const estudiante = await Estudiante.findByPk(id, { transaction });
      if (!estudiante) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Estudiante no encontrado' });
      }

      const asignatura = await Asignatura.findByPk(asignaturaId, { transaction });
      if (!asignatura) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Asignatura no encontrada' });
      }

      const inscripcionExistente = await estudiante.hasAsignatura(asignatura, { transaction });
      if (inscripcionExistente) {
        await transaction.rollback();
        return res.status(400).json({ error: 'El estudiante ya está inscrito en esta asignatura' });
      }

      await estudiante.addAsignatura(asignatura, { transaction });
      await transaction.commit();
      
      res.json({ mensaje: 'Estudiante inscrito en la asignatura correctamente' });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({ error: 'Error al inscribir al estudiante en la asignatura' });
    }
  },

  async desinscribirAsignatura(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id, asignaturaId } = req.params;

      const estudiante = await Estudiante.findByPk(id, { transaction });
      if (!estudiante) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Estudiante no encontrado' });
      }

      const asignatura = await Asignatura.findByPk(asignaturaId, { transaction });
      if (!asignatura) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Asignatura no encontrada' });
      }

      const inscripcionExistente = await estudiante.hasAsignatura(asignatura, { transaction });
      if (!inscripcionExistente) {
        await transaction.rollback();
        return res.status(400).json({ error: 'El estudiante no está inscrito en esta asignatura' });
      }

      await estudiante.removeAsignatura(asignatura, { transaction });
      await transaction.commit();
      
      res.json({ mensaje: 'Estudiante desinscrito de la asignatura correctamente' });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({ error: 'Error al desinscribir al estudiante de la asignatura' });
    }
  }
};