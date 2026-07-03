# Leave Desk — Employee Leave Management System

A full-stack MVP that lets employees submit and track leave requests, and
lets managers review, approve, or reject them — replacing an email/spreadsheet
workflow with a single, auditable system.

## Project Overview

Built as a practical technical assessment simulating a real internal HR tool.
Employees log in, apply for leave, and track its status. Managers log in to
review pending requests, approve or reject them (with comments), and see
team-wide activity on a dashboard.

## Features

**Authentication**
- Email + password login, JWT-based sessions, role-based access (Employee / Manager)
- Protected routes on both frontend and backend, clean logout, and generic
  (non-leaking) error messages for invalid credentials

**Employee**
- Dashboard with request counts and recent activity
- Apply for leave, edit or cancel while still pending, view full history
- Search and filter leave history by type or status

**Manager**
- Dashboard with team-wide totals and recent activity
- Pending-approvals queue, request detail view, approve/reject with comments
- Search and filter across all employees' requests

**Bonus**
- Role-Based Access Control (route guards on both frontend and backend)
- API rate limiting (general + a stricter limit on login to slow brute-forcing)
- Append-only audit log on every leave request (created/updated/cancelled/approved/rejected, with who and when), visible as an activity timeline on the request detail page
- Docker support for both services via Docker Compose
- Mobile-responsive layout throughout

## Technology Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 19 (Vite) + React Router + Tailwind CSS + Axios | Fast dev loop, small bundle, utility CSS keeps styling consistent |
| Backend | Node.js + Express | Minimal, well-understood REST framework |
| Database | SQLite via Node's built-in `node:sqlite` | Zero external services to install; same relational schema documented in `database/schema.sql` ports directly to Postgres/MySQL |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` for password hashing | Stateless, standard for a REST API |
| Validation | `express-validator` | Declarative, testable input validation with consistent error shape |
| Rate limiting | `express-rate-limit` | Protects against brute-force login attempts and API abuse |
| Containerization | Docker + Docker Compose | One-command startup for both services, no local Node version dependency |

## Folder Structure

```
leave-management-system/
├── backend/
│   ├── src/
│   │   ├── config/db.js            # DB connection + schema bootstrap
│   │   ├── models/                 # Data-access layer (Employee, Leave, AuditLog)
│   │   ├── middleware/             # auth, validation, rate limiting, error handling
│   │   ├── controllers/            # Request handlers
│   │   ├── routes/                 # Express routers
│   │   ├── utils/                  # jwt, logger, seed script
│   │   ├── app.js                  # Express app (middleware + routes)
│   │   └── server.js               # Entry point
│   ├── database/                   # SQLite file lives here at runtime
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/                  # One file per route/page
│   │   ├── components/             # Layout, ProtectedRoute, shared UI
│   │   ├── context/AuthContext.jsx # Global auth/session state
│   │   ├── services/api.js         # Axios instance + error helper
│   │   └── App.jsx                 # Routing
│   ├── Dockerfile
│   ├── nginx.conf                  # Serves the built SPA (with client-side routing support)
│   ├── .env.example
│   └── package.json
├── database/schema.sql             # Documented, portable reference schema
├── docs/API.md                     # Full endpoint reference
├── postman/LeaveManagement.postman_collection.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Installation Steps

### Prerequisites
- **Node.js 22.5+** (the backend uses the built-in `node:sqlite` module — no
  native compilation or separate database server needed)
- npm

### 1. Clone and enter the project
```bash
git clone <your-repo-url>
cd leave-management-system
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env      # defaults work out of the box for local dev
npm install
npm run seed               # creates the DB file and sample users
npm run dev                # starts the API on http://localhost:5000
```

### 3. Frontend setup (in a new terminal)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # starts the app on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### Alternative: run everything with Docker

If you have Docker installed, you can skip steps 2–3 entirely:

```bash
docker compose up --build
```

This builds and starts both services — backend on `http://localhost:5000`,
frontend on `http://localhost:5173` (served via nginx). The SQLite file
persists in a named Docker volume across restarts.

To seed sample data into the running container:
```bash
docker compose exec backend npm run seed
```

To stop everything:
```bash
docker compose down          # keeps the data volume
docker compose down -v       # also wipes the database
```

## Environment Variables

**backend/.env**
| Variable | Description | Default |
|---|---|---|
| `PORT` | API server port | `5000` |
| `NODE_ENV` | Environment name | `development` |
| `DB_PATH` | Path to the SQLite file, relative to `backend/` | `./database/leave_management.db` |
| `JWT_SECRET` | Secret used to sign JWTs — **change in production** | — |
| `JWT_EXPIRES_IN` | Token lifetime | `8h` |
| `CLIENT_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

**frontend/.env**
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

## Database Setup

No separate database server is required. Running the backend automatically
creates the SQLite file at `backend/database/leave_management.db` and applies
the schema (see `backend/src/config/db.js`). The documented, portable version
of that schema — with notes on migrating to PostgreSQL or MySQL — lives at
`database/schema.sql`.

To start fresh, stop the server and delete the `.db*` files in
`backend/database/`, then run `npm run seed` again.

## Running the Application

| Task | Command |
|---|---|
| Run backend (dev, auto-reload) | `cd backend && npm run dev` |
| Run backend (prod) | `cd backend && npm start` |
| Re-seed sample data | `cd backend && npm run seed` |
| Run frontend (dev) | `cd frontend && npm run dev` |
| Build frontend for production | `cd frontend && npm run build` |

## API Documentation

- Full endpoint reference: [`docs/API.md`](docs/API.md)
- Postman collection: [`postman/LeaveManagement.postman_collection.json`](postman/LeaveManagement.postman_collection.json)
  (import it, run "Login as Employee" or "Login as Manager" first — the
  token is captured automatically for every other request)

## Sample Login Credentials

Created by `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Manager | `manager@company.com` | `Password123!` |
| Employee | `alice@company.com` | `Password123!` |
| Employee | `bob@company.com` | `Password123!` |

## Assumptions

- One manager approves all leave requests (no multi-level approval chains) —
  reasonable for an MVP; `employees.manager_id` is already in place to extend
  this later.
- Leave balances/entitlements are out of scope for this MVP; requests are
  tracked by status only, not deducted from an allowance.
- A single organization/tenant is assumed — no multi-company support.
- Dates are simple calendar dates (no half-day or hourly leave).

## Known Limitations

- No password-reset or email-verification flow.
- No email notifications on approval/rejection (listed as a bonus feature).
- JWTs are stateless with no server-side revocation list, so logout is
  client-side only (see the note in `authController.js`).
- No automated test suite yet (see Future Enhancements).

## Future Enhancements

- Multi-level approval workflows and configurable leave policies
- Leave balance tracking and accrual rules
- Email notifications on status changes
- Refresh tokens and a server-side session/denylist for real logout
- Unit + integration tests and CI (GitHub Actions)
- Pagination on list endpoints for large datasets
- A dedicated employee directory page for managers (the API already supports it via `GET /employees`)
