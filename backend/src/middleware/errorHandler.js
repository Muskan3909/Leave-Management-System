const logger = require('../utils/logger');

/** 404 handler for unmatched routes. Mounted last, before the error handler. */
function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * Central error handler. Every controller either responds directly or
 * calls next(err), which lands here so error formatting stays consistent.
 */
function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, path: req.originalUrl });

  const status = err.status || 500;
  const message = status === 500 ? 'Something went wrong on our end.' : err.message;

  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
