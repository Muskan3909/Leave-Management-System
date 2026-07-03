const db = require('../config/db');

/**
 * Data-access layer for the `leaves` table.
 */
const Leave = {
  create({ employeeId, leaveType, startDate, endDate, reason }) {
    const stmt = db.prepare(`
      INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason)
      VALUES (:employeeId, :leaveType, :startDate, :endDate, :reason)
    `);
    const info = stmt.run({ employeeId, leaveType, startDate, endDate, reason });
    return Leave.findById(info.lastInsertRowid);
  },

  findById(id) {
    return db.prepare('SELECT * FROM leaves WHERE id = ?').get(id);
  },

  // Employee-scoped list with optional search/filter
  findByEmployee(employeeId, { status, leaveType, search } = {}) {
    let query = 'SELECT * FROM leaves WHERE employee_id = ?';
    const params = [employeeId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (leaveType) {
      query += ' AND leave_type = ?';
      params.push(leaveType);
    }
    if (search) {
      query += ' AND reason LIKE ?';
      params.push(`%${search}%`);
    }
    query += ' ORDER BY created_at DESC';

    return db.prepare(query).all(...params);
  },

  // Manager-scoped list across all employees, with optional filters
  findAll({ status, leaveType, search, employeeId } = {}) {
    let query = `
      SELECT leaves.*, employees.name AS employee_name, employees.department AS employee_department
      FROM leaves
      JOIN employees ON employees.id = leaves.employee_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND leaves.status = ?';
      params.push(status);
    }
    if (leaveType) {
      query += ' AND leaves.leave_type = ?';
      params.push(leaveType);
    }
    if (employeeId) {
      query += ' AND leaves.employee_id = ?';
      params.push(employeeId);
    }
    if (search) {
      query += ' AND (employees.name LIKE ? OR leaves.reason LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY leaves.created_at DESC';

    return db.prepare(query).all(...params);
  },

  findPending() {
    return Leave.findAll({ status: 'PENDING' });
  },

  update(id, fields) {
    const allowed = ['leave_type', 'start_date', 'end_date', 'reason', 'status', 'manager_comments', 'reviewed_by'];
    const keys = Object.keys(fields).filter((k) => allowed.includes(k) && fields[k] !== undefined);
    if (keys.length === 0) return Leave.findById(id);

    const params = { id };
    for (const k of keys) params[k] = fields[k];

    const setClause = keys.map((k) => `${k} = :${k}`).join(', ');
    const stmt = db.prepare(`
      UPDATE leaves SET ${setClause}, updated_at = datetime('now') WHERE id = :id
    `);
    stmt.run(params);
    return Leave.findById(id);
  },

  delete(id) {
    return db.prepare('DELETE FROM leaves WHERE id = ?').run(id);
  },

  // Dashboard aggregate counts, optionally scoped to one employee
  getCounts(employeeId = null) {
    const where = employeeId ? 'WHERE employee_id = ?' : '';
    const params = employeeId ? [employeeId] : [];
    const rows = db.prepare(`SELECT status, COUNT(*) as count FROM leaves ${where} GROUP BY status`).all(...params);

    const counts = { total: 0, PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 };
    for (const row of rows) {
      counts[row.status] = row.count;
      counts.total += row.count;
    }
    return counts;
  },

  getRecent(employeeId = null, limit = 5) {
    if (employeeId) {
      return db
        .prepare('SELECT * FROM leaves WHERE employee_id = ? ORDER BY updated_at DESC LIMIT ?')
        .all(employeeId, limit);
    }
    return db
      .prepare(
        `SELECT leaves.*, employees.name AS employee_name
         FROM leaves JOIN employees ON employees.id = leaves.employee_id
         ORDER BY leaves.updated_at DESC LIMIT ?`
      )
      .all(limit);
  },
};

module.exports = Leave;
