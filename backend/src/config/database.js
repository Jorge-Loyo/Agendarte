const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('nombre_base_datos', 'usuario', 'contraseña', {
    host: 'localhost',
    dialect: 'mysql' // o 'postgres', 'sqlite', etc. según la base de datos que estés utilizando
});

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida con éxito.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
};

testConnection();

module.exports = sequelize;