const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendar.controller');

router.get('/professional/:professionalId', calendarController.getProfessionalCalendar);

module.exports = router;