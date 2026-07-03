const db = require('../config/db');

/**
 * Append-only audit trail for leave request status changes. Used to answer
 * "who did what, when" — e.g. for compliance or resolving disputes about a
 * decision. Rows are only ever inserted, never updated or deleted.
 */
const AuditLog = {
  record({ leaveId, actorId, action, details = null }) {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (leave_id, actor_id, action, details)
      VALUES (:leaveId, :actorId, :action, :details)
    `);
    stmt.run({ leaveId, actorId, action, details });
  },

  findByLeave(leaveId) {
    return db
      .prepare(
        `SELECT audit_logs.*, employees.name AS actor_name
         FROM audit_logs
         LEFT JOIN employees ON employees.id = audit_logs.actor_id
         WHERE leave_id = ?
         ORDER BY created_at ASC`
      )
      .all(leaveId);
  },
};

module.exports = AuditLog;
