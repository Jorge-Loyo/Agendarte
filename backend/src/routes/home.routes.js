const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller');

// Ruta para obtener la página de inicio
router.get('/', homeController.getHome);

module.exports = router;