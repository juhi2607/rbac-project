# ProTrack — Role-Based Access Control (RBAC) Project Management System

A full-stack web application demonstrating Role-Based Access Control (RBAC) built as a Project Management System. Three distinct roles (Admin, Manager, User) each have clearly defined permissions across the entire application.

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | https://your-app.vercel.app *(update after deploy)* |
| Backend API | https://your-api.onrender.com *(update after deploy)* |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| UI Library | Material UI (MUI) v5 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JWT (JSON Web Tokens) |
| Password Hashing | bcryptjs (salt rounds: 12) |
| Input Validation | express-validator |
| Security | Helmet, CORS, Rate Limiting |
| Containerization | Docker + Docker Compose |

---

## Features

### Core
- JWT-based login/logout with token persistence
- Role-Based Access Control — 3 distinct roles with different permissions
- Protected routes on both frontend (Next.js) and backend (Express middleware)
- Full CRUD for Projects, Tasks, and Users
- Proper API design with consistent JSON responses
- Global error handling and input validation on all endpoints

### Bonus
- Audit logs — every create/update/delete action is tracked
- Pagination — 10 records per page on all list views
- Search and filter — by title, status, priority, role
- Dockerized — runs with single `docker-compose up` command
- Responsive UI — works on mobile and desktop
- Database seeder — instant test data setup

---

## Role Permissions

| Feature | Admin | Manager | User |
|---|:---:|:---:|:---:|
| Create / Edit / Delete Users | ✅ | ❌ | ❌ |
| Create / Edit / Delete Projects | ✅ | ❌ | ❌ |
| View All Projects | ✅ | Own only | Own only |
| Assign Project Manager | ✅ | ❌ | ❌ |
| Create / Edit / Delete Tasks | ✅ | ✅ | ❌ |
| Assign Tasks to Users | ✅ | ✅ | ❌ |
| Update Task Status | ✅ | ✅ | Assigned only |
| View Audit Logs | ✅ | ❌ | ❌ |

---

## Project Structure

```
rbac-project/
├── client/                         # Next.js Frontend
│   ├── app/                        # Pages (App Router)
│   │   ├── login/                  # Login page
│   │   ├── dashboard/              # Role-based dashboard
│   │   ├── projects/               # Projects list + detail
│   │   ├── tasks/                  # Tasks list
│   │   ├── users/                  # User management (Admin only)
│   │   ├── profile/                # Profile & password change
│   │   ├── audit-logs/             # Audit logs (Admin only)
│   │   └── 403/                    # Access denied page
│   ├── components/
│   │   ├── layout/                 # AppLayout, Navbar, Sidebar, ProtectedRoute
│   │   ├── forms/                  # ProjectForm, TaskForm, UserForm
│   │   └── ui/                     # StatCard, StatusChip, ConfirmDialog, etc.
│   ├── context/                    # AuthContext (JWT + user state)
│   ├── services/                   # Axios API service layer
│   ├── types/                      # TypeScript interfaces
│   └── utils/                      # MUI theme, date helpers
│
├── server/                         # Express.js Backend
│   ├── controllers/                # Business logic
│   ├── middleware/                 # auth, role, error, validation
│   ├── models/                     # User, Project, Task, AuditLog
│   ├── routes/                     # REST API routes
│   ├── validators/                 # express-validator rules
│   ├── utils/                      # token, audit logger, seeder
│   ├── config/                     # MongoDB connection
│   └── server.js                   # Entry point
│
├── docker-compose.yml
└── README.md
```

---

## Setup and Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- npm

### 1. Clone the Repository

```bash
git clone https://github.com/juhi2607/rbac-project.git
cd rbac-project
```

### 2. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure Environment Variables

```bash
# Backend
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/rbac_project?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_minimum_32_chars
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

```bash
# Frontend
cd client
cp .env.local.example .env.local
```

Edit `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Seed the Database

```bash
cd server
npm run seed
```

This creates 4 users, 3 projects, and 8 tasks.

### 5. Run the Application

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm run dev

# Terminal 2 — Frontend (port 3000)
cd client
npm run dev
```

Visit: **http://localhost:3000**

---

## Default Test Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | admin@protrack.com | Admin123 | Full access |
| **Manager** | manager@protrack.com | Manager123 | Projects + Tasks |
| **User** | user@protrack.com | User1234 | Assigned tasks only |

> These credentials are also available as clickable chips on the login page for quick access.

---

## API Endpoints

### Authentication
```
POST   /api/auth/register        Public
POST   /api/auth/login           Public
GET    /api/auth/profile         Private
PUT    /api/auth/profile         Private
```

### Users
```
GET    /api/users                Admin
GET    /api/users/managers       Admin, Manager
POST   /api/users                Admin
PUT    /api/users/:id            Admin
DELETE /api/users/:id            Admin
```

### Projects
```
GET    /api/projects             Private (role-filtered)
GET    /api/projects/stats       Private (role-filtered)
GET    /api/projects/:id         Private (access-checked)
POST   /api/projects             Admin
PUT    /api/projects/:id         Admin
DELETE /api/projects/:id         Admin
```

### Tasks
```
GET    /api/tasks                Private (role-filtered)
GET    /api/tasks/:id            Private
POST   /api/tasks                Admin, Manager
PUT    /api/tasks/:id            Admin, Manager
PATCH  /api/tasks/:id/status     All roles (User: assigned only)
DELETE /api/tasks/:id            Admin, Manager
```

### Audit Logs
```
GET    /api/audit-logs           Admin
```

---

## Docker Deployment

```bash
# Create root .env
cp .env.example .env
# Fill MONGO_URI and JWT_SECRET

# Build and run everything
docker-compose up --build
```

---

## Assumptions and Design Decisions

1. **Admin creates all projects** — Only admins can create or delete projects. This keeps project ownership clear. Managers are assigned to projects by admins.

2. **Manager visibility is scoped** — Managers only see projects where they are the assigned manager or a listed member. This prevents data leakage between teams.

3. **User visibility is task-only** — Regular users only see tasks directly assigned to them and projects they are members of. They cannot browse all projects.

4. **Inline status update** — Task status can be updated directly from the table row via a dropdown, without opening a full edit modal. This improves UX for the most common user action.

5. **Audit log TTL** — Logs auto-expire after 90 days using MongoDB's TTL index to prevent unbounded collection growth.

6. **Seeder resets data** — Running `npm run seed` clears all existing data before inserting fresh test data. Intended for development/demo use only.

7. **JWT stored in localStorage** — For simplicity in this assessment context. In a production system, httpOnly cookies would be preferred to prevent XSS.

8. **Password validation** — Minimum 6 characters and must contain at least one number, enforced on both frontend (React Hook Form) and backend (express-validator).

---

## Security Practices

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens expire in 7 days
- Rate limiting: 100 requests per 15 minutes per IP
- HTTP security headers via Helmet
- CORS restricted to frontend origin only
- Input validation on every endpoint
- Role enforcement at middleware level (not just frontend)
- Environment variables never committed to git
