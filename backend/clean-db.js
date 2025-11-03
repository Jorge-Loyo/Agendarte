const { sequelize } = require('./src/config/database');
const bcrypt = require('bcryptjs');

const cleanDatabase = async () => {
  try {
    console.log('🧹 Limpiando base de datos...');
    
    // Eliminar todas las tablas y recrearlas
    await sequelize.sync({ force: true });
    
    // Crear especialidades básicas
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
    
    // Crear o actualizar usuario master
    const hashedPassword = await bcrypt.hash('Matris94', 10);
    
    // Verificar si existe
    const [existingUser] = await sequelize.query(`
      SELECT id FROM users WHERE email = 'jorgenayati@gmail.com';
    `);
    
    let userId;
    if (existingUser.length > 0) {
      // Actualizar usuario existente
      userId = existingUser[0].id;
      await sequelize.query(`
        UPDATE users SET password = '${hashedPassword}', role = 'master', is_active = true 
        WHERE email = 'jorgenayati@gmail.com';
      `);
      
      // Verificar y actualizar perfil
      const [existingProfile] = await sequelize.query(`
        SELECT id FROM profiles WHERE user_id = ${userId};
      `);
      
      if (existingProfile.length > 0) {
        await sequelize.query(`
          UPDATE profiles SET first_name = 'Jorge', last_name = 'Loyo', dni = '12345678', updated_at = NOW()
          WHERE user_id = ${userId};
        `);
      } else {
        await sequelize.query(`
          INSERT INTO profiles (user_id, first_name, last_name, dni, created_at, updated_at)
          VALUES (${userId}, 'Jorge', 'Loyo', '12345678', NOW(), NOW());
        `);
      }
    } else {
      // Crear nuevo usuario
      const [user] = await sequelize.query(`
        INSERT INTO users (email, password, role, is_active, created_at, updated_at) 
        VALUES ('jorgenayati@gmail.com', '${hashedPassword}', 'master', true, NOW(), NOW())
        RETURNING id;
      `);
      
      userId = user[0].id;
      
      await sequelize.query(`
        INSERT INTO profiles (user_id, first_name, last_name, dni, created_at, updated_at)
        VALUES (${userId}, 'Jorge', 'Loyo', '12345678', NOW(), NOW());
      `);
    }
    
    console.log('✅ Base de datos limpiada');
    console.log('✅ Especialidades creadas');
    console.log('✅ Usuario master creado: jorgenayati@gmail.com');
    console.log('🔑 Contraseña: Matris94');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

cleanDatabase();