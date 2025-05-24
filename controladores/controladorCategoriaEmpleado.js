const { CategoriaEmpleado, Docente, sequelize } = require('../models');

module.exports = {
    async obtenerCategorias(req, res) {
        try {
          const categorias = await CategoriaEmpleado.findAll({
            attributes: ['clave', 'nombre'], 
            order: [['clave', 'ASC']]
          });
    
          res.json(categorias);
        } catch (error) {
          console.error('Error al obtener categorías:', error);
          res.status(500).json({ 
            error: 'Error al obtener categorías',
            detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }
      },

      async obtenerCategoria(req, res) {
        try {
          const { clave } = req.params;
      
          const categoria = await CategoriaEmpleado.findOne({
            where: { clave },  
            include: [{
              model: Docente,
              as: 'docentes',
              attributes: ['numEmpleado'],
              include: [{
                association: 'persona',
                attributes: ['nombre']
              }]
            }]
          });
      
          if (!categoria) {
            return res.status(404).json({ 
              error: 'Categoría no encontrada',
              claveSolicitada: clave
            });
          }
      
          res.json(categoria);
        } catch (error) {
          console.error('Error al obtener categoría:', error);
          res.status(500).json({ 
            error: 'Error al obtener categoría',
            detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }
      },
      


  async crearCategoria(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { clave, nombre, descripcion } = req.body;

      if (!clave || isNaN(clave)) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Clave inválida',
          detalle: 'La clave debe ser un número'
        });
      }

      if (!nombre || nombre.trim().length < 3) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Nombre inválido',
          detalle: 'El nombre debe tener al menos 3 caracteres'
        });
      }

      const existe = await CategoriaEmpleado.findOne({
        where: { clave },
        transaction
      });

      if (existe) {
        await transaction.rollback();
        return res.status(409).json({
          error: 'La clave ya existe',
          categoriaExistente: {
            clave: existe.clave,
            nombre: existe.nombre
          }
        });
      }

      const nuevaCategoria = await CategoriaEmpleado.create({
        clave,
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null
      }, { transaction });

      await transaction.commit();
      res.status(201).json(nuevaCategoria);
    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear categoría:', error);
      res.status(500).json({
        error: 'Error al crear categoría',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async actualizarCategoriaPUT(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { clave } = req.params;
      const { nombre, descripcion } = req.body;

      if (!nombre || nombre.trim().length < 3) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Nombre inválido',
          detalle: 'El nombre debe tener al menos 3 caracteres'
        });
      }

      const [updated] = await CategoriaEmpleado.update({
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null
      }, {
        where: { clave },
        transaction
      });

      if (updated === 0) {
        await transaction.rollback();
        return res.status(404).json({
          error: 'Categoría no encontrada',
          claveSolicitada: clave
        });
      }

      const categoriaActualizada = await CategoriaEmpleado.findByPk(clave, { transaction });
      await transaction.commit();
      res.json(categoriaActualizada);
    } catch (error) {
      await transaction.rollback();
      console.error('Error al actualizar categoría (PUT):', error);
      res.status(500).json({
        error: 'Error al actualizar categoría',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async modificarCategoriaPATCH(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { clave } = req.params;
      const { nombre, descripcion } = req.body;

      if (!nombre && !descripcion) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Debe proporcionar al menos un campo para actualizar',
          camposDisponibles: ['nombre', 'descripcion']
        });
      }

      const categoria = await CategoriaEmpleado.findByPk(clave, { transaction });
      
      if (!categoria) {
        await transaction.rollback();
        return res.status(404).json({ 
          error: 'Categoría no encontrada',
          claveSolicitada: clave
        });
      }

      if (nombre) {
        if (nombre.trim().length < 3) {
          await transaction.rollback();
          return res.status(400).json({
            error: 'Nombre inválido',
            detalle: 'El nombre debe tener al menos 3 caracteres'
          });
        }
        categoria.nombre = nombre.trim();
      }

      if (descripcion !== undefined) {
        categoria.descripcion = descripcion ? descripcion.trim() : null;
      }

      await categoria.save({ transaction });
      await transaction.commit();
      
      res.json({
        success: true,
        data: categoria
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error en PATCH /categoriaEmpleados/:clave:', error);
      res.status(500).json({
        error: 'Error al actualizar la categoría',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async eliminarCategoria(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { clave } = req.params;

      if (parseInt(clave) === 0) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Operación no permitida',
          message: 'No se puede eliminar la categoría por defecto (0)'
        });
      }

      const categoria = await CategoriaEmpleado.findByPk(clave, { transaction });
      
      if (!categoria) {
        await transaction.rollback();
        return res.status(404).json({ 
          error: 'Categoría no encontrada',
          claveSolicitada: clave
        });
      }

      const [docentesActualizados] = await Docente.update(
        { categoriaId: 0 },
        { 
          where: { categoriaId: clave },
          transaction
        }
      );

      await categoria.destroy({ transaction });
      
      await transaction.commit();

      res.json({
        success: true,
        message: 'Categoría eliminada y docentes reasignados',
        detalles: {
          categoriaEliminada: clave,
          docentesReasignados: docentesActualizados
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error al eliminar categoría:', error);
      res.status(500).json({
        error: 'Error al eliminar categoría',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

};