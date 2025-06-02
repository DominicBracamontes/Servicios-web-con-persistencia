const { Docente, Persona, CategoriaEmpleado, Asignatura, Contrato, sequelize, } = require('../models');

function handleError(res, error, contexto = 'Error') {
  console.error(`Error en ${contexto}:`, error);
  res.status(500).json({
    status: 'error',
    message: `Ocurrió un error en ${contexto}`,
    details: error.message
  });
}
module.exports = {
  async crearDocente(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { numEmpleado, categoriaId, persona } = req.body;

      if (!numEmpleado || !categoriaId || !persona?.nombre) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Número de empleado, categoría y nombre son requeridos'
        });
      }

      const empleadoExistente = await Docente.findOne({
        where: { numEmpleado },
        transaction
      });

      if (empleadoExistente) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'El número de empleado ya está registrado'
        });
      }

      const email = persona.email || 'correo@uabc.edu.mx';
      const telefono = persona.telefono || '0000000000';

      const nuevaPersona = await Persona.create({
        nombre: persona.nombre,
        email,
        telefono
      }, { transaction });

      const docente = await Docente.create({
        numEmpleado,
        personaId: nuevaPersona.id,
        categoriaId
      }, { transaction });

      await transaction.commit();

      res.status(201).json({
        mensaje: 'Docente creado correctamente',
        docente,
        persona: nuevaPersona
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear docente:', error);
      res.status(500).json({
        error: 'Error al crear docente',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async obtenerDocentes(req, res) {
    try {
      const docentes = await Docente.findAll({
        include: [
          {
            model: Persona,
            as: 'persona',
            attributes: ['id', 'nombre', 'email']
          },
          {
            model: CategoriaEmpleado,
            as: 'categoria',
            attributes: ['clave', 'nombre']
          }
        ],
        order: [['numEmpleado', 'ASC']]
      });

      res.json(docentes);
    } catch (error) {
      console.error('Error al obtener docentes:', error);
      res.status(500).json({
        error: 'Error al obtener docentes',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },


  async obtenerDocente(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const docente = await Docente.findOne({
        where: { numEmpleado: id },
        include: [
          {
            model: Persona,
            as: 'persona',
            attributes: ['id', 'nombre', 'email']
          },
          {
            model: CategoriaEmpleado,
            as: 'categoria',
            attributes: ['clave', 'nombre']
          },
          {
            model: Asignatura,
            as: 'asignaturas',
            through: { attributes: [] },
            attributes: ['clave', 'nombre', 'creditos']
          }
        ]
      });

      if (!docente) {
        return res.status(404).json({ error: 'Docente no encontrado' });
      }

      res.json(docente);
    } catch (error) {
      console.error('Error al obtener docente:', error);

      const status = error.name === 'SequelizeDatabaseError' ? 400 : 500;
      const errorResponse = {
        error: status === 400 ? 'Error en la consulta' : 'Error al obtener docente'
      };

      if (process.env.NODE_ENV === 'development') {
        errorResponse.detalle = {
          message: error.message,
          stack: error.stack,
          sql: error.sql
        };
      }

      res.status(status).json(errorResponse);
    }
  },

  async actualizarDocentePUT(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { numEmpleado } = req.params;
      const { nuevoNumEmpleado, categoriaId, persona } = req.body;

      if (!nuevoNumEmpleado || !categoriaId || !persona?.nombre) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Datos incompletos',
          detalles: {
            faltantes: [
              ...(!nuevoNumEmpleado ? ['nuevoNumEmpleado'] : []),
              ...(!categoriaId ? ['categoriaId'] : []),
              ...(!persona?.nombre ? ['persona.nombre'] : [])
            ]
          }
        });
      }

      const docente = await Docente.findOne({
        where: { numEmpleado },
        include: [{ model: Persona, as: 'persona' }],
        transaction,
        lock: true
      });

      if (!docente) {
        await transaction.rollback();
        return res.status(404).json({
          error: 'Docente no encontrado',
          numEmpleadoBuscado: numEmpleado
        });
      }

      if (nuevoNumEmpleado !== numEmpleado) {
        const existe = await Docente.findOne({
          where: { numEmpleado: nuevoNumEmpleado },
          transaction
        });

        if (existe) {
          await transaction.rollback();
          return res.status(409).json({
            error: 'Número de empleado en uso',
            conflictoCon: existe.persona?.nombre || 'Sin nombre registrado'
          });
        }
      }

      await sequelize.query(
        `UPDATE Docentes SET numEmpleado = ?, categoriaId = ? WHERE numEmpleado = ?`,
        {
          replacements: [nuevoNumEmpleado, categoriaId, numEmpleado],
          transaction
        }
      );

      if (nuevoNumEmpleado !== numEmpleado) {
        await sequelize.query(
          `UPDATE Contratos SET docenteId = ? WHERE docenteId = ?`,
          {
            replacements: [nuevoNumEmpleado, numEmpleado],
            transaction
          }
        );
      }

      await docente.persona.update({
        nombre: persona.nombre,
        email: persona.email || docente.persona.email
      }, { transaction });

      await transaction.commit();

      const docenteActualizado = await Docente.findOne({
        where: { numEmpleado: nuevoNumEmpleado },
        include: [
          { model: Persona, as: 'persona' },
          { model: CategoriaEmpleado, as: 'categoria' }
        ]
      });

      return res.json({
        success: true,
        message: 'Docente actualizado exitosamente',
        data: docenteActualizado
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error detallado:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        original: error.original || null
      });

      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
          error: 'Error de integridad de datos',
          mensaje: 'No se pudo completar la actualización por restricciones de la base de datos',
          ...(process.env.NODE_ENV === 'development' && {
            detalle: error.message,
            solucion: 'Verifique que todas las referencias existan antes de actualizar'
          })
        });
      }

      return res.status(500).json({
        error: 'Error interno en el servidor',
        ...(process.env.NODE_ENV === 'development' && {
          detalle: error.message
        })
      });
    }
  },

  async modificaDocentePATCH(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { numEmpleado } = req.params;
      const { nuevoNumEmpleado, categoriaId, persona } = req.body;

      if (!nuevoNumEmpleado && !categoriaId && !persona) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Debe proporcionar al menos un campo para actualizar',
          camposDisponibles: ['nuevoNumEmpleado', 'categoriaId', 'persona']
        });
      }

      const docente = await Docente.findOne({
        where: { numEmpleado },
        include: [{ model: Persona, as: 'persona' }],
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!docente) {
        await transaction.rollback();
        return res.status(404).json({
          error: 'Docente no encontrado',
          numEmpleadoBuscado: numEmpleado
        });
      }

      let numeroFinal = numEmpleado;

      if (nuevoNumEmpleado != null && nuevoNumEmpleado !== '') {
        if (!/^\d+$/.test(nuevoNumEmpleado)) {
          await transaction.rollback();
          return res.status(400).json({
            error: 'Formato inválido',
            detalle: 'El número de empleado debe contener solo dígitos'
          });
        }

        const existeNumero = await Docente.findOne({
          where: { numEmpleado: nuevoNumEmpleado },
          transaction
        });

        // Solo hay conflicto si el número existe y pertenece a otro docente
        if (existeNumero && existeNumero.numEmpleado !== numEmpleado) {
          await transaction.rollback();
          return res.status(409).json({
            error: 'Número de empleado en uso',
            conflictoCon: existeNumero.persona?.nombre || 'Docente sin nombre registrado'
          });
        }

        // Aunque sea el mismo número, se actualizará por consistencia
        await sequelize.query(
          `UPDATE Docentes SET numEmpleado = ? WHERE numEmpleado = ?`,
          {
            replacements: [nuevoNumEmpleado, numEmpleado],
            transaction
          }
        );

        await sequelize.models.Contrato.update(
          { docenteId: nuevoNumEmpleado },
          {
            where: { docenteId: numEmpleado },
            transaction,
            individualHooks: true
          }
        );

        numeroFinal = nuevoNumEmpleado;
      }

      if (categoriaId) {
        await sequelize.query(
          `UPDATE Docentes SET categoriaId = ? WHERE numEmpleado = ?`,
          {
            replacements: [categoriaId, numeroFinal],
            transaction
          }
        );
      }

      if (persona && Object.keys(persona).length > 0) {
        const updateData = {};
        if (persona.nombre) updateData.nombre = persona.nombre;
        if (persona.email) updateData.email = persona.email;

        if (Object.keys(updateData).length > 0) {
          await docente.persona.update(updateData, { transaction });
        }
      }

      const docenteActualizado = await Docente.findByPk(numeroFinal, {
        include: [
          { model: Persona, as: 'persona' },
          { model: CategoriaEmpleado, as: 'categoria' }
        ],
        transaction
      });

      await transaction.commit();

      return res.json({
        success: true,
        message: 'Docente actualizado exitosamente',
        cambios: {
          ...(nuevoNumEmpleado ? { numEmpleado: { anterior: numEmpleado, nuevo: nuevoNumEmpleado } } : {}),
          ...(categoriaId ? { categoriaId } : {}),
          ...(persona && Object.keys(persona).length > 0 ? { persona: Object.keys(persona) } : {})
        },
        data: docenteActualizado
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en modificaDocentePATCH:', error);
      return res.status(500).json({
        error: 'Error al actualizar docente',
        detalle: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      });
    }
  },

  async eliminarDocente(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;

      const docente = await Docente.findByPk(id, {
        include: [{
          model: Persona,
          as: 'persona',
          paranoid: false
        }],
        transaction
      });

      if (!docente) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Docente no encontrado' });
      }

      await Contrato.destroy({
        where: { docenteId: docente.numEmpleado },
        transaction
      });

      await docente.destroy({
        force: true,
        transaction
      });

      if (docente.persona) {
        await docente.persona.destroy({
          force: true,
          transaction
        });
      }

      await transaction.commit();
      return res.json({
        mensaje: 'Docente, contratos y persona asociada eliminados permanentemente',
        detalles: {
          numEmpleado: docente.numEmpleado,
          personaId: docente.personaId
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error al eliminar docente:', error);
      return res.status(500).json({
        error: 'Error al eliminar docente',
        detalle: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      });
    }
  },

  async obtenerContratosDeDocente(req, res) {
    try {
      const { docenteId } = req.params;

      const contratos = await Contrato.findAll({
        where: { docenteId },
        include: [
          {
            model: Asignatura,
            as: 'asignatura',
            attributes: ['id', 'clave', 'nombre', 'creditos']
          },
          {
            model: Docente,
            as: 'docente',
            attributes: ['numEmpleado'],
            include: [{
              model: Persona,
              as: 'persona',
              attributes: ['nombre', 'email']
            }]
          }
        ]
      });

      if (contratos.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'El docente no tiene contratos registrados.'
        });
      }

      res.json({
        status: 'success',
        data: contratos.map(c => ({
          id: c.id,
          fechaInicio: c.fechaInicio,
          fechaFin: c.fechaFin,
          asignatura: c.asignatura,
          docente: c.docente
        })),
        count: contratos.length
      });

    } catch (error) {
      handleError(res, error, 'obtener contratos del docente');
    }
  },

  async asignarAsignatura(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { asignaturaId, periodo } = req.body;

      const docente = await Docente.findByPk(id, { transaction });
      if (!docente) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Docente no encontrado' });
      }

      const asignatura = await Asignatura.findByPk(asignaturaId, { transaction });
      if (!asignatura) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Asignatura no encontrada' });
      }

      const contratoExistente = await Contrato.findOne({
        where: {
          docenteId: docente.numEmpleado,
          asignaturaId
        },
        transaction
      });

      if (contratoExistente) {
        await transaction.rollback();
        return res.status(400).json({ error: 'El docente ya tiene asignada esta asignatura' });
      }

      await Contrato.create({
        docenteId: docente.numEmpleado,
        asignaturaId,
        periodo
      }, { transaction });

      await transaction.commit();
      res.json({ mensaje: 'Asignatura asignada correctamente al docente' });
    } catch (error) {
      await transaction.rollback();
      console.error('Error al asignar asignatura:', error);
      res.status(500).json({
        error: 'Error al asignar asignatura',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};