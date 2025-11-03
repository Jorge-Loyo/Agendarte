#!/usr/bin/env node

// Script para generar JWT secret seguro
const crypto = require('crypto');

const secret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET generado:');
console.log(secret);
console.log('\nAgrégalo a tu archivo .env:');
console.log(`JWT_SECRET=${secret}`);