const Specialty = require('../models/specialty.model');

const specialtyController = {
  // Obtener todas las especialidades
  getAllSpecialties: async (req, res) => {
    try {
      const specialties = await Specialty.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']]
      });
      res.json(specialties);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener especialidades', error: error.message });
    }
  },

  // Crear nueva especialidad
  createSpecialty: async (req, res) => {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'El nombre es requerido' });
      }

      const specialty = await Specialty.create({ name, description });
      res.status(201).json(specialty);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'La especialidad ya existe' });
      }
      res.status(500).json({ message: 'Error al crear especialidad', error: error.message });
    }
  },

  // Actualizar especialidad
  updateSpecialty: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const specialty = await Specialty.findByPk(id);
      if (!specialty) {
        return res.status(404).json({ message: 'Especialidad no encontrada' });
      }

      await specialty.update({ name, description });
      res.json(specialty);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar especialidad', error: error.message });
    }
  },

  // Eliminar especialidad (soft delete)
  deleteSpecialty: async (req, res) => {
    try {
      const { id } = req.params;

      const specialty = await Specialty.findByPk(id);
      if (!specialty) {
        return res.status(404).json({ message: 'Especialidad no encontrada' });
      }

      await specialty.update({ isActive: false });
      res.json({ message: 'Especialidad eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar especialidad', error: error.message });
    }
  }
};

module.exports = specialtyController;