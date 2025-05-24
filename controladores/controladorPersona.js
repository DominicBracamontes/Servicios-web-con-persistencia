const { Persona, Estudiante, Docente, sequelize } = require('../models');

module.exports = {
  async obtenerPersonas(req, res) {
    try {
      const personas = await Persona.findAll({
        include: [
          { model: Estudiante, as: 'estudiante' },
          { model: Docente, as: 'docente' }
        ],
        paranoid: req.query.paranoid === 'false'
      });
      res.json(personas);
    } catch (error) {
      console.error('Error en obtenerPersonas:', error);
      res.status(500).json({ 
        error: 'Error al obtener personas',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  },

  async obtenerPersonaPorNombre(req, res) {
    try {
      const { nombre } = req.params; 
      
      if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido en la URL (ej: /personas/nombre/Juan-Perez)' });
      }

      const nombreBD = nombre.replace(/-/g, ' '); 

      const persona = await Persona.findOne({
        where: { nombre: nombreBD }, 
        include: [
          { model: Estudiante, as: 'estudiante' },
          { model: Docente, as: 'docente' }
        ],
        paranoid: req.query.paranoid === 'false' 
      });

      if (!persona) {
        return res.status(404).json({ error: `No se encontró a "${nombreBD}"` });
      }

      res.json(persona);
    } catch (error) {
      console.error('Error en obtenerPersonaPorNombre:', error);
      res.status(500).json({ 
        error: 'Error al buscar la persona',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  },

  async crearPersona(req, res) {
    try {
      const { nombre, email } = req.body;

      if (!nombre || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Formato de email inválido' });
      }

      const persona = await Persona.create({ nombre, email });
      res.status(201).json(persona);
    } catch (error) {
      console.error('Error en crearPersona:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }

      res.status(500).json({ 
        error: 'Error al crear persona',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  },

  async actualizarPersonaPorNombre(req, res) {
    try {
      const { nombre: nombreUrl } = req.params; 
      const nombreBD = nombreUrl.replace(/-/g, ' '); 

      const persona = await Persona.findOne({ where: { nombre: nombreBD } });
      
      if (!persona) {
        return res.status(404).json({ error: 'Persona no encontrada' });
      }

      const { nombre, email } = req.body;

      if (!nombre || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Formato de email inválido' });
      }

      if (email !== persona.email) {
        const existe = await Persona.findOne({ where: { email } });
        if (existe) {
          return res.status(409).json({ error: 'El email ya está registrado' });
        }
      }

      await persona.update({ nombre, email });
      res.json(persona);
    } catch (error) {
      console.error('Error en actualizarPersonaPorNombre:', error);
      res.status(500).json({ 
        error: 'Error al actualizar persona',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  },

  async modificarPersonaPorNombre(req, res) {
    try {
      const { nombre: nombreUrl } = req.params;
      const nombreBD = nombreUrl.replace(/-/g, ' '); 

      const persona = await Persona.findOne({ where: { nombre: nombreBD } });
      
      if (!persona) {
        return res.status(404).json({ error: 'Persona no encontrada' });
      }

      const { nombre, email } = req.body;
      const updates = {};

      if (nombre !== undefined) {
        if (typeof nombre !== 'string' || nombre.trim().length < 2) {
          return res.status(400).json({ error: 'Nombre debe tener al menos 2 caracteres' });
        }
        updates.nombre = nombre;
      }

      if (email !== undefined) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return res.status(400).json({ error: 'Formato de email inválido' });
        }

        if (email !== persona.email) {
          const existe = await Persona.findOne({ where: { email } });
          if (existe) {
            return res.status(409).json({ error: 'El email ya está registrado' });
          }
        }
        updates.email = email;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
      }

      await persona.update(updates);
      res.json(persona);
    } catch (error) {
      console.error('Error en modificarPersonaPorNombre:', error);
      res.status(500).json({ 
        error: 'Error al modificar persona',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  },

  async eliminarPersonaPorNombre(req, res) {
    if (!sequelize) {
        console.error('Error: sequelize no está definido');
        return res.status(500).json({ 
            error: 'Error de configuración del servidor',
            detalle: 'Conexión a la base de datos no disponible'
        });
    }

    const transaction = await sequelize.transaction();
    try {
        const { nombre: nombreUrl } = req.params;
        const nombreBD = nombreUrl.replace(/-/g, ' '); 

        const persona = await Persona.findOne({
            where: { nombre: nombreBD },
            include: [
                { model: Estudiante, as: 'estudiante' },
                { model: Docente, as: 'docente' }
            ],
            paranoid: false,
            transaction
        });

        if (!persona) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Persona no encontrada' });
        }

        if (persona.estudiante) {
            await persona.estudiante.destroy({ 
                force: true,
                transaction
            });
        }

        if (persona.docente) {
            await persona.docente.destroy({ 
                force: true,
                transaction
            });
        }

        await persona.destroy({ 
            force: true, 
            transaction 
        });

        await transaction.commit();
        
        return res.json({ 
            mensaje: 'Persona y relaciones eliminadas permanentemente',
            eliminado: {
                nombre: persona.nombre,
                estudianteEliminado: !!persona.estudiante,
                docenteEliminado: !!persona.docente
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error en eliminarPersonaPorNombre:', error);
        
        return res.status(500).json({ 
            error: 'Error al eliminar persona',
            detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
},
  async restaurarPersona(req, res) {
    try {
      const persona = await Persona.findOne({
        where: { id: req.params.id },
        paranoid: false
      });

      if (!persona) {
        return res.status(404).json({ error: 'Persona no encontrada' });
      }

      if (!persona.deletedAt) {
        return res.status(400).json({ error: 'La persona no está eliminada' });
      }

      await persona.restore();
      res.json({ message: 'Persona restaurada correctamente' });
    } catch (error) {
      console.error('Error en restaurarPersona:', error);
      res.status(500).json({ 
        error: 'Error al restaurar persona',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }
};