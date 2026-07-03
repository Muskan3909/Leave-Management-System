const Employee = require('../models/Employee');
const Leave = require('../models/Leave');

/**
 * GET /api/employees
 * Manager-only. Supports ?search=&department=&role=
 */
function listEmployees(req, res) {
  const { search, department, role } = req.query;
  const employees = Employee.findAll({ search, department, role });
  res.json({ employees });
}

/**
 * GET /api/employees/:id
 * A manager can view any employee; an employee can only view themselves.
 */
function getEmployee(req, res) {
  const id = Number(req.params.id);

  if (req.user.role !== 'MANAGER' && req.user.id !== id) {
    return res.status(403).json({ error: 'You can only view your own profile.' });
  }

  const employee = Employee.findById(id);
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  res.json({ employee: Employee.toSafeObject(employee) });
}

/**
 * GET /api/dashboard
 * Returns role-appropriate dashboard summary data in one call so the
 * frontend doesn't need to orchestrate multiple requests on page load.
 */
function getDashboard(req, res) {
  if (req.user.role === 'MANAGER') {
    return res.json({
      totalEmployees: Employee.countAll(),
      leaveCounts: Leave.getCounts(),
      recentActivity: Leave.getRecent(null, 6),
    });
  }

  res.json({
    leaveCounts: Leave.getCounts(req.user.id),
    recentActivity: Leave.getRecent(req.user.id, 6),
  });
}

module.exports = { listEmployees, getEmployee, getDashboard };
