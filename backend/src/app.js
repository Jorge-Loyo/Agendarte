const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();

// Importar configuración de base de datos
const { testConnection, syncDatabase } = require('./config/database');

// Importar modelos
const models = require('./models');

// Importar rutas
const homeRoutes = require("./routes/home.routes");

// Crear la aplicación express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
app.use("/api/home", homeRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "🏥 Agendarte - Sistema de Gestión de Turnos",
    status: "API funcionando correctamente",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    database: "MySQL conectado"
  });
});

// Ruta de salud del sistema
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: "Connected"
  });
});

// Inicializar base de datos y servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();
    
    // Sincronizar modelos
    await syncDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Agendarte corriendo en http://localhost:${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📅 Fecha: ${new Date().toLocaleString('es-AR')}`);
    });
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error.message);
    process.exit(1);
  }
};

// Iniciar la aplicación
startServer();

module.exports = app;
