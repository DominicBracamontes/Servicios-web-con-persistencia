'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Personas', [
      { 
        nombre: 'Juan Pérez', 
        email: 'juan@example.com',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        nombre: 'María García', 
        email: 'maria@example.com',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        nombre: 'Carlos López', 
        email: 'carlos@example.com',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        nombre: 'Ana Martínez', 
        email: 'ana.martinez@example.com',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        nombre: 'Luis Rodríguez', 
        email: 'luis.rod@example.com',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        nombre: 'Sofía Hernández', 
        email: 'sofia.h@example.com',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        nombre: 'Pedro González', 
        email: 'pedro.gonzalez@example.com',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        nombre: 'Laura Díaz', 
        email: 'laura.diaz@example.com',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        nombre: 'Jorge Sánchez', 
        email: 'jorge.s@example.com',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        nombre: 'Mónica Ramírez', 
        email: 'monica.ramirez@example.com',
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Personas', null, {});
  }
};