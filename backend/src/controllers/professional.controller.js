const {
  User,
  Profile,
  Professional,
  ProfessionalPatient,
} = require("../models");
const { Op, fn, col, literal } = require("sequelize");

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
          as: "user",
          where: { isActive: true },
          include: [
            {
              model: Profile,
              as: "profile",
            },
          ],
        },
      ],
      order: [["averageRating", "DESC"]],
    });

    const formattedProfessionals = professionals.map((prof) => ({
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
      address: prof.user.profile.address,
    }));

    res.json({
      message: "Profesionales obtenidos exitosamente",
      professionals: formattedProfessionals,
    });
  } catch (error) {
    console.error("Error obteniendo profesionales:", error);
    res.status(500).json({
      message: "Error interno del servidor"
    });
  }
};

const getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;
    const { Review } = require("../models");

    const professional = await Professional.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          include: [
            {
              model: Profile,
              as: "profile",
            },
          ],
        },
      ],
    });

    if (!professional) {
      return res.status(404).json({
        message: "Profesional no encontrado",
      });
    }

    // Obtener reseñas recientes
    const recentReviews = await Review.findAll({
      where: { professionalId: id },
      include: [
        {
          model: User,
          as: "patient",
          include: [{ model: Profile, as: "profile" }],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    const formattedReviews = recentReviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      patientName: review.isAnonymous
        ? "Anónimo"
        : `${review.patient.profile.firstName} ${review.patient.profile.lastName}`,
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
      recentReviews: formattedReviews,
    };

    res.json({
      message: "Profesional obtenido exitosamente",
      professional: formattedProfessional,
    });
  } catch (error) {
    console.error("Error obteniendo profesional:", error);
    res.status(500).json({
      message: "Error interno del servidor"
    });
  }
};

// Simulación de cartilla por profesional (en memoria)
const professionalCartillas = new Map();

const getMyPatients = async (req, res) => {
  try {
    const professionalUserId = req.user.id;

    // Obtener el profesional
    const professional = await Professional.findOne({
      where: { userId: professionalUserId },
    });
    if (!professional) {
      return res.status(404).json({ message: "Profesional no encontrado" });
    }

    // Obtener solo los pacientes en la cartilla del profesional
    const cartillaRelations = await ProfessionalPatient.findAll({
      where: { professionalId: professional.id },
      include: [
        {
          model: User,
          as: "patient",
          include: [{ model: Profile, as: "profile" }],
        },
      ],
    });

    const { Appointment } = require("../models");
    const formattedPatients = await Promise.all(
      cartillaRelations.map(async (relation) => {
        const patient = relation.patient;

        // Verificar si tiene historial con este profesional
        const hasHistory =
          (await Appointment.count({
            where: {
              patientId: patient.id,
              professionalId: professional.id,
              status: { [Op.in]: ["completed", "confirmed"] },
            },
          })) > 0;

        return {
          id: patient.id,
          email: patient.email,
          firstName: patient.profile?.firstName,
          lastName: patient.profile?.lastName,
          dni: patient.profile?.dni,
          phone: patient.profile?.phone,
          address: patient.profile?.address,
          createdAt: patient.createdAt,
          hasHistory,
        };
      })
    );

    res.json(formattedPatients);
  } catch (error) {
    console.error("Error obteniendo pacientes:", error);
    res.status(500).json({
      message: "Error interno del servidor"
    });
  }
};

const addPatientToCartilla = async (req, res) => {
  try {
    const { patientId } = req.body;
    const professionalUserId = req.user.id;

    console.log(
      `➕ Agregando paciente ${patientId} a cartilla del profesional ${professionalUserId}`
    );

    // Obtener el profesional
    const professional = await Professional.findOne({
      where: { userId: professionalUserId },
    });
    if (!professional) {
      return res.status(404).json({ message: "Profesional no encontrado" });
    }

    // Verificar que el paciente existe
    const patient = await User.findByPk(patientId);
    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    // Crear relación en BD (ignorar si ya existe)
    await ProfessionalPatient.findOrCreate({
      where: {
        professionalId: professional.id,
        patientId: parseInt(patientId),
      },
    });

    res.json({
      message: "Paciente agregado a la cartilla exitosamente",
    });
  } catch (error) {
    console.error("Error agregando paciente a cartilla:", error);
    res.status(500).json({
      message: "Error interno del servidor"
    });
  }
};

const removePatientFromCartilla = async (req, res) => {
  try {
    const { patientId } = req.params;
    const professionalUserId = req.user.id;

    console.log(
      `🗑️ Removiendo paciente ${patientId} de cartilla del profesional ${professionalUserId}`
    );

    // Obtener el profesional
    const professional = await Professional.findOne({
      where: { userId: professionalUserId },
    });
    if (!professional) {
      return res.status(404).json({ message: "Profesional no encontrado" });
    }

    // Eliminar relación de BD
    await ProfessionalPatient.destroy({
      where: {
        professionalId: professional.id,
        patientId: parseInt(patientId),
      },
    });

    res.json({
      message: "Paciente removido de la cartilla exitosamente",
    });
  } catch (error) {
    console.error("Error removiendo paciente de cartilla:", error);
    res.status(500).json({
      message: "Error interno del servidor"
    });
  }
};

const searchPatients = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ patients: [] });
    }

    // Sanitize and validate input
    if (typeof q !== 'string') {
      return res.status(400).json({ message: "Parámetro de búsqueda inválido" });
    }

    const safeQ = q.trim().replace(/[\\%_]/g, "\\$&").toLowerCase();
    
    if (safeQ.length < 2) {
      return res.json({ patients: [] });
    }

    const filteredPatients = await User.findAll({
      attributes: ["id", "email", "createdAt"],
      where: {
        role: "patient",
        isActive: true,
        [Op.or]: [
          {
            email: {
              [Op.iLike]: `%${safeQ}%`
            }
          },
          {
            '$profile.firstName$': {
              [Op.iLike]: `%${safeQ}%`
            }
          },
          {
            '$profile.lastName$': {
              [Op.iLike]: `%${safeQ}%`
            }
          },
          {
            '$profile.dni$': {
              [Op.like]: `%${safeQ}%`
            }
          }
        ],
      },
      include: [
        {
          model: Profile,
          as: "profile",
          required: false,
          attributes: ["firstName", "lastName", "dni", "phone"],
        },
      ],
      limit: 10,
      order: [["createdAt", "DESC"]],
    });

    const formattedPatients = filteredPatients.map((patient) => ({
      id: patient.id,
      firstName: patient.profile?.firstName || "Sin nombre",
      lastName: patient.profile?.lastName || "",
      dni: patient.profile?.dni || "Sin DNI",
      phone: patient.profile?.phone || "Sin teléfono",
      email: patient.email,
    }));

    res.json({ patients: formattedPatients });
  } catch (error) {
    console.error("Error searching patients:", error);
    res.status(500).json({
      message: "Error interno del servidor"
    });
  }
};

module.exports = {
  getAllProfessionals,
  getProfessionalById,
  getMyPatients,
  addPatientToCartilla,
  removePatientFromCartilla,
  searchPatients,
  professionalCartillas,
};
