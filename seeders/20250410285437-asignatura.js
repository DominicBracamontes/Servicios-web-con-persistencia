'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Asignaturas', [
      { 
        clave: 101,
        nombre: 'Matemáticas Avanzadas',
        creditos: 6,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        clave: 102,
        nombre: 'Programación Orientada a Objetos',
        creditos: 8,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        clave: 103,
        nombre: 'Estructuras de Datos',
        creditos: 7,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        clave: 104,
        nombre: 'Bases de Datos',
        creditos: 8,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        clave: 105,
        nombre: 'Redes de Computadoras',
        creditos: 6,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        clave: 106,
        nombre: 'Inteligencia Artificial',
        creditos: 9,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        clave: 107,
        nombre: 'Sistemas Operativos',
        creditos: 7,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        clave: 108,
        nombre: 'Ingeniería de Software',
        creditos: 8,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        clave: 109,
        nombre: 'Seguridad Informática',
        creditos: 7,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        clave: 110,
        nombre: 'Ciencia de Datos',
        creditos: 9,
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Asignaturas', null, {});
  }
};