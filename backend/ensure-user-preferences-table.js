const { sequelize } = require('./src/config/database');

const ensureUserPreferencesTable = async () => {
  try {
    console.log('🔧 Verificando tabla user_preferences...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        email_reminders BOOLEAN DEFAULT true,
        whatsapp_reminders BOOLEAN DEFAULT false,
        reminder_hours INTEGER DEFAULT 24,
        google_tokens TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('✅ Tabla user_preferences verificada/creada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

ensureUserPreferencesTable();