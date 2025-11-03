const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();

// Importar configuración de base de datos
const { testConnection, syncDatabase } = require('./config/database');

// Importar modelos
const { User, Profile, Professional, Appointment, Specialty } = require('./models');
const { seedProfessionals } = require('./seeders/professionals');
const seedSpecialties = require('./seeders/specialties');
const { seedSchedules } = require('./seeders/schedules');
const { seedAppointments } = require('./seeders/appointments');
const { seedPatients } = require('./seeders/patients');

// Importar rutas
const homeRoutes = require("./routes/home.routes");
const authRoutes = require("./routes/auth.routes");

// Crear la aplicación express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:52632'],
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
app.use("/api/home", homeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", require("./routes/profile.routes"));
app.use("/api/appointments", require("./routes/appointment.routes"));
app.use("/api/professionals", require("./routes/professional.routes"));
app.use("/api/specialties", require("./routes/specialty.routes"));
app.use("/api/calendar", require("./routes/calendar.routes"));
app.use("/api/patients", require("./routes/patient.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/payments", require("./routes/payment.routes"));
app.use("/api/patient-history", require("./routes/patient-history.routes"));
app.use("/api/stats", require("./routes/stats.routes"));
app.use("/api/notes", require("./routes/notes.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
// Debug: Cargar rutas de horarios
console.log('Cargando rutas de schedules...');
app.use("/api/schedules", require("./routes/schedule.routes"));
console.log('Rutas de schedules cargadas');

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "🏥 Agendarte - Sistema de Gestión de Turnos",
    status: "API funcionando correctamente",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    database: "PostgreSQL conectado"
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

// Ruta para verificar citas en BD
app.get("/api/debug/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [{
        model: User,
        as: 'patient',
        include: [{ model: Profile, as: 'profile' }]
      }]
    });
    res.json({
      total: appointments.length,
      appointments: appointments.map(apt => ({
        id: apt.id,
        patientId: apt.patientId,
        professionalId: apt.professionalId,
        date: apt.appointmentDate,
        time: apt.appointmentTime,
        status: apt.status,
        patient: apt.patient?.profile?.firstName + ' ' + apt.patient?.profile?.lastName
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para verificar usuarios
app.get("/api/debug/users", async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Profile, as: 'profile' }],
      order: [['id', 'ASC']]
    });
    res.json({
      total: users.length,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'Sin perfil'
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear cita de prueba para historial
app.post("/api/debug/create-history", async (req, res) => {
  try {
    const appointment = await Appointment.create({
      patientId: 3, // Ana García
      professionalId: 1, // Primer profesional
      appointmentDate: '2024-10-15',
      appointmentTime: '10:00:00',
      status: 'completed',
      paymentStatus: 'paid',
      notes: 'Control rutinario. Paciente presenta buen estado general. Se recomienda continuar con medicación actual.',
      createdBy: 7
    });
    res.json({ message: 'Cita de prueba creada', appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear múltiples citas para estadísticas
app.post("/api/debug/create-stats-data", async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const professional = await Professional.findOne({ where: { userId: 7 } });
    
    if (!professional) {
      return res.status(404).json({ message: 'Profesional no encontrado' });
    }

    const appointments = [
      {
        patientId: 3,
        professionalId: professional.id,
        appointmentDate: today,
        appointmentTime: '09:00:00',
        status: 'confirmed',
        paymentStatus: 'paid',
        notes: 'Consulta matutina',
        createdBy: 7
      },
      {
        patientId: 4,
        professionalId: professional.id,
        appointmentDate: today,
        appointmentTime: '14:00:00',
        status: 'confirmed',
        paymentStatus: 'paid',
        notes: 'Control vespertino',
        createdBy: 7
      }
    ];

    await Appointment.bulkCreate(appointments);
    res.json({ message: 'Datos de estadísticas creados', count: appointments.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener turnos del profesional
app.get("/api/debug/professional-appointments/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const professional = await Professional.findOne({ where: { userId } });
    
    if (!professional) {
      return res.status(404).json({ message: 'Profesional no encontrado' });
    }

    const appointments = await Appointment.findAll({
      where: { professionalId: professional.id },
      include: [{
        model: User,
        as: 'patient',
        include: [{ model: Profile, as: 'profile' }]
      }],
      order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']]
    });

    res.json({
      professional: professional.id,
      total: appointments.length,
      appointments: appointments.map(apt => ({
        id: apt.id,
        date: apt.appointmentDate,
        time: apt.appointmentTime,
        status: apt.status,
        patient: apt.patient?.profile?.firstName + ' ' + apt.patient?.profile?.lastName,
        notes: apt.notes
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inicializar base de datos y servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();
    
    // Sincronizar modelos
    await syncDatabase();
    
    // Crear datos de prueba
    await seedSpecialties();
    await seedPatients();
    await seedProfessionals();
    await seedSchedules();
    await seedAppointments();
    
    // Iniciar procesador de notificaciones
    const notificationService = require('./services/notification.service');
    notificationService.startNotificationProcessor();
    
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
