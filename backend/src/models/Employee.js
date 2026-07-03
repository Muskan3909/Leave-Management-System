const db = require('../config/db');

/**
 * Data-access layer for the `employees` table.
 * Keeping raw SQL isolated here means controllers never touch SQL directly,
 * which keeps the query surface auditable and easy to swap for an ORM later.
 */
const Employee = {
  create({ name, email, passwordHash, department, role, managerId = null }) {
    const stmt = db.prepare(`
      INSERT INTO employees (name, email, password_hash, department, role, manager_id)
      VALUES (:name, :email, :passwordHash, :department, :role, :managerId)
    `);
    const info = stmt.run({ name, email, passwordHash, department, role, managerId });
    return Employee.findById(info.lastInsertRowid);
  },

  findById(id) {
    return db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
  },

  findByEmail(email) {
    return db.prepare('SELECT * FROM employees WHERE email = ?').get(email);
  },

  findAll({ search, department, role } = {}) {
    let query = 'SELECT id, name, email, department, role, manager_id, created_at FROM employees WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    query += ' ORDER BY name ASC';

    return db.prepare(query).all(...params);
  },

  countAll() {
    return db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
  },

  toSafeObject(employee) {
    if (!employee) return null;
    const { password_hash, ...safe } = employee;
    return safe;
  },
};

module.exports = Employee;
