const Specialty = require('../models/specialty.model');

const seedSpecialties = async () => {
  try {
    const count = await Specialty.count();
    if (count === 0) {
      await Specialty.bulkCreate([
        { name: 'Cardiología', description: 'Especialidad médica que se encarga del estudio, diagnóstico y tratamiento de las enfermedades del corazón' },
        { name: 'Dermatología', description: 'Especialidad médica que se encarga del estudio de la estructura y función de la piel' },
        { name: 'Neurología', description: 'Especialidad médica que trata los trastornos del sistema nervioso' },
        { name: 'Pediatría', description: 'Especialidad médica que estudia al niño y sus enfermedades' },
        { name: 'Ginecología', description: 'Especialidad médica que trata las enfermedades del sistema reproductor femenino' },
        { name: 'Traumatología', description: 'Especialidad médica que se dedica al estudio de las lesiones del aparato locomotor' },
        { name: 'Oftalmología', description: 'Especialidad médica que estudia las enfermedades de los ojos' },
        { name: 'Psicología', description: 'Ciencia que estudia los procesos mentales, las sensaciones, las percepciones y el comportamiento humano' }
      ]);
      console.log('✅ Especialidades creadas correctamente');
    } else {
      console.log('✅ Especialidades ya existen');
    }
  } catch (error) {
    console.error('❌ Error al crear especialidades:', error.message);
    // Intentar insertar manualmente si falla
    try {
      const { sequelize } = require('../config/database');
      await sequelize.query(`
        INSERT INTO specialties (name, description, "isActive", "createdAt", "updatedAt") VALUES
        ('Cardiología', 'Especialidad médica que se encarga del estudio, diagnóstico y tratamiento de las enfermedades del corazón', true, NOW(), NOW()),
        ('Dermatología', 'Especialidad médica que se encarga del estudio de la estructura y función de la piel', true, NOW(), NOW()),
        ('Neurología', 'Especialidad médica que trata los trastornos del sistema nervioso', true, NOW(), NOW()),
        ('Pediatría', 'Especialidad médica que estudia al niño y sus enfermedades', true, NOW(), NOW()),
        ('Ginecología', 'Especialidad médica que trata las enfermedades del sistema reproductor femenino', true, NOW(), NOW()),
        ('Traumatología', 'Especialidad médica que se dedica al estudio de las lesiones del aparato locomotor', true, NOW(), NOW()),
        ('Oftalmología', 'Especialidad médica que estudia las enfermedades de los ojos', true, NOW(), NOW()),
        ('Psicología', 'Ciencia que estudia los procesos mentales, las sensaciones, las percepciones y el comportamiento humano', true, NOW(), NOW())
        ON CONFLICT (name) DO NOTHING;
      `);
      console.log('✅ Especialidades insertadas manualmente');
    } catch (insertError) {
      console.error('❌ Error insertando especialidades manualmente:', insertError.message);
    }
  }
};

module.exports = seedSpecialties;