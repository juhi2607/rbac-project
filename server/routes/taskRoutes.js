const express = require('express');
const router = express.Router();

const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { taskValidator, updateStatusValidator } = require('../validators/taskValidators');
const validateRequest = require('../middleware/validateRequest');

router.use(protect);

// All roles can view tasks (filtered in controller)
router.get('/', getTasks);
router.get('/:id', getTaskById);

// All roles can update status (with restrictions in controller)
router.patch('/:id/status', updateStatusValidator, validateRequest, updateTaskStatus);

// Manager + Admin: create, update, delete
router.post('/', authorize('Admin', 'Manager'), taskValidator, validateRequest, createTask);
router.put('/:id', authorize('Admin', 'Manager'), taskValidator, validateRequest, updateTask);
router.delete('/:id', authorize('Admin', 'Manager'), deleteTask);

module.exports = router;
