const Leave = require('../models/Leave');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/** Small guard shared by update/cancel: only the owner or a manager may act, and only while PENDING for edits. */
function assertOwnerOrManager(leave, user) {
  if (!leave) {
    const err = new Error('Leave request not found.');
    err.status = 404;
    throw err;
  }
  if (user.role !== 'MANAGER' && leave.employee_id !== user.id) {
    const err = new Error('You do not have access to this leave request.');
    err.status = 403;
    throw err;
  }
}

/**
 * POST /api/leaves — Employee creates a new leave request.
 */
function createLeave(req, res) {
  const { leaveType, startDate, endDate, reason } = req.body;

  const leave = Leave.create({
    employeeId: req.user.id,
    leaveType,
    startDate,
    endDate,
    reason,
  });

  AuditLog.record({ leaveId: leave.id, actorId: req.user.id, action: 'CREATED' });
  logger.info('Leave request created', { leaveId: leave.id, employeeId: req.user.id });
  res.status(201).json({ leave });
}

/**
 * GET /api/leaves
 * Employees see only their own requests; managers see everyone's, and can
 * filter by employeeId. Supports ?status=&leaveType=&search=
 */
function listLeaves(req, res) {
  const { status, leaveType, search, employeeId } = req.query;

  if (req.user.role === 'MANAGER') {
    const leaves = Leave.findAll({ status, leaveType, search, employeeId });
    return res.json({ leaves });
  }

  const leaves = Leave.findByEmployee(req.user.id, { status, leaveType, search });
  res.json({ leaves });
}

/** GET /api/leaves/pending — Manager-only shortcut for the approvals queue. */
function listPending(req, res) {
  res.json({ leaves: Leave.findPending() });
}

/** GET /api/leaves/:id */
function getLeave(req, res) {
  const leave = Leave.findById(Number(req.params.id));
  assertOwnerOrManager(leave, req.user);
  const auditLog = AuditLog.findByLeave(leave.id);
  res.json({ leave, auditLog });
}

/**
 * PUT /api/leaves/:id
 * Employee edits their own PENDING request. Once a request has been
 * decided (approved/rejected), it becomes immutable to the requester.
 */
function updateLeave(req, res) {
  const id = Number(req.params.id);
  const leave = Leave.findById(id);
  assertOwnerOrManager(leave, req.user);

  if (req.user.role !== 'MANAGER') {
    if (leave.employee_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own leave requests.' });
    }
    if (leave.status !== 'PENDING') {
      return res.status(409).json({ error: 'Only pending requests can be edited.' });
    }
  }

  const { leaveType, startDate, endDate, reason } = req.body;
  const updated = Leave.update(id, {
    leave_type: leaveType,
    start_date: startDate,
    end_date: endDate,
    reason,
  });

  AuditLog.record({ leaveId: id, actorId: req.user.id, action: 'UPDATED' });
  res.json({ leave: updated });
}

/** DELETE /api/leaves/:id — Employee cancels their own PENDING request. */
function cancelLeave(req, res) {
  const id = Number(req.params.id);
  const leave = Leave.findById(id);
  assertOwnerOrManager(leave, req.user);

  if (leave.employee_id !== req.user.id && req.user.role !== 'MANAGER') {
    return res.status(403).json({ error: 'You can only cancel your own leave requests.' });
  }
  if (leave.status !== 'PENDING') {
    return res.status(409).json({ error: 'Only pending requests can be cancelled.' });
  }

  const updated = Leave.update(id, { status: 'CANCELLED' });
  AuditLog.record({ leaveId: id, actorId: req.user.id, action: 'CANCELLED' });
  res.json({ leave: updated });
}

/** PUT /api/leaves/:id/approve — Manager-only. */
function approveLeave(req, res) {
  const id = Number(req.params.id);
  const leave = Leave.findById(id);
  if (!leave) return res.status(404).json({ error: 'Leave request not found.' });
  if (leave.status !== 'PENDING') {
    return res.status(409).json({ error: 'Only pending requests can be approved.' });
  }

  const updated = Leave.update(id, {
    status: 'APPROVED',
    manager_comments: req.body.comments || null,
    reviewed_by: req.user.id,
  });

  AuditLog.record({ leaveId: id, actorId: req.user.id, action: 'APPROVED', details: req.body.comments || null });
  logger.info('Leave approved', { leaveId: id, managerId: req.user.id });
  res.json({ leave: updated });
}

/** PUT /api/leaves/:id/reject — Manager-only. Comments are required so employees know why. */
function rejectLeave(req, res) {
  const id = Number(req.params.id);
  const leave = Leave.findById(id);
  if (!leave) return res.status(404).json({ error: 'Leave request not found.' });
  if (leave.status !== 'PENDING') {
    return res.status(409).json({ error: 'Only pending requests can be rejected.' });
  }

  const updated = Leave.update(id, {
    status: 'REJECTED',
    manager_comments: req.body.comments,
    reviewed_by: req.user.id,
  });

  AuditLog.record({ leaveId: id, actorId: req.user.id, action: 'REJECTED', details: req.body.comments });
  logger.info('Leave rejected', { leaveId: id, managerId: req.user.id });
  res.json({ leave: updated });
}

module.exports = {
  createLeave,
  listLeaves,
  listPending,
  getLeave,
  updateLeave,
  cancelLeave,
  approveLeave,
  rejectLeave,
};
