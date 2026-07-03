const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  createLeave,
  listLeaves,
  listPending,
  getLeave,
  updateLeave,
  cancelLeave,
  approveLeave,
  rejectLeave,
} = require('../controllers/leaveController');

const router = express.Router();

const LEAVE_TYPES = ['SICK', 'CASUAL', 'ANNUAL', 'UNPAID', 'OTHER'];

const leaveBodyRules = [
  body('leaveType').isIn(LEAVE_TYPES).withMessage(`leaveType must be one of: ${LEAVE_TYPES.join(', ')}`),
  body('startDate').isISO8601().withMessage('startDate must be a valid date (YYYY-MM-DD).'),
  body('endDate')
    .isISO8601()
    .withMessage('endDate must be a valid date (YYYY-MM-DD).')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('endDate cannot be before startDate.');
      }
      return true;
    }),
  body('reason').trim().isLength({ min: 3, max: 500 }).withMessage('reason must be between 3 and 500 characters.'),
];

router.use(requireAuth);

// Manager-only: approvals queue (must be declared before the generic /:id route)
router.get('/pending', requireRole('MANAGER'), listPending);

router.post('/', leaveBodyRules, validate, createLeave);
router.get('/', listLeaves);
router.get('/:id', getLeave);
router.put('/:id', leaveBodyRules, validate, updateLeave);
router.delete('/:id', cancelLeave);

router.put(
  '/:id/approve',
  requireRole('MANAGER'),
  [body('comments').optional().trim().isLength({ max: 500 })],
  validate,
  approveLeave
);
router.put(
  '/:id/reject',
  requireRole('MANAGER'),
  [body('comments').trim().isLength({ min: 3, max: 500 }).withMessage('A reason for rejection is required.')],
  validate,
  rejectLeave
);

module.exports = router;
