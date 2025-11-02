const { Professional, Schedule } = require('../models');

const seedSchedules = async () => {
  try {
    console.log('🕒 Creando horarios de prueba...');

    // Crear tabla schedules si no existe
    const { sequelize } = require('../config/database');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        professional_id INTEGER NOT NULL REFERENCES professionals(id),
        day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        consultation_duration INTEGER DEFAULT 30,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    const professionals = await Professional.findAll();
    
    for (const prof of professionals) {
      const existingSchedules = await Schedule.count({ 
        where: { professionalId: prof.id } 
      });
      
      if (existingSchedules === 0) {
        // Horarios de lunes a viernes 9:00-17:00
        for (let day = 1; day <= 5; day++) {
          await Schedule.create({
            professionalId: prof.id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '17:00',
            consultationDuration: 30
          });
        }
        console.log(`✅ Horarios creados para profesional ${prof.id}`);
      }
    }

    console.log('🎉 Horarios de prueba creados exitosamente');
  } catch (error) {
    console.error('❌ Error creando horarios:', error);
  }
};

module.exports = { seedSchedules };