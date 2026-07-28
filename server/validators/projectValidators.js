const { body } = require('express-validator');

const projectValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Project title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('status')
    .optional()
    .isIn(['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'])
    .withMessage('Invalid status value'),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid priority value'),

  body('manager')
    .optional()
    .isMongoId().withMessage('Invalid manager ID'),

  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date'),
];

module.exports = { projectValidator };
