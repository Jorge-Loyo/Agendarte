const { sequelize } = require('../src/config/database');
const { Appointment, Review, Professional, Notification } = require('../src/models');

async function resetDashboard() {
  try {
    console.log('🔄 Reseteando dashboard profesional...');

    // Eliminar TODAS las citas
    await Appointment.destroy({ where: {} });
    console.log('✅ Todas las citas eliminadas');

    // Eliminar TODAS las reseñas
    await Review.destroy({ where: {} });
    console.log('✅ Todas las reseñas eliminadas');

    // Eliminar TODAS las notificaciones
    await Notification.destroy({ where: {} });
    console.log('✅ Todas las notificaciones eliminadas');

    // Resetear estadísticas de profesionales
    await Professional.update(
      { totalReviews: 0, averageRating: 0 },
      { where: {} }
    );
    console.log('✅ Estadísticas de profesionales reseteadas');

    console.log('🎉 Dashboard limpio - Listo para datos reales');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

resetDashboard();