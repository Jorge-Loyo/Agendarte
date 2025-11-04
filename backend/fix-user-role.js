const { User, Profile, Professional } = require('./src/models');

const fixUserRole = async () => {
  try {
    console.log('🔧 Actualizando usuario svzurbaran@gmail.com...');
    
    // Buscar usuario
    let user = await User.findOne({ where: { email: 'svzurbaran@gmail.com' } });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    // Actualizar rol a profesional
    await user.update({ role: 'professional' });
    console.log('✅ Rol actualizado a professional');
    
    // Verificar si tiene perfil profesional
    let professional = await Professional.findOne({ where: { userId: user.id } });
    
    if (!professional) {
      // Crear perfil profesional
      professional = await Professional.create({
        userId: user.id,
        specialty: 'Medicina General',
        licenseNumber: 'MP' + user.id,
        consultationPrice: 5000,
        averageRating: 0,
        totalReviews: 0
      });
      console.log('✅ Perfil profesional creado');
    } else {
      console.log('✅ Perfil profesional ya existe');
    }
    
    console.log('🎉 Usuario configurado correctamente como profesional');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
};

fixUserRole();