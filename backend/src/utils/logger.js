/**
 * Minimal structured logger. Swappable for winston/pino later without
 * touching call sites, since everything goes through this module.
 */
function timestamp() {
  return new Date().toISOString();
}

const logger = {
  info: (msg, meta = {}) => console.log(`[INFO]  ${timestamp()} - ${msg}`, meta),
  warn: (msg, meta = {}) => console.warn(`[WARN]  ${timestamp()} - ${msg}`, meta),
  error: (msg, meta = {}) => console.error(`[ERROR] ${timestamp()} - ${msg}`, meta),
};

module.exports = logger;
