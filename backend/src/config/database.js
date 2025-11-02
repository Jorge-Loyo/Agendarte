const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de la base de datos PostgreSQL
const sequelize = new Sequelize(
    process.env.DATABASE_URL || `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'agendarte'}`,
    {
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false // Para AWS RDS
            } : false
        },
        timezone: '-03:00' // Argentina timezone
    }
);

// Función para probar la conexión
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida correctamente');
        console.log(`📊 Base de datos: ${process.env.DB_NAME || 'agendarte'}`);
        console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error.message);
        process.exit(1);
    }
};

// Función para sincronizar modelos
const syncDatabase = async () => {
    try {
        await sequelize.sync({ force: false, alter: true });
        console.log('🔄 Modelos sincronizados con la base de datos');
    } catch (error) {
        console.error('❌ Error sincronizando modelos:', error.message);
        // Intentar crear tabla specialties manualmente si no existe
        try {
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS specialties (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) UNIQUE NOT NULL,
                    description TEXT,
                    "isActive" BOOLEAN DEFAULT true,
                    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
                );
            `);
            console.log('✅ Tabla specialties creada manualmente');
        } catch (createError) {
            console.error('❌ Error creando tabla specialties:', createError.message);
        }
    }
};

module.exports = {
    sequelize,
    testConnection,
    syncDatabase
};