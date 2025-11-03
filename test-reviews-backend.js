const fetch = require('node-fetch');

const testReviewsBackend = async () => {
  try {
    console.log('🧪 Probando backend de reseñas...');

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

    // 2. Obtener perfil para conseguir ID del profesional
    const profileResponse = await fetch('http://localhost:3000/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const profileData = await profileResponse.json();
    console.log('📋 Perfil:', JSON.stringify(profileData.user, null, 2));

    const professionalId = profileData.user?.professional?.id || profileData.user.id;
    console.log('🆔 Professional ID:', professionalId);

    // 3. Probar estadísticas
    console.log('📊 Probando estadísticas...');
    const statsResponse = await fetch('http://localhost:3000/api/stats/professional', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Estadísticas:', statsData);
    } else {
      const statsError = await statsResponse.json();
      console.log('❌ Error estadísticas:', statsError);
    }

    // 4. Probar reseñas
    console.log('⭐ Probando reseñas...');
    const reviewsResponse = await fetch(`http://localhost:3000/api/reviews/professional/${professionalId}`);

    if (reviewsResponse.ok) {
      const reviewsData = await reviewsResponse.json();
      console.log('✅ Reseñas:', reviewsData);
    } else {
      const reviewsError = await reviewsResponse.json();
      console.log('❌ Error reseñas:', reviewsError);
    }

    console.log('🎉 Test completado');

  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }
};

testReviewsBackend();