const fetch = require('node-fetch');

const testProfessionalProfile = async () => {
  try {
    // 1. Login como profesional
    console.log('🔐 Iniciando sesión como profesional...');
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

    // 2. Obtener perfil actual
    console.log('📋 Obteniendo perfil actual...');
    const profileResponse = await fetch('http://localhost:3000/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const profileData = await profileResponse.json();
    console.log('📊 Perfil actual:', JSON.stringify(profileData.user, null, 2));

    // 3. Actualizar perfil
    console.log('🔄 Actualizando perfil profesional...');
    const updateData = {
      firstName: 'Carlos',
      lastName: 'García',
      phone: '+54911123456',
      address: 'Buenos Aires, Argentina',
      specialty: 'Cardiología',
      subspecialty: 'Cardiología Intervencionista',
      licenseNumber: 'MP12345',
      experience: 15,
      education: 'Universidad de Buenos Aires - Medicina',
      bio: 'Especialista en cardiología con 15 años de experiencia en procedimientos intervencionistas',
      consultationPrice: 8500,
      socialNetworks: {
        facebook: 'https://facebook.com/dr.carlos.garcia',
        linkedin: 'https://linkedin.com/in/carlos-garcia-cardiologo',
        website: 'https://carlosgarcia-cardiologo.com'
      }
    };

    const updateResponse = await fetch('http://localhost:3000/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    const updateResult = await updateResponse.json();
    if (!updateResponse.ok) {
      throw new Error(`Update failed: ${updateResult.message}`);
    }

    console.log('✅ Perfil actualizado:', updateResult.message);

    // 4. Verificar actualización
    console.log('🔍 Verificando actualización...');
    const verifyResponse = await fetch('http://localhost:3000/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const verifyData = await verifyResponse.json();
    console.log('📊 Perfil actualizado:', JSON.stringify(verifyData.user, null, 2));

    console.log('🎉 Test completado exitosamente');

  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }
};

testProfessionalProfile();