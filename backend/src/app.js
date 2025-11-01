const express = require("express"); // importar express para crear el servidor
const bodyParser = require("body-parser"); // importar body-parser para manejar solicitudes JSON
const homeRoutes = require("./routes/home.routes"); // importar rutas de home
const cors = require("cors"); // importar cors para manejar solicitudes entre dominios
const mysql = require("mysql"); // importar mysql para conectar con la base de datos

// crear la aplicación express
const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ruta principal modularizada
app.use("/api/home", homeRoutes);

// ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "Sistema de Gestión de Turnos - Psicología",
    status: "API funcionando correctamente",
    version: "1.0.0",
  });
});

// iniciar el servidor
app.listen(PORT, () => {
  console.log(
    `🏥 Sistema de Turnos Psicología corriendo en http://localhost:${PORT}`
  );
});
module.exports = app;
