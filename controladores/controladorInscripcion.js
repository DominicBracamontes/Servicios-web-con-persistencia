const { Inscripcion, Asignatura, Estudiante, sequelize } = require('../models');

module.exports = {
  async obtenerInscripciones(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows: inscripciones } = await Inscripcion.findAndCountAll({
        attributes: ['id', 'estudianteId', 'asignaturaId', 'semestre', 'calificacion', 'createdAt'],
        order: [['semestre', 'DESC'], ['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });

      res.json({
        status: 'success',
        total: count,
        pagina: parseInt(page),
        porPagina: parseInt(limit),
        data: inscripciones
      });
    } catch (error) {
      console.error('Error al obtener inscripciones:', error);
      res.status(500).json({
        status: 'error',
        mensaje: 'Error al obtener las inscripciones',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async obtenerInscripcionesPorAsignatura(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          mensaje: 'El ID de la asignatura debe ser un número'
        });
      }

      const inscripciones = await Inscripcion.findAll({
        where: { asignaturaId: id },
        attributes: ['id', 'estudianteId', 'asignaturaId', 'semestre', 'calificacion'],
        order: [['semestre', 'DESC']]
      });

      res.json({
        status: 'success',
        cantidad: inscripciones.length,
        data: inscripciones
      });

    } catch (error) {
      console.error('Error al obtener inscripciones:', error);
      res.status(500).json({
        status: 'error',
        mensaje: 'Error al obtener las inscripciones'
      });
    }
  },

  async crearInscripcion(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { estudianteId, asignaturaId, semestre, calificacion } = req.body;

      const errores = [];
      if (!estudianteId) errores.push('La matrícula del estudiante es requerida');
      if (!asignaturaId) errores.push('La clave de la asignatura es requerida');
      if (!semestre) errores.push('El semestre es requerido');

      if (errores.length > 0) {
        await transaction.rollback();
        return res.status(400).json({ errores });
      }

      if (calificacion !== undefined && (calificacion < 0 || calificacion > 10)) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'La calificación debe estar entre 0 y 10'
        });
      }

      const [estudiante, asignatura] = await Promise.all([
        Estudiante.findOne({
          where: { matricula: estudianteId },
          transaction
        }),
        Asignatura.findOne({
          where: { clave: asignaturaId },
          transaction
        })
      ]);

      if (!estudiante || !asignatura) {
        await transaction.rollback();
        return res.status(404).json({
          error: 'Recursos no encontrados',
          detalles: {
            estudiante: !!estudiante,
            asignatura: !!asignatura
          }
        });
      }

      const existeInscripcion = await Inscripcion.findOne({
        where: {
          estudianteId,
          asignaturaId,
          semestre
        },
        transaction
      });

      if (existeInscripcion) {
        await transaction.rollback();
        return res.status(409).json({
          error: 'El estudiante ya está inscrito en esta asignatura para el semestre indicado',
          data: existeInscripcion
        });
      }

      const nuevaInscripcion = await Inscripcion.create({
        estudianteId,
        asignaturaId,
        semestre,
        calificacion: calificacion !== undefined ? calificacion : null
      }, { transaction });

      await transaction.commit();

      return res.status(201).json({
        mensaje: 'Inscripción creada exitosamente',
        data: {
          id: nuevaInscripcion.id,
          matricula: estudianteId,
          claveAsignatura: asignaturaId,
          semestre: nuevaInscripcion.semestre,
          calificacion: nuevaInscripcion.calificacion,
          fechaCreacion: nuevaInscripcion.createdAt
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear inscripción:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Error de validación',
          detalles: error.errors.map(err => ({
            campo: err.path,
            mensaje: err.message
          }))
        });
      }

      return res.status(500).json({
        error: 'Error interno al procesar la inscripción',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async actualizarInscripcion(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { matricula } = req.params;
      const {
        claveAsignaturaOriginal,
        semestreOriginal,
        nuevaClaveAsignatura,
        nuevoSemestre,
        nuevaCalificacion
      } = req.body;

      if (!claveAsignaturaOriginal || !semestreOriginal ||
        !nuevaClaveAsignatura || !nuevoSemestre ||
        nuevaCalificacion === undefined) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Todos los campos son requeridos: claveAsignaturaOriginal, semestreOriginal, nuevaClaveAsignatura, nuevoSemestre y nuevaCalificacion'
        });
      }

      if (nuevaCalificacion !== null && (isNaN(nuevaCalificacion) || nuevaCalificacion < 0 || nuevaCalificacion > 10)) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'La calificación debe ser un número entre 0 y 10 o null'
        });
      }

      const estudiante = await Estudiante.findOne({
        where: { matricula },
        transaction
      });

      if (!estudiante) {
        await transaction.rollback();
        return res.status(404).json({
          error: 'Estudiante no encontrado'
        });
      }

      const [asignaturaOriginal, nuevaAsignatura] = await Promise.all([
        Asignatura.findOne({
          where: { clave: claveAsignaturaOriginal },
          transaction
        }),
        Asignatura.findOne({
          where: { clave: nuevaClaveAsignatura },
          transaction
        })
      ]);

      if (!asignaturaOriginal || !nuevaAsignatura) {
        await transaction.rollback();
        return res.status(404).json({
          error: 'Asignatura no encontrada',
          detalles: {
            asignaturaOriginal: !!asignaturaOriginal,
            nuevaAsignatura: !!nuevaAsignatura
          }
        });
      }

      const inscripcionOriginal = await Inscripcion.findOne({
        where: {
          estudianteId: matricula,
          asignaturaId: claveAsignaturaOriginal,
          semestre: semestreOriginal
        },
        transaction
      });

      if (!inscripcionOriginal) {
        await transaction.rollback();
        return res.status(404).json({
          error: 'Inscripción original no encontrada'
        });
      }

      const inscripcionExistente = await Inscripcion.findOne({
        where: {
          estudianteId: matricula,
          asignaturaId: nuevaClaveAsignatura,
          semestre: nuevoSemestre
        },
        transaction
      });

      if (inscripcionExistente &&
        (inscripcionExistente.id !== inscripcionOriginal.id)) {
        await transaction.rollback();
        return res.status(409).json({
          error: 'Ya existe una inscripción con la nueva clave y semestre'
        });
      }

      await inscripcionOriginal.update({
        asignaturaId: nuevaClaveAsignatura,
        semestre: nuevoSemestre,
        calificacion: nuevaCalificacion
      }, { transaction });

      await transaction.commit();

      return res.json({
        mensaje: 'Inscripción actualizada exitosamente',
        data: {
          id: inscripcionOriginal.id,
          matricula,
          claveAsignaturaAnterior: claveAsignaturaOriginal,
          claveAsignaturaNueva: nuevaClaveAsignatura,
          semestreAnterior: semestreOriginal,
          semestreNuevo: nuevoSemestre,
          calificacionAnterior: inscripcionOriginal.calificacion,
          calificacionNueva: nuevaCalificacion,
          fechaActualizacion: inscripcionOriginal.updatedAt
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error al actualizar inscripción:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: 'El estudiante ya está inscrito en esta asignatura para el semestre indicado'
        });
      }

      return res.status(500).json({
        error: 'Error al procesar la solicitud',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async actualizarParcialInscripcion(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { matricula } = req.params;
      const {
        claveAsignaturaOriginal,
        semestreOriginal,
        nuevaClaveAsignatura,
        nuevoSemestre,
        nuevaCalificacion
      } = req.body;

      if (!claveAsignaturaOriginal || !semestreOriginal) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Los campos claveAsignaturaOriginal y semestreOriginal son requeridos'
        });
      }

      if (!nuevaClaveAsignatura && !nuevoSemestre && nuevaCalificacion === undefined) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Debe proporcionar al menos un campo a actualizar'
        });
      }

      if (nuevaCalificacion !== undefined && nuevaCalificacion !== null &&
        (isNaN(nuevaCalificacion) || nuevaCalificacion < 0 || nuevaCalificacion > 10)) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'La calificación debe ser entre 0 y 10 o null'
        });
      }

      const inscripcionOriginal = await Inscripcion.findOne({
        where: {
          estudianteId: matricula,
          asignaturaId: claveAsignaturaOriginal,
          semestre: semestreOriginal.toString()
        },
        transaction
      });

      if (!inscripcionOriginal) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Inscripción original no encontrada' });
      }

      if (nuevaClaveAsignatura) {
        const nuevaAsignatura = await Asignatura.findOne({
          where: { clave: nuevaClaveAsignatura },
          transaction
        });
        if (!nuevaAsignatura) {
          await transaction.rollback();
          return res.status(404).json({ error: 'Nueva asignatura no encontrada' });
        }
      }

      if (nuevaClaveAsignatura || nuevoSemestre) {
        const whereClause = {
          estudianteId: matricula,
          asignaturaId: nuevaClaveAsignatura || claveAsignaturaOriginal,
          semestre: (nuevoSemestre || semestreOriginal).toString()
        };

        const existeDuplicado = await Inscripcion.findOne({
          where: whereClause,
          transaction
        });

        if (existeDuplicado && existeDuplicado.id !== inscripcionOriginal.id) {
          await transaction.rollback();
          return res.status(409).json({
            error: 'Ya existe una inscripción con estos datos'
          });
        }
      }

      const updateData = {};
      if (nuevaClaveAsignatura) updateData.asignaturaId = nuevaClaveAsignatura;
      if (nuevoSemestre) updateData.semestre = nuevoSemestre.toString();
      if (nuevaCalificacion !== undefined) updateData.calificacion = nuevaCalificacion;

      await inscripcionOriginal.update(updateData, { transaction });
      await transaction.commit();

      const response = {
        mensaje: 'Inscripción actualizada exitosamente',
        data: {
          id: inscripcionOriginal.id,
          matricula,
          cambios: {}
        }
      };

      if (nuevaClaveAsignatura) {
        response.data.cambios.claveAsignatura = {
          anterior: claveAsignaturaOriginal,
          nuevo: nuevaClaveAsignatura
        };
      }

      if (nuevoSemestre) {
        response.data.cambios.semestre = {
          anterior: semestreOriginal,
          nuevo: nuevoSemestre
        };
      }

      if (nuevaCalificacion !== undefined) {
        response.data.cambios.calificacion = {
          anterior: inscripcionOriginal.calificacion,
          nuevo: nuevaCalificacion
        };
      }

      return res.json(response);

    } catch (error) {
      await transaction.rollback();
      console.error('Error al actualizar inscripción:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: 'El estudiante ya está inscrito con estos datos'
        });
      }

      return res.status(500).json({
        error: 'Error interno del servidor',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async eliminarInscripcion(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { matricula } = req.params;
      const { claveAsignatura, semestre } = req.body;

      if (!matricula || !claveAsignatura || !semestre) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Datos incompletos',
          detalles: {
            requeridos: {
              matricula: 'En URL (/inscripciones/:matricula)',
              claveAsignatura: 'En cuerpo de solicitud',
              semestre: 'En cuerpo de solicitud'
            }
          }
        });
      }

      const inscripcion = await Inscripcion.findOne({
        where: {
          estudianteId: matricula,
          asignaturaId: claveAsignatura,
          semestre: semestre.toString()
        },
        transaction
      });

      if (!inscripcion) {
        await transaction.rollback();
        return res.status(404).json({
          error: 'Inscripción no encontrada',
          parametros: {
            matricula,
            claveAsignatura,
            semestre
          }
        });
      }

      const [estudiante, asignatura] = await Promise.all([
        Estudiante.findOne({
          where: { matricula },
          attributes: ['matricula'],
          transaction
        }),
        Asignatura.findOne({
          where: { clave: claveAsignatura },
          attributes: ['clave', 'nombre'],
          transaction
        })
      ]);

      await inscripcion.destroy({ transaction });
      await transaction.commit();

      return res.json({
        mensaje: 'Inscripción eliminada exitosamente',
        datos: {
          id: inscripcion.id,
          estudiante: {
            matricula: estudiante?.matricula || matricula
          },
          asignatura: {
            clave: asignatura?.clave || claveAsignatura,
            nombre: asignatura?.nombre || 'Asignatura no encontrada'
          },
          semestre: inscripcion.semestre,
          calificacion: inscripcion.calificacion
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error al eliminar inscripción:', error);

      return res.status(500).json({
        error: 'Error interno del servidor',
        detalle: process.env.NODE_ENV === 'development' ? {
          tipo: error.name,
          mensaje: error.message,
          ...(error.errors && { errores: error.errors.map(e => e.message) })
        } : undefined
      });
    }
  },

  async obtenerInscripcionesEstudiante(req, res) {
    try {
      const { estudianteId } = req.params;
      const { semestre } = req.query;

      if (!estudianteId || isNaN(estudianteId)) {
        return res.status(400).json({
          status: 'error',
          mensaje: 'ID de estudiante no válido',
          sugerencia: 'Proporcione un ID numérico válido'
        });
      }

      const where = { estudianteId };
      if (semestre) where.semestre = semestre;

      const inscripciones = await Inscripcion.findAll({
        where,
        include: [{
          model: Asignatura,
          as: 'asignatura',
          attributes: ['clave', 'nombre', 'creditos']
        }],
        order: [['semestre', 'DESC']]
      });

      if (inscripciones.length === 0) {
        return res.status(404).json({
          status: 'error',
          mensaje: 'No se encontraron inscripciones para este estudiante',
          estudianteId,
          sugerencia: 'Verifique el ID del estudiante'
        });
      }

      res.json({
        status: 'success',
        count: inscripciones.length,
        data: inscripciones
      });
    } catch (error) {
      console.error('Error al obtener inscripciones del estudiante:', error);
      res.status(500).json({
        status: 'error',
        mensaje: 'Error al obtener las inscripciones',
        detalle: process.env.NODE_ENV === 'development' ? {
          name: error.name,
          message: error.message
        } : undefined
      });
    }
  },

  async obtenerInscripcionesAsignatura(req, res) {
    try {
      const { asignaturaId } = req.params;
      const { semestre } = req.query;

      if (!asignaturaId || isNaN(asignaturaId)) {
        return res.status(400).json({
          status: 'error',
          mensaje: 'ID de asignatura no válido',
          sugerencia: 'Proporcione un ID numérico válido'
        });
      }

      const where = { asignaturaId };
      if (semestre) where.semestre = semestre;

      const inscripciones = await Inscripcion.findAll({
        where,
        include: [{
          model: Estudiante,
          as: 'estudiante',
          attributes: ['matricula', 'nombre', 'apellido']
        }],
        order: [['semestre', 'DESC']]
      });

      if (inscripciones.length === 0) {
        return res.status(404).json({
          status: 'error',
          mensaje: 'No se encontraron inscripciones para esta asignatura',
          asignaturaId,
          sugerencia: 'Verifique el ID de la asignatura'
        });
      }

      res.json({
        status: 'success',
        count: inscripciones.length,
        data: inscripciones
      });
    } catch (error) {
      console.error('Error al obtener inscripciones de la asignatura:', error);
      res.status(500).json({
        status: 'error',
        mensaje: 'Error al obtener las inscripciones',
        detalle: process.env.NODE_ENV === 'development' ? {
          name: error.name,
          message: error.message
        } : undefined
      });
    }
  }
};