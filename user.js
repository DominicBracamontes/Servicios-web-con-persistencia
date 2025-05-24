'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Aquí puedes definir relaciones si es necesario
    }
    
    // Método para comparar contraseñas
    validPassword(password) {
      return bcrypt.compareSync(password, this.password);
    }
    
    // Sobrescribir toJSON para no devolver la contraseña
    toJSON() {
      const values = super.toJSON();
      delete values.password;
      return values;
    }
  }

  User.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre es requerido'
        },
        len: {
          args: [2, 50],
          msg: 'El nombre debe tener entre 2 y 50 caracteres'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Este email ya está registrado'
      },
      validate: {
        isEmail: {
          msg: 'Por favor ingrese un email válido'
        },
        notEmpty: {
          msg: 'El email es requerido'
        }
      },
      set(value) {
        this.setDataValue('email', value.toLowerCase().trim());
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La contraseña es requerida'
        },
        len: {
          args: [8, 100],
          msg: 'La contraseña debe tener al menos 8 caracteres'
        }
      },
      set(value) {
        // Hashear la contraseña antes de guardar
        const salt = bcrypt.genSaltSync(12);
        const hash = bcrypt.hashSync(value, salt);
        this.setDataValue('password', hash);
      }
    },
    rol: {
      type: DataTypes.ENUM('usuario', 'admin'),
      defaultValue: 'usuario'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
    paranoid: true, // Para borrado lógico
    defaultScope: {
      attributes: {
        exclude: ['password'] // Excluir contraseña por defecto
      }
    },
    scopes: {
      withPassword: {
        attributes: {} // Incluir contraseña cuando se necesite
      }
    }
  });

  // Hook después de crear para limpiar datos
  User.afterCreate((user) => {
    user.password = undefined;
  });

  return User;
};