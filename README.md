# ⚡ TaskFlow — Team Task Manager

A full-stack, production-ready team task manager with **role-based access control**, real-time task tracking, and a clean responsive UI.

---

## 🚀 Features

- **Secure Auth** — Signup/Login with bcrypt-hashed passwords + JWT tokens
- **Role-Based Access Control** — Admin and Member roles with enforced permissions
- **Project Management** — Create, edit, delete projects; assign members; color-code
- **Task Management** — Full CRUD with title, description, status, priority, due date, assignee
- **Dashboard** — Live stats, progress bars, overdue highlighting
- **Responsive UI** — Clean, modern interface built with React

---

## 🛠 Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | React 18, Axios, React Router v6        |
| Backend     | Node.js, Express 4                      |
| Database    | PostgreSQL                              |
| Auth        | JWT + bcryptjs                          |
| Deployment  | Railway                                 |

---

## 📁 Project Structure

```
taskflow/
├── frontend/               # React app
│   ├── public/
│   └── src/
│       ├── api/            # Axios API client
│       ├── components/     # Shared UI components, AuthContext, Sidebar
│       └── pages/          # Dashboard, Tasks, Projects, Users, Auth
├── backend/                # Express REST API
│   ├── controllers/        # Business logic
│   ├── middleware/         # JWT auth, role guard
│   ├── models/             # DB connection + schema
│   └── routes/             # Route definitions
└── docs/                   # Schema diagrams, API docs
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone the repo
```bash
git clone https://github.com/yourname/taskflow.git
cd taskflow
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# Edit .env with your database URL and JWT secret
npm install
node server.js
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm start
```

The app will open at `http://localhost:3000`. The backend runs on port `5000`.

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint         | Description         |
|--------|------------------|---------------------|
| POST   | /api/auth/signup | Register new user   |
| POST   | /api/auth/login  | Login, receive JWT  |
| GET    | /api/auth/me     | Get current user    |

### Projects (Admin only for write)
| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| GET    | /api/projects      | List projects      |
| POST   | /api/projects      | Create project     |
| PUT    | /api/projects/:id  | Update project     |
| DELETE | /api/projects/:id  | Delete project     |

### Tasks
| Method | Endpoint        | Description             |
|--------|-----------------|-------------------------|
| GET    | /api/tasks      | List tasks (filtered)   |
| POST   | /api/tasks      | Create task (Admin)     |
| PUT    | /api/tasks/:id  | Update task             |
| DELETE | /api/tasks/:id  | Delete task (Admin)     |

### Users
| Method | Endpoint    | Description  |
|--------|-------------|--------------|
| GET    | /api/users  | List users   |

---

## 🚂 Deploy on Railway

### Backend
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select the `/backend` folder (or set root directory to `backend`)
3. Add a **PostgreSQL** plugin in Railway — it auto-injects `DATABASE_URL`
4. Add environment variables:
   ```
   JWT_SECRET=your_secret_here
   NODE_ENV=production
   ```
5. Railway auto-deploys on push.

### Frontend
1. New Service → GitHub → select `/frontend`
2. Add env variable: `REACT_APP_API_URL=https://your-backend.railway.app`
3. Update `frontend/src/api/index.js` baseURL to use `process.env.REACT_APP_API_URL`
4. Deploy — Railway builds with `npm run build` automatically.

---

## 🗃 Database Schema

```sql
users           → id, name, email, password_hash, role, created_at
projects        → id, name, description, color, owner_id, created_at
project_members → project_id, user_id  (many-to-many)
tasks           → id, title, description, status, priority, due_date,
                  project_id, assignee_id, created_by, created_at, updated_at
```

---

## 🎯 Role Permissions

| Action                  | Admin | Member       |
|-------------------------|-------|--------------|
| View all projects       | ✅    | Own only     |
| Create/Edit/Delete project | ✅ | ❌           |
| View all tasks          | ✅    | Assigned only|
| Create/Delete task      | ✅    | ❌           |
| Update task status      | ✅    | Own tasks ✅ |
| View all users          | ✅    | ✅           |

---

## 📄 License

MIT
