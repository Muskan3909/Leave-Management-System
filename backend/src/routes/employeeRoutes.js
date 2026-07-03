const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { listEmployees, getEmployee, getDashboard } = require('../controllers/employeeController');

const router = express.Router();

router.use(requireAuth);

router.get('/dashboard', getDashboard);
router.get('/employees', requireRole('MANAGER'), listEmployees);
router.get('/employees/:id', getEmployee);

module.exports = router;
