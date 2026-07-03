/**
 * Seeds the database with a manager and a few employees, plus some sample
 * leave requests, so the app is immediately explorable after setup.
 * Run with: npm run seed
 */
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const logger = require('./logger');

async function seed() {
  const existing = Employee.countAll();
  if (existing > 0) {
    logger.info('Database already has data — skipping seed. Delete the .db file to reseed.');
    return;
  }

  const password = await bcrypt.hash('Password123!', 10);

  const manager = Employee.create({
    name: 'Priya Sharma',
    email: 'manager@company.com',
    passwordHash: password,
    department: 'Engineering',
    role: 'MANAGER',
  });

  const alice = Employee.create({
    name: 'Alice Verma',
    email: 'alice@company.com',
    passwordHash: password,
    department: 'Engineering',
    role: 'EMPLOYEE',
    managerId: manager.id,
  });

  const bob = Employee.create({
    name: 'Bob Kumar',
    email: 'bob@company.com',
    passwordHash: password,
    department: 'Design',
    role: 'EMPLOYEE',
    managerId: manager.id,
  });

  Leave.create({
    employeeId: alice.id,
    leaveType: 'ANNUAL',
    startDate: '2026-07-10',
    endDate: '2026-07-14',
    reason: 'Family trip',
  });

  const bobLeave = Leave.create({
    employeeId: bob.id,
    leaveType: 'SICK',
    startDate: '2026-06-20',
    endDate: '2026-06-21',
    reason: 'Fever and rest',
  });
  Leave.update(bobLeave.id, { status: 'APPROVED', manager_comments: 'Get well soon.', reviewed_by: manager.id });

  logger.info('Seed complete. Sample logins:');
  logger.info('  Manager  -> manager@company.com / Password123!');
  logger.info('  Employee -> alice@company.com   / Password123!');
  logger.info('  Employee -> bob@company.com     / Password123!');
}

seed().then(() => process.exit(0));
