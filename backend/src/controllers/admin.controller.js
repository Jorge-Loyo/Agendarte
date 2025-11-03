const bcrypt = require('bcryptjs');
const { User, Profile, Professional, Appointment } = require('../models');
const { Op } = require('sequelize');

const getAllUsers = async (req, res) => {
  try {
    // Obtener usuarios básicos primero
    const users = await User.findAll({
      order: [['created_at', 'DESC']]
    });

    // Obtener perfiles y profesionales por separado
    const formattedUsers = [];
    
    for (const user of users) {
      const profile = await Profile.findOne({ where: { userId: user.id } });
      const professional = user.role === 'professional' ? 
        await Professional.findOne({ where: { userId: user.id } }) : null;
      
      formattedUsers.push({
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        profile: profile ? {
          firstName: profile.firstName,
          lastName: profile.lastName,
          dni: profile.dni,
          phone: profile.phone
        } : null,
        professional: professional ? {
          specialty: professional.specialty,
          licenseNumber: professional.licenseNumber
        } : null
      });
    }

    res.json({
      message: 'Usuarios obtenidos exitosamente',
      users: formattedUsers
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, dni, phone, specialty, licenseNumber, generatePassword, sendCredentials } = req.body;

    // Verificar email único
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Verificar DNI único si se proporciona
    if (dni) {
      const existingDNI = await Profile.findOne({ where: { dni } });
      if (existingDNI) {
        return res.status(400).json({ message: 'El DNI ya está registrado' });
      }
    }

    // Generar contraseña temporal si no se proporciona
    const tempPassword = password || generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      isActive: true
    });

    // Crear perfil
    const profile = await Profile.create({
      userId: user.id,
      firstName,
      lastName,
      dni: dni || null,
      phone: phone || null
    });

    // Si es profesional, crear registro profesional
    if (role === 'professional') {
      await Professional.create({
        userId: user.id,
        specialty: specialty || 'General',
        licenseNumber: licenseNumber || `MP${user.id}`,
        consultationPrice: 5000,
        averageRating: 0,
        totalReviews: 0
      });
    }

    // Simular envío de credenciales
    if (sendCredentials) {
      console.log(`📧 Credenciales enviadas a ${email}:`);
      console.log(`Usuario: ${email}`);
      console.log(`Contraseña temporal: ${tempPassword}`);
      console.log(`Debe cambiar la contraseña en el primer login`);
    }

    console.log(`👤 Usuario ${role} creado: ${email}`);

    res.status(201).json({
      message: sendCredentials ? 
        'Usuario creado exitosamente. Credenciales enviadas por email.' :
        'Usuario creado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: {
          firstName: profile.firstName,
          lastName: profile.lastName
        }
      },
      tempPassword: !password ? tempPassword : undefined
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isActive } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.update({ role, isActive });

    console.log(`🔄 Usuario ${userId} actualizado: role=${role}, active=${isActive}`);

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Soft delete - desactivar usuario
    await user.update({ isActive: false });

    console.log(`🗑️ Usuario ${userId} desactivado`);

    res.json({ message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    console.error('Error desactivando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateUserFull = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, password, role, firstName, lastName, dni, phone, specialty, licenseNumber } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar usuario
    const updateData = { email, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    await user.update(updateData);

    // Actualizar perfil
    let profile = await Profile.findOne({ where: { userId } });
    if (profile) {
      await profile.update({ firstName, lastName, dni, phone });
    } else {
      profile = await Profile.create({ userId, firstName, lastName, dni, phone });
    }

    // Actualizar profesional si es necesario
    if (role === 'professional') {
      let professional = await Professional.findOne({ where: { userId } });
      if (professional) {
        await professional.update({ specialty, licenseNumber });
      } else {
        await Professional.create({ userId, specialty, licenseNumber, consultationPrice: 5000 });
      }
    }

    console.log(`🔄 Usuario ${userId} actualizado completamente`);
    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']]
    });

    res.json({
      message: 'Turnos obtenidos exitosamente',
      appointments: appointments || []
    });
  } catch (error) {
    console.error('Error obteniendo turnos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createAppointmentAdmin = async (req, res) => {
  try {
    const { patientId, professionalId, date, time, notes } = req.body;

    // Verificar disponibilidad
    const existingAppointment = await Appointment.findOne({
      where: {
        professionalId,
        appointmentDate: date,
        appointmentTime: time,
        status: { [Op.ne]: 'cancelled' }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'El horario ya está ocupado' });
    }

    const appointment = await Appointment.create({
      patientId,
      professionalId,
      appointmentDate: date,
      appointmentTime: time,
      status: 'confirmed',
      paymentStatus: 'paid',
      notes: notes || null,
      createdBy: req.user.id
    });

    console.log(`📅 Turno creado por admin para paciente ${patientId}`);
    res.status(201).json({ message: 'Turno creado exitosamente', appointment });
  } catch (error) {
    console.error('Error creando turno:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const cancelAppointmentAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    await appointment.update({
      status: 'cancelled',
      notes: reason ? `${appointment.notes || ''} - Cancelado por admin: ${reason}` : appointment.notes
    });

    console.log(`❌ Turno ${appointmentId} cancelado por admin`);
    res.json({ message: 'Turno cancelado exitosamente' });
  } catch (error) {
    console.error('Error cancelando turno:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const rescheduleAppointmentAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { newDate, newTime, reason } = req.body;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    // Verificar disponibilidad del nuevo horario
    const existingAppointment = await Appointment.findOne({
      where: {
        professionalId: appointment.professionalId,
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: { [Op.ne]: 'cancelled' },
        id: { [Op.ne]: appointmentId }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'El nuevo horario no está disponible' });
    }

    await appointment.update({
      appointmentDate: newDate,
      appointmentTime: newTime,
      notes: reason ? `${appointment.notes || ''} - Reprogramado por admin: ${reason}` : appointment.notes
    });

    console.log(`📅 Turno ${appointmentId} reprogramado por admin`);
    res.json({ message: 'Turno reprogramado exitosamente' });
  } catch (error) {
    console.error('Error reprogramando turno:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const processPaymentAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    await appointment.update({
      paymentStatus: 'paid',
      status: 'confirmed'
    });

    console.log(`💳 Pago procesado manualmente para turno ${appointmentId}`);
    res.json({ message: 'Pago procesado exitosamente' });
  } catch (error) {
    console.error('Error procesando pago:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getPatients = async (req, res) => {
  try {
    console.log('Iniciando getPatients...');
    
    const patients = await User.findAll({
      where: { role: 'patient', isActive: true },
      order: [['created_at', 'DESC']]
    });
    
    console.log(`Encontrados ${patients.length} pacientes`);

    const formattedPatients = [];
    
    for (const patient of patients) {
      try {
        const profile = await Profile.findOne({ where: { userId: patient.id } });
        
        formattedPatients.push({
          id: patient.id,
          email: patient.email,
          isActive: patient.isActive,
          createdAt: patient.createdAt,
          profile: profile ? {
            firstName: profile.firstName,
            lastName: profile.lastName,
            dni: profile.dni,
            phone: profile.phone,
            age: profile.age,
            gender: profile.gender,
            address: profile.address
          } : null
        });
      } catch (profileError) {
        console.error(`Error obteniendo perfil para usuario ${patient.id}:`, profileError);
        formattedPatients.push({
          id: patient.id,
          email: patient.email,
          isActive: patient.isActive,
          createdAt: patient.createdAt,
          profile: null
        });
      }
    }
    
    console.log('Enviando respuesta con', formattedPatients.length, 'pacientes');

    res.json({
      message: 'Pacientes obtenidos exitosamente',
      patients: formattedPatients
    });
  } catch (error) {
    console.error('Error obteniendo pacientes:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

const createPatient = async (req, res) => {
  try {
    const { email, firstName, lastName, dni, phone, age, gender, address, generatePassword, sendCredentials } = req.body;

    // Verificar email único
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Verificar DNI único si se proporciona
    if (dni) {
      const existingDNI = await Profile.findOne({ where: { dni } });
      if (existingDNI) {
        return res.status(400).json({ message: 'El DNI ya está registrado' });
      }
    }

    // Generar contraseña temporal
    const tempPassword = generatePassword ? generateTempPassword() : 'Password123!';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Crear usuario
    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'patient',
      isActive: true
    });

    // Crear perfil
    await Profile.create({
      userId: user.id,
      firstName,
      lastName,
      dni: dni || null,
      phone: phone || null,
      age: age || null,
      gender: gender || null,
      address: address || null
    });

    // Simular envío de credenciales
    if (sendCredentials) {
      console.log(`📧 Credenciales enviadas a ${email}:`);
      console.log(`Usuario: ${email}`);
      console.log(`Contraseña temporal: ${tempPassword}`);
      console.log(`Debe cambiar la contraseña en el primer login`);
    }

    console.log(`👥 Paciente creado por admin: ${email}`);

    res.status(201).json({
      message: sendCredentials ? 
        'Paciente registrado exitosamente. Credenciales enviadas por email.' :
        'Paciente registrado exitosamente',
      patient: {
        id: user.id,
        email: user.email,
        profile: { firstName, lastName }
      },
      tempPassword: generatePassword ? tempPassword : undefined
    });
  } catch (error) {
    console.error('Error creando paciente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password + '!';
};

const generateReport = async (req, res) => {
  try {
    const { startDate, endDate, professionalId } = req.body;

    // Construir filtros
    let whereClause = {
      appointmentDate: {
        [Op.between]: [startDate, endDate]
      }
    };

    if (professionalId) {
      whereClause.professionalId = professionalId;
    }

    // Obtener todas las citas del período
    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: Professional,
          as: 'professional',
          include: [{
            model: User,
            as: 'user',
            include: [{ model: Profile, as: 'profile' }]
          }]
        }
      ]
    });

    // Calcular métricas
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;
    const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed').length;

    // Calcular ingresos
    const paidAppointments = appointments.filter(apt => apt.paymentStatus === 'paid');
    const totalRevenue = paidAppointments.reduce((sum, apt) => {
      return sum + (apt.professional?.consultationPrice || 0);
    }, 0);

    const pendingPayments = appointments
      .filter(apt => apt.paymentStatus === 'pending')
      .reduce((sum, apt) => sum + (apt.professional?.consultationPrice || 0), 0);

    const refunds = appointments
      .filter(apt => apt.paymentStatus === 'refunded')
      .reduce((sum, apt) => sum + (apt.professional?.consultationPrice || 0), 0);

    // Distribución por estado
    const appointmentsByStatus = [
      { status: 'Confirmados', count: confirmedAppointments },
      { status: 'Completados', count: completedAppointments },
      { status: 'Cancelados', count: cancelledAppointments }
    ];

    const report = {
      period: `${startDate} - ${endDate}`,
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      confirmedAppointments,
      totalRevenue,
      pendingPayments,
      refunds,
      appointmentsByStatus
    };

    console.log(`📊 Reporte generado para período ${startDate} - ${endDate}`);

    res.json({
      message: 'Reporte generado exitosamente',
      report
    });
  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Generar nueva contraseña temporal
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await user.update({ password: hashedPassword });

    console.log(`🔄 Contraseña reseteada para usuario ${user.email}`);

    res.json({
      message: 'Contraseña reseteada exitosamente',
      tempPassword: tempPassword
    });
  } catch (error) {
    console.error('Error reseteando contraseña:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUserRole,
  updateUserFull,
  deleteUser,
  getAllAppointments,
  createAppointment: createAppointmentAdmin,
  cancelAppointment: cancelAppointmentAdmin,
  rescheduleAppointment: rescheduleAppointmentAdmin,
  processPayment: processPaymentAdmin,
  getPatients,
  createPatient,
  generateReport,
  resetUserPassword
};