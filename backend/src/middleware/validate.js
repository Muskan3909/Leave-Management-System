const { validationResult } = require('express-validator');

/**
 * Runs after an array of express-validator checks. If any failed, responds
 * with a 422 and a normalized list of field-level errors; otherwise calls next().
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Validation failed.',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = validate;
