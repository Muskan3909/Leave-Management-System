const rateLimit = require('express-rate-limit');

/**
 * General API limiter — generous enough for normal use, but stops runaway
 * scripts/scrapers from hammering the API.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: true, // adds RateLimit-* headers
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in a few minutes.' },
});

/**
 * Stricter limiter for the login endpoint specifically, to slow down
 * credential-stuffing / brute-force attempts without punishing normal use.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait a few minutes and try again.' },
});

module.exports = { apiLimiter, loginLimiter };
