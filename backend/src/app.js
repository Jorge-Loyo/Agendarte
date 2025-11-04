const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();

// Importar middleware de seguridad
const { apiLimiter, debugOnly, helmetConfig } = require('./middleware/security');

// Importar configuración de base de datos
const { testConnection, syncDatabase } = require('./config/database');

// Importar modelos
const { User, Profile, Professional, Appointment, Specialty } = require('./models');
const { seedProfessionals } = require('./seeders/professionals');
const seedSpecialties = require('./seeders/specialties');
// Función para crear usuario master
const createMasterUser = async () => {
  try {
    const bcrypt = require('bcryptjs');
    const { User, Profile } = require('./models');
    
    const email = process.env.MASTER_EMAIL || 'admin@agendarte.com';
    const password = process.env.MASTER_PASSWORD;
    
    if (!password) {
      console.warn('⚠️ MASTER_PASSWORD no configurado en variables de entorno');
      return;
    }
    
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      user = await User.create({
        email,
        password: hashedPassword,
        role: 'master',
        isActive: true
      });
      
      await Profile.create({
        userId: user.id,
        firstName: 'Admin',
        lastName: 'Master',
        dni: 'ADMIN001'
      });
      
      console.log('✅ Usuario master creado:', email);
    } else {
      await user.update({ role: 'master', isActive: true });
      console.log('✅ Usuario master actualizado:', email);
    }
  } catch (error) {
    console.error('❌ Error creando usuario master:', error.message);
  }
};

// Importar rutas
const homeRoutes = require("./routes/home.routes");
const authRoutes = require("./routes/auth.routes");

// Crear la aplicación express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmetConfig);
app.use(apiLimiter);

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL?.split(',') || []
    : ['http://localhost:4200', 'http://[::1]:4200', 'http://127.0.0.1:4200', 'http://localhost:52632'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

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
app.use("/api/reviews", require("./routes/review.routes"));
app.use("/api/google-calendar", require("./routes/google-calendar.routes"));

// Ruta directa para callback de Google (sin /api)
const googleCalendarController = require('./controllers/google-calendar.controller');
app.get('/callback', googleCalendarController.handleCallback);
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

// Ruta para verificar citas en BD (solo desarrollo)
app.get("/api/debug/appointments", debugOnly, async (req, res) => {
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

// Ruta para verificar usuarios (solo desarrollo)
app.get("/api/debug/users", debugOnly, async (req, res) => {
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

// Crear cita de prueba para historial (solo desarrollo)
app.post("/api/debug/create-history", debugOnly, async (req, res) => {
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

// Crear múltiples citas para estadísticas (solo desarrollo)
app.post("/api/debug/create-stats-data", debugOnly, async (req, res) => {
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

// Obtener turnos del profesional (solo desarrollo)
app.get("/api/debug/professional-appointments/:userId", debugOnly, async (req, res) => {
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

// Debug: Verificar usuario específico (solo desarrollo)
app.get("/api/debug/user/:email", debugOnly, async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({
      where: { email },
      include: [{ model: Profile, as: 'profile' }]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      profile: user.profile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Limpiar base de datos (solo para desarrollo)
app.post("/api/debug/clean-database", debugOnly, async (req, res) => {
  try {
    const { User, Profile, Professional, Appointment, Schedule, Notification, UserPreference, Review } = require('./models');
    
    // Eliminar todos los datos excepto el usuario master
    await Review.destroy({ where: {} });
    await Notification.destroy({ where: {} });
    await UserPreference.destroy({ where: {} });
    await Appointment.destroy({ where: {} });
    await Schedule.destroy({ where: {} });
    await Professional.destroy({ where: {} });
    
    // Eliminar usuarios que no sean master
    const masterUser = await User.findOne({ where: { email: 'jorgenayati@gmail.com' } });
    if (masterUser) {
      await Profile.destroy({ where: { userId: { [Op.ne]: masterUser.id } } });
      await User.destroy({ where: { id: { [Op.ne]: masterUser.id } } });
    }
    
    console.log('🧹 Base de datos limpiada');
    res.json({ message: 'Base de datos limpiada exitosamente' });
  } catch (error) {
    console.error('Error limpiando BD:', error);
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
    
    // Crear solo especialidades y usuario master
    await seedSpecialties();
    await createMasterUser();
    
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
