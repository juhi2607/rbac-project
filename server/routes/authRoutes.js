const express = require('express');
const router = express.Router();

const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const { updateProfileValidator } = require('../validators/userValidators');
const validateRequest = require('../middleware/validateRequest');

// Public routes
router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidator, validateRequest, updateProfile);

module.exports = router;
