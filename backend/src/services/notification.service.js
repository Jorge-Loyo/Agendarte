const { Notification, Appointment, User, Profile, Professional, UserPreference } = require('../models');
const { Op } = require('sequelize');

class NotificationService {
  
  // Crear notificaciones para una cita
  async createNotificationsForAppointment(appointmentId) {
    try {
      const appointment = await Appointment.findByPk(appointmentId, {
        include: [
          {
            model: User,
            as: 'patient',
            include: [
              { model: Profile, as: 'profile' },
              { model: UserPreference, as: 'preferences' }
            ]
          },
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

      if (!appointment) return;

      const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
      const preferences = appointment.patient.preferences || { emailReminders: true, whatsappReminders: false };

      // Crear notificación de email 24h antes
      if (preferences.emailReminders) {
        const email24h = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
        await Notification.create({
          appointmentId,
          userId: appointment.patientId,
          type: 'email_24h',
          scheduledFor: email24h
        });
      }

      // Crear notificación de WhatsApp 2h antes (si está habilitado)
      if (preferences.whatsappReminders) {
        const whatsapp2h = new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000);
        await Notification.create({
          appointmentId,
          userId: appointment.patientId,
          type: 'whatsapp_2h',
          scheduledFor: whatsapp2h
        });
      }

      console.log(`📅 Notificaciones creadas para cita ${appointmentId}`);
    } catch (error) {
      console.error('Error creando notificaciones:', error);
    }
  }

  // Procesar notificaciones pendientes
  async processPendingNotifications() {
    try {
      const now = new Date();
      const pendingNotifications = await Notification.findAll({
        where: {
          status: 'pending',
          scheduledFor: { [Op.lte]: now }
        },
        include: [
          {
            model: Appointment,
            as: 'appointment',
            include: [
              {
                model: User,
                as: 'patient',
                include: [{ model: Profile, as: 'profile' }]
              },
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
          }
        ]
      });

      for (const notification of pendingNotifications) {
        await this.sendNotification(notification);
      }

      console.log(`📧 Procesadas ${pendingNotifications.length} notificaciones`);
    } catch (error) {
      console.error('Error procesando notificaciones:', error);
    }
  }

  // Enviar notificación individual
  async sendNotification(notification) {
    try {
      const appointment = notification.appointment;
      const patient = appointment.patient;
      const professional = appointment.professional;

      if (notification.type.startsWith('email')) {
        await this.sendEmailReminder(notification, appointment, patient, professional);
      } else if (notification.type.startsWith('whatsapp')) {
        await this.sendWhatsAppReminder(notification, appointment, patient, professional);
      }
    } catch (error) {
      await notification.update({
        status: 'failed',
        errorMessage: error.message
      });
      console.error('Error enviando notificación:', error);
    }
  }

  // Enviar recordatorio por email
  async sendEmailReminder(notification, appointment, patient, professional) {
    try {
      const professionalName = `${professional.user.profile.firstName} ${professional.user.profile.lastName}`;
      const patientName = `${patient.profile.firstName} ${patient.profile.lastName}`;
      
      // Simular envío de email (en producción usar nodemailer, SendGrid, etc.)
      console.log(`📧 EMAIL RECORDATORIO:`);
      console.log(`Para: ${patient.email}`);
      console.log(`Asunto: Recordatorio de cita - ${professionalName}`);
      console.log(`---`);
      console.log(`Hola ${patientName},`);
      console.log(`Te recordamos tu cita programada:`);
      console.log(`📅 Fecha: ${appointment.appointmentDate}`);
      console.log(`🕐 Hora: ${appointment.appointmentTime}`);
      console.log(`👨⚕️ Profesional: ${professionalName}`);
      console.log(`🏥 Especialidad: ${professional.specialty}`);
      if (appointment.notes) {
        console.log(`📝 Notas: ${appointment.notes}`);
      }
      console.log(`---`);
      console.log(`Si necesitas cancelar o reprogramar, contacta con nosotros.`);
      console.log(`Saludos, Equipo Agendarte`);

      await notification.update({
        status: 'sent',
        sentAt: new Date()
      });
    } catch (error) {
      throw error;
    }
  }

  // Enviar recordatorio por WhatsApp
  async sendWhatsAppReminder(notification, appointment, patient, professional) {
    try {
      const professionalName = `${professional.user.profile.firstName} ${professional.user.profile.lastName}`;
      
      // Simular envío de WhatsApp (en producción usar WhatsApp Business API)
      console.log(`💬 WHATSAPP RECORDATORIO:`);
      console.log(`Para: ${patient.profile.phone}`);
      console.log(`Mensaje: 🏥 *Recordatorio de Cita*`);
      console.log(`Hola! Te recordamos tu cita:`);
      console.log(`📅 Fecha: ${appointment.appointmentDate}`);
      console.log(`🕐 Hora: ${appointment.appointmentTime}`);
      console.log(`👨⚕️ Profesional: ${professionalName}`);
      console.log(`🏥 Especialidad: ${professional.specialty}`);
      console.log(``);
      console.log(`Si necesitas cancelar o reprogramar, responde a este mensaje.`);
      console.log(``);
      console.log(`Saludos, *Agendarte* 🩺`);

      await notification.update({
        status: 'sent',
        sentAt: new Date()
      });
    } catch (error) {
      throw error;
    }
  }

  // Iniciar procesamiento automático
  startNotificationProcessor() {
    // Procesar cada 5 minutos
    setInterval(() => {
      this.processPendingNotifications();
    }, 5 * 60 * 1000);
    
    console.log('🔄 Procesador de notificaciones iniciado (cada 5 minutos)');
  }
}

module.exports = new NotificationService();