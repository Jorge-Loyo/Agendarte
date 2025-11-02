const { Appointment, User, Profile, Professional } = require('../models');
const mercadoPagoService = require('../services/mercadopago.service');

const createPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.user.id;

    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        {
          model: Professional,
          as: 'professional',
          include: [{
            model: User,
            as: 'user',
            include: [{ model: Profile, as: 'profile' }]
          }]
        }
      ]
    });

    if (!appointment || appointment.patientId !== userId) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    // Obtener datos del paciente por separado
    const patient = await User.findByPk(userId, {
      include: [{ model: Profile, as: 'profile' }]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    if (appointment.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'El turno ya está pagado' });
    }

    const appointmentData = {
      appointmentId: appointment.id,
      professionalName: `${appointment.professional.user.profile?.firstName || 'Profesional'} ${appointment.professional.user.profile?.lastName || ''}`.trim(),
      specialty: appointment.professional.specialty,
      date: appointment.appointmentDate,
      time: appointment.appointmentTime,
      price: appointment.professional.consultationPrice || 5000,
      patientName: `${patient.profile?.firstName || 'Paciente'} ${patient.profile?.lastName || ''}`.trim(),
      patientEmail: patient.email
    };

    const paymentPreference = await mercadoPagoService.createPayment(appointmentData);

    // Actualizar appointment con payment ID
    await appointment.update({
      paymentId: paymentPreference.id,
      paymentStatus: 'pending'
    });

    res.json({
      message: 'Preferencia de pago creada',
      payment: paymentPreference,
      appointment: {
        id: appointment.id,
        professional: appointmentData.professionalName,
        date: appointmentData.date,
        time: appointmentData.time,
        price: appointmentData.price
      }
    });
  } catch (error) {
    console.error('Error creando pago:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const processWebhook = async (req, res) => {
  try {
    const { id, topic } = req.query;
    
    if (topic === 'payment') {
      const paymentInfo = await mercadoPagoService.processWebhook(id);
      
      const appointment = await Appointment.findOne({
        where: { id: paymentInfo.external_reference }
      });

      if (appointment) {
        let newStatus = 'pending';
        let appointmentStatus = appointment.status;

        switch (paymentInfo.status) {
          case 'approved':
            newStatus = 'paid';
            appointmentStatus = 'confirmed';
            break;
          case 'rejected':
          case 'cancelled':
            newStatus = 'failed';
            break;
          case 'pending':
          case 'in_process':
            newStatus = 'pending';
            break;
        }

        await appointment.update({
          paymentStatus: newStatus,
          status: appointmentStatus
        });

        console.log(`💳 Pago ${paymentInfo.status} para turno ${appointment.id}`);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error procesando webhook:', error);
    res.status(500).send('Error');
  }
};

const simulatePaymentSuccess = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    await appointment.update({
      paymentStatus: 'paid',
      status: 'confirmed'
    });

    console.log(`✅ Pago simulado exitoso para turno ${appointmentId}`);

    res.json({
      message: 'Pago procesado exitosamente',
      appointment: {
        id: appointment.id,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus
      }
    });
  } catch (error) {
    console.error('Error simulando pago:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  createPayment,
  processWebhook,
  simulatePaymentSuccess
};