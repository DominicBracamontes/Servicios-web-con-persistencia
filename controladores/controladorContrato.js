const { Contrato, Docente, Asignatura, Persona, sequelize } = require('../models');

const handleError = (res, error, operation = 'operación', statusCode = 500) => {
  console.error(`Error al ${operation}:`, error);
  
  const response = {
    status: 'error',
    message: `Error al ${operation}`,
  };

  if (process.env.NODE_ENV === 'development') {
    response.error = {
      name: error.name,
      message: error.message,
      ...(error.errors && { details: error.errors.map(e => e.message) })
    };
  }

  res.status(statusCode).json(response);
};

module.exports = {

  async obtenerContratos(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
  
      const { count, rows: contratos } = await Contrato.findAndCountAll({
        include: [
          {
            model: Docente,
            as: 'docente',
            attributes: ['numEmpleado'],
            include: [
              {
                model: Persona,
                as: 'persona',
                attributes: ['nombre', 'email']
              }
            ]
          },
          {
            model: Asignatura,
            as: 'asignatura',
            attributes: ['clave', 'nombre', 'creditos']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });
  
      res.json({
        status: 'success',
        data: contratos,
        pagination: {
          total: count,
          page: parseInt(page),
          totalPages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      handleError(res, error, 'obtener contratos');
    }
  }
,  
  async crearContrato(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { numEmpleado, clave } = req.body;
  
      if (!numEmpleado || !clave) {
        return res.status(400).json({
          status: 'error',
          message: 'Faltan campos requeridos: numEmpleado o clave',
          datosRecibidos: { numEmpleado, clave }
        });
      }
  
      const [docente, asignatura] = await Promise.all([
        Docente.findOne({
          where: { numEmpleado },
          include: [{
            model: Persona,
            as: 'persona',
            attributes: ['nombre']
          }],
          transaction
        }),
        Asignatura.findOne({
          where: { clave },
          transaction
        })
      ]);
  
      if (!docente || !asignatura) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Docente o asignatura no encontrados',
          details: {
            docente: docente ? 'Encontrado' : 'No encontrado',
            asignatura: asignatura ? 'Encontrada' : 'No encontrada'
          }
        });
      }
  
      const contratoExistente = await Contrato.findOne({
        where: {
          docenteId: docente.numEmpleado,
          asignaturaId: asignatura.clave
        },
        transaction
      });
  
      if (contratoExistente) {
        await transaction.rollback();
        return res.status(409).json({
          status: 'error',
          message: 'El contrato ya existe para este docente y asignatura.'
        });
      }
  
      const nuevoContrato = await Contrato.create({
        docenteId: docente.numEmpleado,
        asignaturaId: asignatura.clave,
        creadoPor: req.user?.id
      }, { transaction });
  
      await transaction.commit();
  
      res.status(201).json({
        status: 'success',
        data: {
          id: nuevoContrato.id,
          docente: {
            numEmpleado: docente.numEmpleado,
            nombre: docente.persona?.nombre
          },
          asignatura: {
            clave: asignatura.clave,
            nombre: asignatura.nombre
          }
        },
        message: 'Contrato creado exitosamente'
      });
  
    } catch (error) {
      await transaction.rollback();
      handleError(res, error, 'crear contrato');
    }
  }
,  
  
  async putContrato(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { numEmpleado } = req.params;
      const { clave, nuevoNumEmpleado, nuevaClave } = req.body;
  
      if (!clave || !nuevoNumEmpleado || !nuevaClave) {
        return res.status(400).json({
          status: 'error',
          message: 'Faltan campos requeridos: clave, nuevoNumEmpleado o nuevaClave'
        });
      }
  
      const contrato = await Contrato.findOne({
        where: {
          docenteId: numEmpleado,
          asignaturaId: clave
        },
        transaction
      });
  
      if (!contrato) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Contrato original no encontrado con ese numEmpleado y clave'
        });
      }
  
      const [nuevoDocente, nuevaAsignatura] = await Promise.all([
        Docente.findOne({ where: { numEmpleado: nuevoNumEmpleado }, transaction }),
        Asignatura.findOne({ where: { clave: nuevaClave }, transaction })
      ]);
  
      if (!nuevoDocente || !nuevaAsignatura) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Nuevo docente o asignatura no encontrados',
          details: {
            docente: nuevoDocente ? 'Encontrado' : 'No encontrado',
            asignatura: nuevaAsignatura ? 'Encontrada' : 'No encontrada'
          }
        });
      }
  
      const contratoExistente = await Contrato.findOne({
        where: {
          docenteId: nuevoNumEmpleado,
          asignaturaId: nuevaClave
        },
        transaction
      });
  
      if (contratoExistente && contratoExistente.id !== contrato.id) {
        await transaction.rollback();
        return res.status(409).json({
          status: 'error',
          message: 'Ya existe un contrato con ese docente y asignatura'
        });
      }
  
      contrato.docenteId = nuevoNumEmpleado;
      contrato.asignaturaId = nuevaClave;
      await contrato.save({ transaction });
  
      await transaction.commit();
  
      res.status(200).json({
        status: 'success',
        message: 'Contrato actualizado exitosamente',
        data: {
          id: contrato.id,
          nuevoNumEmpleado,
          nuevaClave
        }
      });
  
    } catch (error) {
      await transaction.rollback();
      handleError(res, error, 'actualizar contrato');
    }
  },

  async  actualizarContratoParcial(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { numEmpleado } = req.params;  
      const { clave, nuevoNumEmpleado, nuevaClave } = req.body;  
  
      if (!clave) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'La clave original es obligatoria'
        });
      }
  
      if (!nuevoNumEmpleado && !nuevaClave) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'Faltan campos requeridos: nuevoNumEmpleado o nuevaClave'
        });
      }
  
      const contrato = await Contrato.findOne({
        where: { docenteId: numEmpleado, asignaturaId: clave },
        transaction
      });
  
      if (!contrato) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Contrato no encontrado con la clave original proporcionada'
        });
      }
  
      if (nuevoNumEmpleado) {
        const nuevoDocente = await Docente.findOne({ where: { numEmpleado: nuevoNumEmpleado }, transaction });
  
        if (!nuevoDocente) {
          await transaction.rollback();
          return res.status(404).json({
            status: 'error',
            message: 'Nuevo docente no encontrado'
          });
        }
  
        contrato.docenteId = nuevoDocente.numEmpleado;
      }
  
      if (nuevaClave) {
        const nuevaAsignatura = await Asignatura.findOne({ where: { clave: nuevaClave }, transaction });
  
        if (!nuevaAsignatura) {
          await transaction.rollback();
          return res.status(404).json({
            status: 'error',
            message: 'Nueva asignatura no encontrada'
          });
        }
  
        contrato.asignaturaId = nuevaAsignatura.clave;
      }
  
      await contrato.save({ transaction });
  
      await transaction.commit();
  
      res.status(200).json({
        status: 'success',
        message: 'Contrato actualizado parcialmente',
        data: {
          docente: {
            numEmpleado: contrato.docenteId,
          },
          asignatura: {
            clave: contrato.asignaturaId
          }
        }
      });
  
    } catch (error) {
      await transaction.rollback();
      console.error('Error al actualizar contrato:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al actualizar contrato',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },  
  
  async eliminarContrato(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { numEmpleado } = req.params;  
      const { clave } = req.body;  
  
      if (!clave) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'La clave de asignatura es obligatoria'
        });
      }
  
      const contrato = await Contrato.findOne({
        where: { docenteId: numEmpleado, asignaturaId: clave },
        transaction
      });
  
      if (!contrato) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Contrato no encontrado'
        });
      }
  
      await contrato.destroy({ transaction });
  
      await transaction.commit();
  
      res.status(200).json({
        status: 'success',
        message: 'Contrato eliminado exitosamente'
      });
  
    } catch (error) {
      await transaction.rollback();
      console.error('Error al eliminar contrato:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al eliminar contrato',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
async obtenerContratoPorId(req, res) {
  try {
    const { id } = req.params;

    const contrato = await Contrato.findByPk(id, {
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

    if (!contrato) {
      return res.status(404).json({
        status: 'error',
        message: `No se encontró el contrato con ID ${id}`
      });
    }

    res.json({
      status: 'success',
      data: {
        id: contrato.id,
        fechaInicio: contrato.fechaInicio,
        fechaFin: contrato.fechaFin,
        asignatura: contrato.asignatura,
        docente: contrato.docente
      }
    });

  } catch (error) {
    handleError(res, error, 'obtener contrato por ID');
  }
}

};