const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const { signToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * POST /api/auth/login
 * Verifies credentials and returns a JWT + the safe user object.
 * We intentionally return the same generic error for "no such user" and
 * "wrong password" so we don't leak which emails are registered.
 */
async function login(req, res) {
  const { email, password } = req.body;

  const employee = Employee.findByEmail(email.toLowerCase().trim());
  if (!employee) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const passwordMatches = await bcrypt.compare(password, employee.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken({ id: employee.id, role: employee.role });
  logger.info('User logged in', { userId: employee.id, role: employee.role });

  res.json({
    token,
    user: Employee.toSafeObject(employee),
  });
}

/**
 * POST /api/auth/logout
 * JWTs are stateless, so "logout" is handled client-side by discarding the
 * token. This endpoint exists for a consistent API contract and so a
 * server-side denylist can be added later without breaking clients.
 */
function logout(req, res) {
  res.json({ message: 'Logged out successfully.' });
}

/** GET /api/auth/me — returns the current authenticated user. */
function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, logout, me };
