const bcrypt = require('bcryptjs');
const { User, Profile, Professional } = require('../models');

const seedProfessionals = async () => {
  try {
    console.log('🌱 Creando profesionales de prueba...');

    const professionals = [
      {
        email: 'dr.garcia@agendarte.com',
        firstName: 'Carlos',
        lastName: 'García',
        specialty: 'Cardiología',
        licenseNumber: 'MP12345',
        bio: 'Especialista en cardiología con 15 años de experiencia',
        consultationPrice: 8000,
        averageRating: 4.8,
        totalReviews: 45
      },
      {
        email: 'dra.lopez@agendarte.com',
        firstName: 'Ana',
        lastName: 'López',
        specialty: 'Dermatología',
        licenseNumber: 'MP12346',
        bio: 'Dermatóloga especializada en tratamientos estéticos',
        consultationPrice: 7500,
        averageRating: 4.9,
        totalReviews: 38
      },
      {
        email: 'dr.rodriguez@agendarte.com',
        firstName: 'Miguel',
        lastName: 'Rodríguez',
        specialty: 'Neurología',
        licenseNumber: 'MP12347',
        bio: 'Neurólogo con especialización en migrañas',
        consultationPrice: 9000,
        averageRating: 4.7,
        totalReviews: 52
      },
      {
        email: 'dra.martinez@agendarte.com',
        firstName: 'Laura',
        lastName: 'Martínez',
        specialty: 'Pediatría',
        licenseNumber: 'MP12348',
        bio: 'Pediatra con enfoque en medicina preventiva',
        consultationPrice: 6500,
        averageRating: 4.9,
        totalReviews: 67
      }
    ];

    for (const profData of professionals) {
      const existingUser = await User.findOne({ where: { email: profData.email } });
      if (existingUser) {
        console.log(`✅ Profesional ${profData.firstName} ${profData.lastName} ya existe`);
        continue;
      }

      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const user = await User.create({
        email: profData.email,
        password: hashedPassword,
        role: 'professional'
      });

      await Profile.create({
        userId: user.id,
        firstName: profData.firstName,
        lastName: profData.lastName,
        dni: `${20000000 + Math.floor(Math.random() * 10000000)}`,
        phone: `+54911${Math.floor(Math.random() * 9000000) + 1000000}`,
        address: 'Buenos Aires, Argentina'
      });

      await Professional.create({
        userId: user.id,
        specialty: profData.specialty,
        licenseNumber: profData.licenseNumber,
        bio: profData.bio,
        consultationPrice: profData.consultationPrice,
        averageRating: profData.averageRating,
        totalReviews: profData.totalReviews
      });

      console.log(`✅ Profesional ${profData.firstName} ${profData.lastName} creado`);
    }

    console.log('🎉 Profesionales de prueba creados exitosamente');
  } catch (error) {
    console.error('❌ Error creando profesionales:', error);
  }
};

module.exports = { seedProfessionals };