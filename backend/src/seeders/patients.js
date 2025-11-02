const bcrypt = require('bcryptjs');
const { User, Profile } = require('../models');

const seedPatients = async () => {
  try {
    console.log('🌱 Creando pacientes de prueba...');

    const patients = [
      {
        email: 'paciente@agendarte.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        dni: '12345678',
        phone: '+54911123456',
        address: 'Buenos Aires, Argentina'
      }
    ];

    for (const patientData of patients) {
      const existingUser = await User.findOne({ where: { email: patientData.email } });
      if (existingUser) {
        console.log(`✅ Paciente ${patientData.firstName} ${patientData.lastName} ya existe`);
        continue;
      }

      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const user = await User.create({
        email: patientData.email,
        password: hashedPassword,
        role: 'patient'
      });

      await Profile.create({
        userId: user.id,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        dni: patientData.dni,
        phone: patientData.phone,
        address: patientData.address
      });

      console.log(`✅ Paciente ${patientData.firstName} ${patientData.lastName} creado`);
    }

    console.log('🎉 Pacientes de prueba creados exitosamente');
  } catch (error) {
    console.error('❌ Error creando pacientes:', error);
  }
};

module.exports = { seedPatients };