const bcrypt = require('bcrypt');

async function hashPassword() {
    const password = 'Matris94';
    const saltRounds = 10;
    
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('Contraseña original:', password);
        console.log('Hash generado:', hashedPassword);
        console.log('\nSQL para actualizar:');
        console.log(`UPDATE users SET password = '${hashedPassword}' WHERE email = 'svzurbaran@gimail.com';`);
    } catch (error) {
        console.error('Error generando hash:', error);
    }
}

hashPassword();