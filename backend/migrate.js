const { sequelize } = require('./src/config/database');

async function runMigration() {
  try {
    console.log('Ejecutando migración...');
    
    // Agregar nuevos campos a la tabla professionals
    await sequelize.query(`
      ALTER TABLE professionals 
      ADD COLUMN IF NOT EXISTS subspecialty VARCHAR(100),
      ADD COLUMN IF NOT EXISTS social_networks JSON,
      ADD COLUMN IF NOT EXISTS profile_image TEXT
    `);
    
    console.log('✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    process.exit(1);
  }
}

runMigration();