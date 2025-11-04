const fetch = require('node-fetch');

const testGoogleCalendar = async () => {
  try {
    console.log('🧪 Probando Google Calendar...');

    // 1. Login como profesional
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
    console.log('✅ Login exitoso');

    // 2. Obtener URL de autorización
    console.log('🔗 Obteniendo URL de autorización...');
    const authResponse = await fetch('http://localhost:3000/api/google-calendar/auth-url', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const authData = await authResponse.json();
    if (!authResponse.ok) {
      throw new Error(`Auth URL failed: ${authData.message}`);
    }

    console.log('✅ URL de autorización obtenida');
    console.log('🔗 URL:', authData.authUrl);
    console.log('');
    console.log('📋 Pasos siguientes:');
    console.log('1. Abrir la URL en el navegador');
    console.log('2. Autorizar la aplicación');
    console.log('3. Verificar que redirige correctamente');

  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }
};

testGoogleCalendar();