const { sequelize } = require('../src/config/database');
const { 
  User, 
  Profile, 
  Professional, 
  Appointment, 
  Schedule, 
  Notification, 
  Review 
} = require('../src/models');

async function cleanTestData() {
  try {
    console.log('🧹 Iniciando limpieza de datos de prueba...');

    // 1. Eliminar citas de prueba
    const testAppointments = await Appointment.destroy({
      where: {
        createdAt: {
          [require('sequelize').Op.lt]: new Date('2024-12-01')
        }
      }
    });
    console.log(`✅ Eliminadas ${testAppointments} citas de prueba`);

    // 2. Eliminar notificaciones huérfanas
    const testNotifications = await Notification.destroy({
      where: {
        appointmentId: null
      }
    });
    console.log(`✅ Eliminadas ${testNotifications} notificaciones`);

    // 3. Eliminar reseñas de prueba
    const testReviews = await Review.destroy({
      where: {
        createdAt: {
          [require('sequelize').Op.lt]: new Date('2024-12-01')
        }
      }
    });
    console.log(`✅ Eliminadas ${testReviews} reseñas de prueba`);

    // 4. Resetear estadísticas de profesionales
    await Professional.update(
      {
        totalReviews: 0,
        averageRating: 0
      },
      {
        where: {}
      }
    );
    console.log('✅ Estadísticas reseteadas');

    console.log('🎉 Limpieza completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

cleanTestData();