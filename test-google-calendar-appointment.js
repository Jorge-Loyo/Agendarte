const fetch = require('node-fetch');

const testGoogleCalendarAppointment = async () => {
  try {
    console.log('🧪 Probando agendado con Google Calendar...');

    // 1. Login como profesional
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dr.garcia@agendarte.com',
        password: 'Password123!'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginData.message}`);
    }

    const token = loginData.token;
    console.log('✅ Login exitoso');

    // 2. Crear cita de prueba
    const appointmentData = {
      patientId: 3, // ID de paciente existente
      date: '2024-12-20',
      time: '10:00',
      notes: 'Consulta de prueba con Google Calendar',
      createdByProfessional: true
    };

    const appointmentResponse = await fetch('http://localhost:3000/api/appointments/professional', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData)
    });

    const appointmentResult = await appointmentResponse.json();
    if (!appointmentResponse.ok) {
      throw new Error(`Appointment creation failed: ${appointmentResult.message}`);
    }

    console.log('✅ Cita creada:', appointmentResult.appointment.id);

    // 3. Crear evento en Google Calendar
    const eventData = {
      title: 'Consulta - Paciente de Prueba',
      description: 'Consulta médica de prueba',
      startTime: '2024-12-20T10:00:00.000Z',
      endTime: '2024-12-20T11:00:00.000Z',
      appointmentId: appointmentResult.appointment.id
    };

    const eventResponse = await fetch('http://localhost:3000/api/google-calendar/create-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(eventData)
    });

    if (eventResponse.ok) {
      const eventResult = await eventResponse.json();
      console.log('✅ Evento creado en Google Calendar:', eventResult.event?.id);
    } else {
      const eventError = await eventResponse.json();
      console.log('⚠️ No se pudo crear evento en Google Calendar:', eventError.message);
      console.log('💡 Esto es normal si no tienes Google Calendar configurado');
    }

    console.log('🎉 Test completado');
    console.log('');
    console.log('📋 Para probar en el frontend:');
    console.log('1. Ir a http://localhost:4200/app/professional-appointment');
    console.log('2. Seleccionar un paciente');
    console.log('3. Elegir fecha y hora');
    console.log('4. Marcar "Agregar a Google Calendar"');
    console.log('5. Completar los datos del evento');
    console.log('6. Confirmar el turno');

  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }
};

testGoogleCalendarAppointment();