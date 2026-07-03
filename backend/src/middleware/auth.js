const { verifyToken } = require('../utils/jwt');
const Employee = require('../models/Employee');

/**
 * Verifies the Bearer token and attaches the authenticated employee
 * (minus password hash) to req.user. Rejects with 401 if missing/invalid.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required. Missing or malformed token.' });
  }

  try {
    const decoded = verifyToken(token);
    const employee = Employee.findById(decoded.id);
    if (!employee) {
      return res.status(401).json({ error: 'The user for this token no longer exists.' });
    }
    req.user = Employee.toSafeObject(employee);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Restricts a route to one or more roles. Use after requireAuth.
 * Example: requireRole('MANAGER')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
