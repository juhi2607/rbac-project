const express = require('express');
const router = express.Router();

const { getUsers, getUserById, createUser, updateUser, deleteUser, getManagers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { createUserValidator, updateUserValidator } = require('../validators/userValidators');
const validateRequest = require('../middleware/validateRequest');

// All routes require authentication + Admin role
router.use(protect);

// Manager/Admin can access the managers list (for dropdowns)
router.get('/managers', authorize('Admin', 'Manager'), getManagers);

// Admin-only routes
router.get('/', authorize('Admin'), getUsers);
router.get('/:id', authorize('Admin'), getUserById);
router.post('/', authorize('Admin'), createUserValidator, validateRequest, createUser);
router.put('/:id', authorize('Admin'), updateUserValidator, validateRequest, updateUser);
router.delete('/:id', authorize('Admin'), deleteUser);

module.exports = router;
