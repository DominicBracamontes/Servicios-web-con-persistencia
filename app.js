const express = require('express');
const app = express();

const estudianteRouter = require('./routes/estudianteindex');
const personaRoutes = require('./routes/personaindex');
const docenteRoutes = require('./routes/docenteindex');
const asignaturaRoutes = require('./routes/asignaturaindex');
const categoriaEmpleadoRoutes = require('./routes/categoriaEmpleadoindex');
const contratoRoutes = require('./routes/contratoindex');
const inscripcionesRoutes = require('./routes/inscripcionindex');

app.use(express.json());

app.use('/estudiantes', estudianteRouter);
app.use('/personas', personaRoutes);
app.use('/docentes', docenteRoutes); 
app.use('/asignaturas', asignaturaRoutes); 
app.use('/categoriaEmpleados', categoriaEmpleadoRoutes); 
app.use('/contratos', contratoRoutes); 
app.use('/inscripciones',inscripcionesRoutes); 

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});