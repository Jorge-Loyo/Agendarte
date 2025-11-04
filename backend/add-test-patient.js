const fetch = require('node-fetch');

const addTestPatient = async () => {
  try {
    // 1. Login como profesional
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'svzurbaran@gmail.com',
        password: 'Matris94'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginData.message}`);
    }

    const token = loginData.token;
    console.log('✅ Login exitoso');

    // 2. Crear paciente de prueba
    const patientData = {
      firstName: 'Ana',
      lastName: 'Martínez',
      dni: '87654321',
      email: 'ana.martinez@test.com',
      phone: '+54911222222',
      address: 'Buenos Aires, Argentina',
      gender: 'F'
    };

    const createResponse = await fetch('http://localhost:3000/api/patients/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(patientData)
    });

    const createResult = await createResponse.json();
    console.log('✅ Paciente creado/agregado:', createResult.message);
    
    // Si el paciente ya existía, agregarlo manualmente a la cartilla
    if (createResult.existed || createResult.patient) {
      const patientId = createResult.patient.id;
      const addResponse = await fetch('http://localhost:3000/api/professionals/add-patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ patientId })
      });
      
      if (addResponse.ok) {
        console.log('✅ Paciente agregado a cartilla');
      }
    }

    // 3. Verificar cartilla
    const patientsResponse = await fetch('http://localhost:3000/api/professionals/my-patients', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const patients = await patientsResponse.json();
    console.log('👥 Pacientes en cartilla:', patients.length);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

addTestPatient();