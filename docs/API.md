# API Documentation — Leave Management System

Base URL (local development): `http://localhost:5000/api`

All request/response bodies are JSON. Authenticated endpoints require:

```
Authorization: Bearer <token>
```

A Postman collection with all requests pre-built (including auth token
handling) is available at `postman/LeaveManagement.postman_collection.json`.

---

## Authentication

### `POST /auth/login`
Log in with email + password and receive a JWT.

**Auth required:** No

**Request body**
```json
{ "email": "alice@company.com", "password": "Password123!" }
```

**Success — 200**
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": 2, "name": "Alice Verma", "email": "alice@company.com",
    "department": "Engineering", "role": "EMPLOYEE",
    "manager_id": 1, "created_at": "...", "updated_at": "..."
  }
}
```

**Errors**
| Status | Reason |
|---|---|
| 401 | Invalid email or password |
| 422 | Missing/malformed email or password |

---

### `POST /auth/logout`
Stateless logout (client discards the token). Included for API-contract completeness.

**Auth required:** Yes → **200** `{ "message": "Logged out successfully." }`

---

### `GET /auth/me`
Returns the current authenticated user (used to restore sessions on page load).

**Auth required:** Yes → **200** `{ "user": { ...same shape as login } }`

---

## Employees

### `GET /employees`
List employees. **Manager only.**

**Query params:** `search`, `department`, `role`

**200** → `{ "employees": [ { "id", "name", "email", "department", "role", "manager_id", "created_at" }, ... ] }`

**Errors:** `403` if caller is not a manager.

---

### `GET /employees/:id`
Fetch one employee. Managers can view anyone; employees can only view themselves.

**200** → `{ "employee": { ... } }`
**Errors:** `403` (viewing someone else as an employee), `404` (not found)

---

### `GET /dashboard`
Role-aware summary used by both dashboards in a single call.

**Manager response — 200**
```json
{
  "totalEmployees": 3,
  "leaveCounts": { "total": 5, "PENDING": 2, "APPROVED": 2, "REJECTED": 1, "CANCELLED": 0 },
  "recentActivity": [ { "...leave fields...", "employee_name": "Bob Kumar" } ]
}
```

**Employee response — 200**
```json
{
  "leaveCounts": { "total": 3, "PENDING": 1, "APPROVED": 1, "REJECTED": 1, "CANCELLED": 0 },
  "recentActivity": [ { "...leave fields..." } ]
}
```

---

## Leave Requests

### `POST /leaves`
Create a new leave request for the authenticated employee.

**Request body**
```json
{
  "leaveType": "CASUAL",
  "startDate": "2026-08-01",
  "endDate": "2026-08-02",
  "reason": "Personal work"
}
```
`leaveType` ∈ `SICK | CASUAL | ANNUAL | UNPAID | OTHER`

**201** → `{ "leave": { "id", "employee_id", "leave_type", "start_date", "end_date", "reason", "status": "PENDING", "manager_comments": null, "reviewed_by": null, "created_at", "updated_at" } }`

**Errors:** `422` validation (bad type, end before start, reason too short/long)

---

### `GET /leaves`
List leave requests. Employees see only their own; managers see everyone's.

**Query params:** `status`, `leaveType`, `search` (matches reason, and employee name for managers), `employeeId` (managers only, to scope to one employee)

**200** → `{ "leaves": [ ... ] }` (manager responses include `employee_name`, `employee_department`)

---

### `GET /leaves/pending`
Manager's approval queue — shortcut for `GET /leaves?status=PENDING` across everyone.

**Auth required:** Manager only → **200** → `{ "leaves": [ ... ] }`

---

### `GET /leaves/:id`
Fetch one leave request, including its audit trail. Owner or any manager may view it.

**200**
```json
{
  "leave": { ... },
  "auditLog": [
    { "id": 1, "leave_id": 3, "actor_id": 2, "actor_name": "Alice Verma", "action": "CREATED", "details": null, "created_at": "..." },
    { "id": 2, "leave_id": 3, "actor_id": 1, "actor_name": "Priya Sharma", "action": "APPROVED", "details": "Get well soon", "created_at": "..." }
  ]
}
```
`action` ∈ `CREATED | UPDATED | CANCELLED | APPROVED | REJECTED`. The audit log is append-only — every status change is recorded automatically and can't be edited or deleted through the API.

**Errors:** `403` (not your request and not a manager), `404`

---

### `PUT /leaves/:id`
Edit a leave request. Employees may only edit their **own** request, and only
while it is `PENDING`. Managers are not expected to use this endpoint (they
review via approve/reject).

**Request body:** same shape as `POST /leaves`

**200** → `{ "leave": { ... updated ... } }`
**Errors:** `403` (not the owner), `409` (already decided), `422` (validation)

---

### `DELETE /leaves/:id`
Cancel your own `PENDING` request (soft — sets `status` to `CANCELLED`, keeps history).

**200** → `{ "leave": { "...", "status": "CANCELLED" } }`
**Errors:** `403`, `409` (not pending), `404`

---

### `PUT /leaves/:id/approve`
**Manager only.** Approves a pending request.

**Request body (optional):** `{ "comments": "Enjoy your trip." }`

**200** → `{ "leave": { "...", "status": "APPROVED", "reviewed_by": <managerId> } }`
**Errors:** `403` (not a manager), `409` (not pending), `404`

---

### `PUT /leaves/:id/reject`
**Manager only.** Rejects a pending request. `comments` is **required** so the
employee knows why.

**Request body:** `{ "comments": "Team is short-staffed that week." }`

**200** → `{ "leave": { "...", "status": "REJECTED", "manager_comments": "...", "reviewed_by": <managerId> } }`
**Errors:** `403`, `409` (not pending), `422` (missing comments), `404`

---

## Standard error shape

```json
{ "error": "Human readable message." }
```

Validation errors additionally include field-level detail:

```json
{
  "error": "Validation failed.",
  "details": [ { "field": "reason", "message": "reason must be between 3 and 500 characters." } ]
}
```

## HTTP status codes used

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Resource created |
| 401 | Missing/invalid/expired token, or bad credentials |
| 403 | Authenticated, but not allowed to perform this action |
| 404 | Resource not found |
| 409 | Conflict with current state (e.g. editing a non-pending request) |
| 422 | Validation failed |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

## Rate limiting

- All `/api/*` routes: **300 requests / 15 minutes** per client.
- `POST /auth/login` specifically: **10 attempts / 15 minutes** per client, to slow down credential-stuffing attempts.

Responses include standard `RateLimit-*` headers. Exceeding a limit returns
`429` with `{ "error": "..." }`.
