const { Professional, Schedule } = require('../models');

const seedSchedules = async () => {
  try {
    console.log('🕒 Creando horarios de prueba...');

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