const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Solo admin y master pueden acceder
router.get('/users', 
  authenticateToken, 
  authorizeRoles('admin', 'master'), 
  adminController.getAllUsers
);

router.post('/users', 
  authenticateToken, 
  authorizeRoles('admin', 'master'), 
  adminController.createUser
);

router.put('/users/:userId', 
  authenticateToken, 
  authorizeRoles('admin', 'master'), 
  adminController.updateUserRole
);

router.put('/users/:userId/full', 
  authenticateToken, 
  authorizeRoles('admin', 'master'), 
  adminController.updateUserFull
);

router.delete('/users/:userId', 
  authenticateToken, 
  authorizeRoles('master'), 
  adminController.deleteUser
);

// Rutas para gestión de turnos
router.get('/appointments', 
  authenticateToken, 
  authorizeRoles('admin', 'master'), 
  adminController.getAllAppointments
);

router.post('/appointments', 
  authenticateToken, 
  authorizeRoles('admin', 'master'), 
  adminController.createAppointment
);

router.put('/appointments/:appointmentId/cancel', 
  authenticateToken, 
  authorizeRoles('admin', 'master'), 
  adminController.cancelAppointment
);

router.put('/appointments/:appointmentId/reschedule', 
  authenticateToken, 
  authorizeRoles('admin', 'master'), 
  adminController.rescheduleAppointment
);

router.post('/appointments/:appointmentId/payment', 
  authenticateToken, 
  authorizeRoles('admin', 'master'), 
  adminController.processPayment
);

// Rutas para gestión de pacientes
router.get('/patients', 
  authenticateToken, 
  authorizeRoles('admin', 'master'), 
  adminController.getPatients
);

router.post('/patients', 
  authenticateToken, 
  authorizeRoles('admin', 'master'), 
  adminController.createPatient
);

// Rutas para reportes
router.post('/reports', 
  authenticateToken, 
  authorizeRoles('admin', 'master'), 
  adminController.generateReport
);

// Rutas para gestión de permisos
router.post('/users/:userId/reset-password', 
  authenticateToken, 
  authorizeRoles('master'), 
  adminController.resetUserPassword
);

module.exports = router;