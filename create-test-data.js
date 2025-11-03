const fetch = require('node-fetch');

const createTestData = async () => {
  try {
    console.log('🔧 Creando datos de prueba...');

    // 1. Login como master
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jorgenayati@gmail.com',
        password: 'Matris94'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginData.message}`);
    }

    const token = loginData.token;
    console.log('✅ Login como master exitoso');

    // 2. Crear un paciente de prueba
    console.log('👤 Creando paciente de prueba...');
    const patientResponse = await fetch('http://localhost:3000/api/admin/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: 'paciente.test@agendarte.com',
        firstName: 'María',
        lastName: 'González',
        dni: '12345678',
        phone: '+54911111111',
        generatePassword: true,
        sendCredentials: false
      })
    });

    if (patientResponse.ok) {
      const patientData = await patientResponse.json();
      console.log('✅ Paciente creado:', patientData.patient.email);
    } else {
      console.log('ℹ️ Paciente ya existe o error creando');
    }

    // 3. Crear un profesional de prueba
    console.log('👨‍⚕️ Creando profesional de prueba...');
    const professionalResponse = await fetch('http://localhost:3000/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: 'dr.garcia@agendarte.com',
        password: 'Password123!',
        role: 'professional',
        firstName: 'Carlos',
        lastName: 'García',
        dni: '87654321',
        phone: '+54911222222',
        specialty: 'Cardiología',
        licenseNumber: 'MP12345'
      })
    });

    if (professionalResponse.ok) {
      const professionalData = await professionalResponse.json();
      console.log('✅ Profesional creado:', professionalData.user.email);
    } else {
      console.log('ℹ️ Profesional ya existe o error creando');
    }

    console.log('🎉 Datos de prueba creados exitosamente');
    console.log('');
    console.log('📋 Credenciales de prueba:');
    console.log('👤 Paciente: paciente.test@agendarte.com');
    console.log('👨‍⚕️ Profesional: dr.garcia@agendarte.com / Password123!');
    console.log('👑 Master: jorgenayati@gmail.com / Matris94');

  } catch (error) {
    console.error('❌ Error creando datos:', error.message);
  }
};

createTestData();