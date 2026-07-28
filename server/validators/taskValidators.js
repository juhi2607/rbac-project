const { body } = require('express-validator');

const taskValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Review', 'Completed'])
    .withMessage('Invalid status value'),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid priority value'),

  body('project')
    .notEmpty().withMessage('Project ID is required')
    .isMongoId().withMessage('Invalid project ID'),

  body('assignedTo')
    .optional()
    .isMongoId().withMessage('Invalid user ID for assignedTo'),

  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date'),
];

const updateStatusValidator = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Todo', 'In Progress', 'Review', 'Completed'])
    .withMessage('Invalid status value'),
];

module.exports = { taskValidator, updateStatusValidator };
