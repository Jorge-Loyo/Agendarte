const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    }
});

async function createMasterUser() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos');

        const email = process.env.MASTER_EMAIL || 'jorgenayati@gmail.com';
        const password = 'Admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const [user] = await sequelize.query(`
            INSERT INTO users (email, password, role, "isActive", "createdAt", "updatedAt")
            VALUES (:email, :password, 'master', true, NOW(), NOW())
            ON CONFLICT (email) DO UPDATE SET 
                password = :password,
                role = 'master',
                "isActive" = true
            RETURNING id, email, role
        `, {
            replacements: { email, password: hashedPassword }
        });

        console.log('✅ Usuario master creado/actualizado:', user[0]);
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);

        await sequelize.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createMasterUser();
