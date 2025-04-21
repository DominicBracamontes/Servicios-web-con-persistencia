const { Asignatura, Docente, Estudiante, sequelize } = require('../models');

module.exports = {
  async obtenerAsignaturas(req, res) {
    try {
      const asignaturas = await Asignatura.findAll({
        attributes: ['clave', 'nombre', 'creditos'],
        include: [
          {
            model: Docente,
            as: 'docentes',
            attributes: ['numEmpleado'],
            through: { attributes: [] }
          },
          {
            model: Estudiante,
            as: 'estudiantes',
            attributes: ['matricula'],
            through: { attributes: [] }
          }
        ],
        order: [['nombre', 'ASC']]
      });
      
      res.json(asignaturas);
    } catch (error) {
      console.error('Error al obtener asignaturas:', error);
      res.status(500).json({ 
        error: 'Error al obtener asignaturas',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async obtenerAsignatura(req, res) {
    try {
      const { clave } = req.params;
      
      if (isNaN(clave)) {
        return res.status(400).json({ 
          error: 'Clave inválida',
          message: 'La clave debe ser un número'
        });
      }

      const asignatura = await Asignatura.findOne({
        where: { clave: clave },
        include: [
          {
            model: Docente,
            as: 'docentes',
            attributes: ['numEmpleado'],
            through: { attributes: [] },
            include: [{
              association: 'persona',
              attributes: ['nombre']
            }]
          },
          {
            model: Estudiante,
            as: 'estudiantes',
            attributes: ['matricula'],
            through: { attributes: [] },
            include: [{
              association: 'persona',
              attributes: ['nombre']
            }]
          }
        ]
      });

      if (!asignatura) {
        return res.status(404).json({ 
          error: 'Asignatura no encontrada',
          claveBuscada: clave
        });
      }

      res.json(asignatura);
    } catch (error) {
      console.error('Error al obtener asignatura:', error);
      res.status(500).json({ 
        error: 'Error al obtener asignatura',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async crearAsignatura(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { clave, nombre, creditos } = req.body;

      if (!clave || !nombre || creditos === undefined) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'Datos incompletos',
          camposRequeridos: ['clave', 'nombre', 'creditos']
        });
      }

      const existe = await Asignatura.findOne({ where: { clave }, transaction });
      if (existe) {
        await transaction.rollback();
        return res.status(409).json({
          error: 'La clave ya existe',
          asignaturaExistente: {
            clave: existe.clave,
            nombre: existe.nombre
          }
        });
      }

      const nuevaAsignatura = await Asignatura.create({
        clave,
        nombre,
        creditos
      }, { transaction });

      await transaction.commit();
      res.status(201).json(nuevaAsignatura);
    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear asignatura:', error);
      res.status(500).json({ 
        error: 'Error al crear asignatura',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async actualizarAsignaturaPUT(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { clave } = req.params;
      const { nuevaClave, nombre, creditos } = req.body;
  
      if (!nuevaClave || !nombre || creditos === undefined) {
        await transaction.rollback();
        const camposFaltantes = [];
        if (!nuevaClave) camposFaltantes.push('nuevaClave');
        if (!nombre) camposFaltantes.push('nombre');
        if (creditos === undefined) camposFaltantes.push('creditos');
        
        return res.status(400).json({ 
          error: 'Faltan parámetros requeridos',
          mensaje: `Para actualización completa (PUT) deben proporcionarse todos los campos obligatorios.`,
          camposFaltantes,
          camposRequeridos: ['nuevaClave', 'nombre', 'creditos'],
          ejemplo: {
            nuevaClave: "NuevoValorClave",
            nombre: "Nuevo nombre de asignatura",
            creditos: 4
          }
        });
      }
  
      const asignatura = await Asignatura.findOne({ 
        where: { clave },
        transaction
      });
  
      if (!asignatura) {
        await transaction.rollback();
        return res.status(404).json({ 
          error: 'Recurso no encontrado',
          mensaje: `No se encontró ninguna asignatura con la clave ${clave}`,
          sugerencia: 'Verifique la clave e intente nuevamente'
        });
      }
  
      if (nuevaClave !== clave) {
        const existe = await Asignatura.findOne({ 
          where: { clave: nuevaClave },
          transaction
        });
        
        if (existe) {
          await transaction.rollback();
          return res.status(409).json({ 
            error: 'Conflicto de claves',
            mensaje: `Ya existe una asignatura con la clave ${nuevaClave}`,
            asignaturaExistente: {
              clave: existe.clave,
              nombre: existe.nombre,
              creditos: existe.creditos
            },
            sugerencia: 'Proporcione una clave única para la asignatura'
          });
        }
  
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });
  
        try {
          await Promise.all([
            sequelize.models.Inscripcion.update(
              { asignaturaId: nuevaClave },
              { where: { asignaturaId: clave }, transaction }
            ),
            sequelize.models.Contrato.update(
              { asignaturaId: nuevaClave },
              { where: { asignaturaId: clave }, transaction }
            )
          ]);
  
          await asignatura.update({ clave: nuevaClave }, { transaction });
        } finally {
          await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });
        }
      }
  
      await asignatura.update({
        nombre,
        creditos
      }, { transaction });
  
      await transaction.commit();
      
      const resultado = await Asignatura.findByPk(nuevaClave, {
        include: [
          {
            model: Docente,
            as: 'docentes',
            through: { attributes: [] }
          },
          {
            model: Estudiante,
            as: 'estudiantes',
            through: { attributes: [] }
          }
        ]
      });
  
      return res.json({
        success: true,
        mensaje: 'Asignatura actualizada exitosamente',
        data: resultado
      });
  
    } catch (error) {
      await transaction.rollback();
      console.error('Error al actualizar asignatura:', error);
      
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        mensaje: 'Ocurrió un error al procesar la solicitud',
        detalle: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined,
        sugerencia: 'Intente nuevamente o contacte al administrador'
      });
    }
  },

  async modificarAsignaturaPATCH(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { clave } = req.params;
      const { nuevaClave, nombre, creditos } = req.body;
  
      const asignatura = await Asignatura.findOne({ 
        where: { clave },
        transaction
      });
  
      if (!asignatura) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Asignatura no encontrada' });
      }
  
      if (nuevaClave && nuevaClave !== clave) {
        const existe = await Asignatura.findOne({ 
          where: { clave: nuevaClave },
          transaction
        });
        
        if (existe) {
          await transaction.rollback();
          return res.status(409).json({ error: 'La nueva clave ya está en uso' });
        }
  
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });
  
        try {
          await Promise.all([
            sequelize.models.Inscripcion.update(
              { asignaturaId: nuevaClave },
              { where: { asignaturaId: clave }, transaction }
            ),
            sequelize.models.Contrato.update(
              { asignaturaId: nuevaClave },
              { where: { asignaturaId: clave }, transaction }
            )
          ]);
  
          await asignatura.update({ clave: nuevaClave }, { transaction });
  
        } finally {
          await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });
        }
      }
  
      const updates = {};
      if (nombre !== undefined) updates.nombre = nombre;
      if (creditos !== undefined) updates.creditos = creditos;
  
      if (Object.keys(updates).length > 0) {
        await asignatura.update(updates, { transaction });
      }
  
      await transaction.commit();
      
      const claveActual = nuevaClave || clave;
      const resultado = await Asignatura.findByPk(claveActual, {
        include: [
          {
            model: Docente,
            as: 'docentes',
            through: { attributes: [] }
          },
          {
            model: Estudiante,
            as: 'estudiantes',
            through: { attributes: [] }
          }
        ]
      });
  
      res.json(resultado);
    } catch (error) {
      await transaction.rollback();
      console.error('Error:', error);
      res.status(500).json({ 
        error: 'Error al actualizar asignatura',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
  async eliminarAsignatura(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { clave } = req.params;
  
      const asignatura = await Asignatura.findOne({
        where: { clave },
        transaction
      });
  
      if (!asignatura) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          error: 'Recurso no encontrado',
          mensaje: `No existe ninguna asignatura con la clave ${clave}`,
          sugerencia: 'Verifique el parámetro clave e intente nuevamente'
        });
      }
  
      const [docentesCount, estudiantesCount] = await Promise.all([
        sequelize.models.Contrato.count({
          where: { asignaturaId: clave },
          transaction
        }),
        sequelize.models.Inscripcion.count({
          where: { asignaturaId: clave },
          transaction
        })
      ]);
  
      if (docentesCount > 0 || estudiantesCount > 0) {
        await transaction.rollback();
        return res.status(409).json({
          status: 'error',
          error: 'Conflictos de dependencia',
          mensaje: 'No se puede eliminar la asignatura porque tiene relaciones activas',
          detalles: {
            docentesAsociados: docentesCount,
            estudiantesInscritos: estudiantesCount
          },
          opciones: [
            'Elimine primero todas las inscripciones y contratos asociados',
            'Cambie el onDelete a CASCADE en las relaciones si desea eliminación automática'
          ]
        });
      }
  
      await asignatura.destroy({ transaction });
      await transaction.commit();
  
      return res.json({
        status: 'success',
        mensaje: `Asignatura "${asignatura.nombre}" eliminada correctamente`,
        data: {
          clave: asignatura.clave,
          nombre: asignatura.nombre
        }
      });
  
    } catch (error) {
      await transaction.rollback();
      console.error('Error al eliminar asignatura:', error);
      
      return res.status(500).json({
        status: 'error',
        error: 'Error de servidor',
        mensaje: 'Ocurrió un error al procesar la solicitud',
        detalle: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined,
        sugerencia: 'Intente nuevamente o contacte al administrador del sistema'
      });
    }
  },

  async asignarDocente(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { clave, numEmpleado } = req.params;

      const [asignatura, docente] = await Promise.all([
        Asignatura.findByPk(clave, { transaction }),
        Docente.findByPk(numEmpleado, { transaction })
      ]);

      if (!asignatura || !docente) {
        await transaction.rollback();
        return res.status(404).json({
          error: 'Recurso no encontrado',
          detalles: {
            asignatura: asignatura ? 'Encontrada' : 'No encontrada',
            docente: docente ? 'Encontrado' : 'No encontrado'
          }
        });
      }

      await asignatura.addDocente(docente, { transaction });
      await transaction.commit();
      
      res.json({
        success: true,
        message: 'Docente asignado correctamente',
        asignatura: asignatura.clave,
        docente: docente.numEmpleado
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error al asignar docente:', error);
      res.status(500).json({ 
        error: 'Error al asignar docente',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async removerDocente(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { clave, numEmpleado } = req.params;

      const [asignatura, docente] = await Promise.all([
        Asignatura.findByPk(clave, { transaction }),
        Docente.findByPk(numEmpleado, { transaction })
      ]);

      if (!asignatura || !docente) {
        await transaction.rollback();
        return res.status(404).json({
          error: 'Recurso no encontrado',
          detalles: {
            asignatura: asignatura ? 'Encontrada' : 'No encontrada',
            docente: docente ? 'Encontrado' : 'No encontrado'
          }
        });
      }

      await asignatura.removeDocente(docente, { transaction });
      await transaction.commit();
      
      res.json({
        success: true,
        message: 'Docente removido correctamente',
        asignatura: asignatura.clave,
        docente: docente.numEmpleado
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error al remover docente:', error);
      res.status(500).json({ 
        error: 'Error al remover docente',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};