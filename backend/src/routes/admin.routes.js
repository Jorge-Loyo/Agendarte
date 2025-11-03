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

router.delete('/users/:userId', 
  authenticateToken, 
  authorizeRoles('master'), 
  adminController.deleteUser
);

module.exports = router;