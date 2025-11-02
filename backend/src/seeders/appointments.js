const { Appointment, User, Professional } = require('../models');

const seedAppointments = async () => {
  try {
    console.log('🌱 Creando citas de prueba...');

    // Buscar usuarios pacientes y profesionales
    const patients = await User.findAll({ where: { role: 'patient' } });
    const professionals = await Professional.findAll();

    if (patients.length === 0 || professionals.length === 0) {
      console.log('⚠️ No hay pacientes o profesionales para crear citas');
      return;
    }

    const appointmentsData = [
      {
        patientId: patients[0]?.id,
        professionalId: professionals[0]?.id,
        appointmentDate: '2024-11-15',
        appointmentTime: '10:30:00',
        status: 'confirmed',
        paymentStatus: 'paid',
        notes: 'Control rutinario'
      },
      {
        patientId: patients[0]?.id,
        professionalId: professionals[1]?.id,
        appointmentDate: '2024-11-20',
        appointmentTime: '14:00:00',
        status: 'scheduled',
        paymentStatus: 'pending',
        notes: 'Consulta por lunar'
      },
      {
        patientId: patients[0]?.id,
        professionalId: professionals[2]?.id,
        appointmentDate: '2024-10-10',
        appointmentTime: '09:00:00',
        status: 'completed',
        paymentStatus: 'paid',
        notes: 'Seguimiento migraña'
      }
    ];

    for (const aptData of appointmentsData) {
      if (aptData.patientId && aptData.professionalId) {
        const existing = await Appointment.findOne({
          where: {
            patientId: aptData.patientId,
            professionalId: aptData.professionalId,
            appointmentDate: aptData.appointmentDate,
            appointmentTime: aptData.appointmentTime
          }
        });

        if (!existing) {
          await Appointment.create({
            ...aptData,
            createdBy: aptData.patientId
          });
          console.log(`✅ Cita creada: ${aptData.appointmentDate} ${aptData.appointmentTime}`);
        }
      }
    }

    console.log('🎉 Citas de prueba creadas exitosamente');
  } catch (error) {
    console.error('❌ Error creando citas:', error);
  }
};

module.exports = { seedAppointments };