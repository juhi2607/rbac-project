const express = require('express');
const router = express.Router();

const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getDashboardStats,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { projectValidator } = require('../validators/projectValidators');
const validateRequest = require('../middleware/validateRequest');

router.use(protect);

// All authenticated users can view projects (filtered by role in controller)
router.get('/stats', getDashboardStats);
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Admin-only: create, update, delete
router.post('/', authorize('Admin'), projectValidator, validateRequest, createProject);
router.put('/:id', authorize('Admin'), projectValidator, validateRequest, updateProject);
router.delete('/:id', authorize('Admin'), deleteProject);

module.exports = router;
