const { Review, Appointment, User, Professional } = require('../models');

const seedReviews = async () => {
  try {
    console.log('🌱 Creando reseñas de prueba...');

    // Buscar citas completadas
    const completedAppointments = await Appointment.findAll({
      where: { status: 'completed' },
      include: [
        { model: User, as: 'patient' },
        { model: Professional, as: 'professional' }
      ]
    });

    if (completedAppointments.length === 0) {
      // Crear algunas citas completadas para reseñas
      const patients = await User.findAll({ where: { role: 'patient' } });
      const professionals = await Professional.findAll();

      if (patients.length > 0 && professionals.length > 0) {
        const completedAppointment = await Appointment.create({
          patientId: patients[0].id,
          professionalId: professionals[0].id,
          appointmentDate: '2024-10-15',
          appointmentTime: '10:00:00',
          status: 'completed',
          paymentStatus: 'paid',
          notes: 'Consulta completada exitosamente',
          createdBy: patients[0].id
        });

        completedAppointments.push(completedAppointment);
      }
    }

    const reviewsData = [
      {
        rating: 5,
        comment: 'Excelente profesional, muy atento y explicó todo claramente. Recomendado 100%.',
        isAnonymous: false
      },
      {
        rating: 4,
        comment: 'Muy buena atención, aunque tuve que esperar un poco más de lo esperado.',
        isAnonymous: false
      },
      {
        rating: 5,
        comment: 'Profesional muy capacitado, resolvió todas mis dudas.',
        isAnonymous: true
      },
      {
        rating: 3,
        comment: 'Atención correcta pero el consultorio podría estar mejor equipado.',
        isAnonymous: false
      },
      {
        rating: 5,
        comment: 'Excelente trato y muy profesional en su diagnóstico.',
        isAnonymous: false
      }
    ];

    for (let i = 0; i < Math.min(reviewsData.length, completedAppointments.length); i++) {
      const appointment = completedAppointments[i];
      const reviewData = reviewsData[i];

      const existingReview = await Review.findOne({
        where: { appointmentId: appointment.id }
      });

      if (!existingReview) {
        await Review.create({
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          professionalId: appointment.professionalId,
          rating: reviewData.rating,
          comment: reviewData.comment,
          isAnonymous: reviewData.isAnonymous
        });

        console.log(`✅ Reseña creada para cita ${appointment.id}`);
      }
    }

    // Actualizar ratings de profesionales
    const professionals = await Professional.findAll();
    for (const prof of professionals) {
      const reviews = await Review.findAll({ where: { professionalId: prof.id } });
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await prof.update({
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviews.length
        });
        console.log(`✅ Rating actualizado para profesional ${prof.id}: ${avgRating}`);
      }
    }

    console.log('🎉 Reseñas de prueba creadas exitosamente');
  } catch (error) {
    console.error('❌ Error creando reseñas:', error);
  }
};

module.exports = { seedReviews };