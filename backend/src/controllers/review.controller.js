const { Review, Appointment, User, Profile, Professional } = require('../models');
const { Op } = require('sequelize');

const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment, isAnonymous } = req.body;
    const patientId = req.user.id;

    const appointment = await Appointment.findOne({
      where: { id: appointmentId, patientId, status: 'completed' }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada o no completada' });
    }

    const existingReview = await Review.findOne({ where: { appointmentId } });
    if (existingReview) {
      return res.status(400).json({ message: 'Ya existe una reseña para esta cita' });
    }

    const review = await Review.create({
      appointmentId,
      patientId,
      professionalId: appointment.professionalId,
      rating,
      comment: comment || null,
      isAnonymous: isAnonymous || false
    });

    // Actualizar rating promedio del profesional
    await updateProfessionalRating(appointment.professionalId);

    res.status(201).json({
      message: 'Reseña creada exitosamente',
      review
    });
  } catch (error) {
    console.error('Error creando reseña:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getProfessionalReviews = async (req, res) => {
  try {
    const { professionalId } = req.params;
    const { rating } = req.query;

    let whereClause = { professionalId };
    if (rating) {
      whereClause.rating = parseInt(rating);
    }

    const reviews = await Review.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'patient',
        include: [{ model: Profile, as: 'profile' }]
      }],
      order: [['createdAt', 'DESC']]
    });

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      patientName: review.isAnonymous ? 'Anónimo' : 
        `${review.patient.profile.firstName} ${review.patient.profile.lastName}`
    }));

    // Estadísticas
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? 
      reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
    
    const ratingDistribution = [1,2,3,4,5].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length
    }));

    res.json({
      message: 'Reseñas obtenidas exitosamente',
      reviews: formattedReviews,
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error obteniendo reseñas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getCompletedAppointmentsForReview = async (req, res) => {
  try {
    const patientId = req.user.id;

    const appointments = await Appointment.findAll({
      where: { 
        patientId, 
        status: 'completed',
        appointmentDate: { [Op.lt]: new Date() }
      },
      order: [['appointmentDate', 'DESC']]
    });

    res.json({
      message: 'Citas para reseñar obtenidas exitosamente',
      appointments: []
    });
  } catch (error) {
    console.error('Error obteniendo citas para reseñar:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateProfessionalRating = async (professionalId) => {
  try {
    const reviews = await Review.findAll({ where: { professionalId } });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? 
      reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

    await Professional.update(
      { 
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews 
      },
      { where: { id: professionalId } }
    );
  } catch (error) {
    console.error('Error actualizando rating:', error);
  }
};

module.exports = {
  createReview,
  getProfessionalReviews,
  getCompletedAppointmentsForReview
};