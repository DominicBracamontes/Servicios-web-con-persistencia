const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const app = express();

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  minVersion: 'TLSv1.2' 
};

const server = https.createServer(options, app);

app.use(cors({
  origin: ['https://localhost:5173', 'http://localhost:5173'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const estudianteRouter = require('./routes/estudianteindex');
const personaRoutes = require('./routes/personaindex');
const docenteRoutes = require('./routes/docenteindex');
const asignaturaRoutes = require('./routes/asignaturaindex');
const categoriaEmpleadoRoutes = require('./routes/categoriaEmpleadoindex');
const contratoRoutes = require('./routes/contratoindex');
const inscripcionesRoutes = require('./routes/inscripcionindex');

app.use('/estudiantes', estudianteRouter);
app.use('/personas', personaRoutes);
app.use('/docentes', docenteRoutes);
app.use('/asignaturas', asignaturaRoutes);
app.use('/categoriaEmpleados', categoriaEmpleadoRoutes);
app.use('/contratos', contratoRoutes);
app.use('/inscripciones', inscripcionesRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(` Servidor HTTPS corriendo en https://localhost:${PORT}`);

});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('\n Servidor cerrado correctamente');
    process.exit(0);
  });
});