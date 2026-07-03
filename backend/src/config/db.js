/**
 * Database connection and schema bootstrap.
 *
 * We use SQLite via Node's built-in `node:sqlite` module (ships with Node,
 * no native build step required -- ideal for an MVP / assessment). The same
 * schema.sql also lives in /database for reference and would translate
 * directly to Postgres/MySQL with minor type changes (see that file for notes).
 */
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
require('dotenv').config();

const dbPath = path.resolve(__dirname, '..', '..', process.env.DB_PATH || './database/leave_management.db');

// Ensure the folder for the sqlite file exists
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      department    TEXT NOT NULL DEFAULT 'General',
      role          TEXT NOT NULL CHECK (role IN ('EMPLOYEE', 'MANAGER')) DEFAULT 'EMPLOYEE',
      manager_id    INTEGER REFERENCES employees(id) ON DELETE SET NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS leaves (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id      INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      leave_type       TEXT NOT NULL CHECK (leave_type IN ('SICK', 'CASUAL', 'ANNUAL', 'UNPAID', 'OTHER')),
      start_date       TEXT NOT NULL,
      end_date         TEXT NOT NULL,
      reason           TEXT NOT NULL,
      status           TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')) DEFAULT 'PENDING',
      manager_comments TEXT,
      reviewed_by      INTEGER REFERENCES employees(id) ON DELETE SET NULL,
      created_at       TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
      CHECK (date(end_date) >= date(start_date))
    );

    CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON leaves(employee_id);
    CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);
    CREATE INDEX IF NOT EXISTS idx_leaves_type ON leaves(leave_type);
    CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
  `);
}

initSchema();

module.exports = db;
