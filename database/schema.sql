-- Employee Leave Management System — Database Schema
--
-- This is the canonical, documented version of the schema the app creates
-- automatically at startup (see backend/src/config/db.js). It is written in
-- SQLite dialect (what the running app uses), with notes on the small
-- changes needed to run it on PostgreSQL or MySQL instead.
--
-- Design notes
-- ------------
-- * Normalized to 3NF: employee attributes live only on `employees`,
--   leave-request attributes live only on `leaves`; nothing is duplicated.
-- * `employees.manager_id` is a self-referencing foreign key, modeling the
--   reporting line without a separate table.
-- * `leaves.employee_id` and `leaves.reviewed_by` both reference
--   `employees.id`; the latter records which manager actioned the request.
-- * CHECK constraints enforce valid enum-like values (role, leave_type,
--   status) and that end_date is never before start_date, at the DB layer
--   -- not just in application code.
-- * Indexes are added on the columns used for filtering/searching in the
--   API (employee_id, status, leave_type, email) since those are the
--   lookups the manager dashboard and search/filter features rely on.

CREATE TABLE employees (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,                 -- bcrypt hash, never plaintext
  department    TEXT NOT NULL DEFAULT 'General',
  role          TEXT NOT NULL CHECK (role IN ('EMPLOYEE', 'MANAGER')) DEFAULT 'EMPLOYEE',
  manager_id    INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE leaves (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id      INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type       TEXT NOT NULL CHECK (leave_type IN ('SICK', 'CASUAL', 'ANNUAL', 'UNPAID', 'OTHER')),
  start_date       TEXT NOT NULL,               -- ISO 8601 date (YYYY-MM-DD)
  end_date         TEXT NOT NULL,
  reason           TEXT NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')) DEFAULT 'PENDING',
  manager_comments TEXT,
  reviewed_by      INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (date(end_date) >= date(start_date))
);

CREATE INDEX idx_leaves_employee_id ON leaves(employee_id);
CREATE INDEX idx_leaves_status      ON leaves(status);
CREATE INDEX idx_leaves_type        ON leaves(leave_type);
CREATE INDEX idx_employees_email    ON employees(email);

-- ---------------------------------------------------------------------
-- Porting to PostgreSQL:
--   * INTEGER PRIMARY KEY AUTOINCREMENT -> SERIAL PRIMARY KEY / GENERATED ALWAYS AS IDENTITY
--   * TEXT timestamps -> TIMESTAMPTZ NOT NULL DEFAULT now()
--   * TEXT dates -> DATE
--   * CHECK (... IN (...)) can optionally become a native ENUM type
--
-- Porting to MySQL:
--   * INTEGER PRIMARY KEY AUTOINCREMENT -> INT PRIMARY KEY AUTO_INCREMENT
--   * TEXT timestamps -> DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
--   * TEXT dates -> DATE
--   * CHECK constraints are enforced from MySQL 8.0.16+; ENUM types are a
--     native alternative
-- ---------------------------------------------------------------------
