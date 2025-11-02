const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken } = require('../middleware/auth');

router.post('/create', authenticateToken, paymentController.createPayment);
router.post('/webhook', paymentController.processWebhook);
router.post('/simulate-success', authenticateToken, paymentController.simulatePaymentSuccess);

module.exports = router;