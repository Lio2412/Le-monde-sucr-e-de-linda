const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin, validateResetPassword } = require('../middlewares/validation.middleware');

// Routes d'authentification
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.get('/verify-token', authController.verifyToken);

module.exports = router; 