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
      rating: prof.averageRating,
      totalReviews: prof.totalReviews,
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
      address: professional.user.profile.address
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

module.exports = {
  getAllProfessionals,
  getProfessionalById
};