class MercadoPagoService {
  constructor() {
    this.useSimulation = process.env.NODE_ENV === 'development' || !process.env.MERCADOPAGO_ACCESS_TOKEN;
  }

  async createPayment(appointmentData) {
    if (this.useSimulation) {
      return this.simulatePayment(appointmentData);
    }

    try {
      const mercadopago = require('mercadopago');
      mercadopago.configure({
        access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
      });

      const preference = {
        items: [{
          title: `Consulta - ${appointmentData.professionalName}`,
          description: `${appointmentData.specialty} - ${appointmentData.date} ${appointmentData.time}`,
          unit_price: appointmentData.price,
          quantity: 1,
          currency_id: 'ARS'
        }],
        payer: {
          name: appointmentData.patientName,
          email: appointmentData.patientEmail
        },
        back_urls: {
          success: `http://localhost:4200/payment/success`,
          failure: `http://localhost:4200/payment/failure`,
          pending: `http://localhost:4200/payment/pending`
        },
        auto_return: 'approved',
        external_reference: appointmentData.appointmentId.toString(),
        notification_url: `http://localhost:3000/api/payments/webhook`
      };

      const response = await mercadopago.preferences.create(preference);
      return {
        id: response.body.id,
        init_point: response.body.init_point,
        sandbox_init_point: response.body.sandbox_init_point
      };
    } catch (error) {
      console.error('Error creando preferencia de pago:', error);
      return this.simulatePayment(appointmentData);
    }
  }

  async processWebhook(paymentId) {
    if (this.useSimulation) {
      return {
        id: paymentId,
        status: 'approved',
        external_reference: paymentId,
        transaction_amount: 1000
      };
    }

    try {
      const mercadopago = require('mercadopago');
      const payment = await mercadopago.payment.findById(paymentId);
      return {
        id: payment.body.id,
        status: payment.body.status,
        external_reference: payment.body.external_reference,
        transaction_amount: payment.body.transaction_amount
      };
    } catch (error) {
      console.error('Error procesando webhook:', error);
      throw error;
    }
  }

  simulatePayment(appointmentData) {
    return {
      id: `SIMULATED_${Date.now()}`,
      init_point: `http://localhost:4200/payment/simulate?amount=${appointmentData.price}&ref=${appointmentData.appointmentId}`,
      sandbox_init_point: `http://localhost:4200/payment/simulate?amount=${appointmentData.price}&ref=${appointmentData.appointmentId}`
    };
  }
}

module.exports = new MercadoPagoService();