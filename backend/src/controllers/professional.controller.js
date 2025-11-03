const { User, Profile, Professional } = require('../models');
const { Op } = require('sequelize');

const getAllProfessionals = async (req, res) => {
  try {
    const { specialty, location, rating } = req.query;
    
    let whereClause = {};
    if (specialty) {
      whereClause.specialty = specialty;
    }
    if (rating) {
      whereClause.averageRating = { [Op.gte]: parseFloat(rating) };
    }

    const professionals = await Professional.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          where: { isActive: true },
          include: [
            {
              model: Profile,
              as: 'profile'
            }
          ]
        }
      ],
      order: [['averageRating', 'DESC']]
    });

    const formattedProfessionals = professionals.map(prof => ({
      id: prof.id,
      name: `${prof.user.profile.firstName} ${prof.user.profile.lastName}`,
      specialty: prof.specialty,
      bio: prof.bio,
      rating: prof.averageRating || 0,
      totalReviews: prof.totalReviews || 0,
      consultationPrice: prof.consultationPrice,
      licenseNumber: prof.licenseNumber,
      email: prof.user.email,
      phone: prof.user.profile.phone,
      address: prof.user.profile.address
    }));

    res.json({
      message: 'Profesionales obtenidos exitosamente',
      professionals: formattedProfessionals
    });
  } catch (error) {
    console.error('Error obteniendo profesionales:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;
    const { Review } = require('../models');
    
    const professional = await Professional.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          include: [
            {
              model: Profile,
              as: 'profile'
            }
          ]
        }
      ]
    });

    if (!professional) {
      return res.status(404).json({
        message: 'Profesional no encontrado'
      });
    }

    // Obtener reseñas recientes
    const recentReviews = await Review.findAll({
      where: { professionalId: id },
      include: [{
        model: User,
        as: 'patient',
        include: [{ model: Profile, as: 'profile' }]
      }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    const formattedReviews = recentReviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      patientName: review.isAnonymous ? 'Anónimo' : 
        `${review.patient.profile.firstName} ${review.patient.profile.lastName}`
    }));

    const formattedProfessional = {
      id: professional.id,
      name: `${professional.user.profile.firstName} ${professional.user.profile.lastName}`,
      specialty: professional.specialty,
      bio: professional.bio,
      rating: professional.averageRating,
      totalReviews: professional.totalReviews,
      consultationPrice: professional.consultationPrice,
      licenseNumber: professional.licenseNumber,
      email: professional.user.email,
      phone: professional.user.profile.phone,
      address: professional.user.profile.address,
      recentReviews: formattedReviews
    };

    res.json({
      message: 'Profesional obtenido exitosamente',
      professional: formattedProfessional
    });
  } catch (error) {
    console.error('Error obteniendo profesional:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const getMyPatients = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    console.log('👥 Obteniendo pacientes para profesional:', req.user.id);
    
    // Por ahora, devolver todos los pacientes activos
    // En un sistema real, habría una tabla de relación profesional-paciente
    const patients = await User.findAll({
      where: { role: 'patient', isActive: true },
      include: [{
        model: Profile,
        as: 'profile'
      }],
      order: [['created_at', 'DESC']]
    });

    console.log(`📊 Encontrados ${patients.length} pacientes`);

    // Obtener el profesional actual
    const { Professional, Appointment } = require('../models');
    const professional = await Professional.findOne({ where: { userId: req.user.id } });
    
    const formattedPatients = await Promise.all(patients.map(async (patient) => {
      // Verificar si tiene historial con este profesional
      const hasHistory = professional ? await Appointment.count({
        where: {
          patientId: patient.id,
          professionalId: professional.id,
          status: { [Op.in]: ['completed', 'confirmed'] }
        }
      }) > 0 : false;
      
      return {
        id: patient.id,
        email: patient.email,
        firstName: patient.profile?.firstName,
        lastName: patient.profile?.lastName,
        dni: patient.profile?.dni,
        phone: patient.profile?.phone,
        address: patient.profile?.address,
        createdAt: patient.createdAt,
        hasHistory
      };
    }));

    console.log('📤 Enviando pacientes:', formattedPatients);
    res.json(formattedPatients);
  } catch (error) {
    console.error('Error obteniendo pacientes:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const removePatientFromCartilla = async (req, res) => {
  try {
    const { patientId } = req.params;
    const professionalUserId = req.user.id;
    
    console.log(`🗑️ Removiendo paciente ${patientId} de cartilla del profesional ${professionalUserId}`);
    
    // Por ahora, como no hay tabla de relación, simplemente confirmamos la eliminación
    // En un sistema real, eliminaríamos la relación de la tabla profesional_pacientes
    
    res.json({
      message: 'Paciente removido de la cartilla exitosamente'
    });
  } catch (error) {
    console.error('Error removiendo paciente de cartilla:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getAllProfessionals,
  getProfessionalById,
  getMyPatients,
  removePatientFromCartilla
};