PROJECT TITLE:
  TaskFlow – Team Task Management System

SUBMITTED BY:
  M. Kavya

LIVE URL:
  https://glistening-renewal-production-c1ce.up.railway.app/

GITHUB REPOSITORY:
  https://github.com/MaheshwaramKavya/TaskFlow-Project.git

DEPLOYMENT PLATFORM:
  Railway (Backend + Database hosted on Railway)


PROJECT OVERVIEW


TaskFlow is a full-stack Team Task Management web application that enables
teams to collaborate effectively through role-based access control. The system
supports two user roles — Admin and Member — with distinct capabilities for
each role.

Admins can create projects, assign tasks to team members, and monitor overall
progress. Members can view their assigned tasks, complete them using a built-in
Live Code Editor, and track their own progress in real time.


TECH STACK

  Frontend   : React.js
  Backend    : Node.js with Express.js
  Database   : PostgreSQL (hosted on Railway)
  Auth       : JWT (JSON Web Tokens) for secure authentication
  Deployment : Railway


KEY FEATURES


1. AUTHENTICATION
   - User Signup and Login
   - JWT-based secure session management
   - Role-based redirection (Admin/Member dashboards)

2. ROLE-BASED ACCESS CONTROL
   - Admin Role:
       * Create and manage projects
       * Assign tasks to members
       * View all registered users
       * Edit profiles
       * Access AI Chatbot for assistance
   - Member Role:
       * View assigned tasks
       * Use Live Coding Workspace to execute and complete tasks
       * Track task progress in real time
       * Access AI Chatbot for assistance

3. TASK MANAGEMENT
   - Task creation with assignment to specific members
   - Task status tracking (pending, in-progress, completed)
   - Overdue task visibility on dashboard

4. EMAIL NOTIFICATIONS
   - Instant email sent to Member when Admin assigns a task

5. LIVE CODE EDITOR
   - Built-in coding workspace for Members to work on tasks directly

6. AI CHATBOT
   - Available for both Admin and Member roles
   - Helps with clarifications and assistance within the app

7. DASHBOARD
   - Overview of tasks, statuses, and overdue items


DATABASE SCHEMA (PostgreSQL)


  Table: users
    - id         : Serial Primary Key
    - name       : VARCHAR
    - email      : VARCHAR (Unique)
    - password   : VARCHAR (hashed)
    - role       : VARCHAR ('admin' or 'member')

  Table: projects
    - id         : Serial Primary Key
    - title      : VARCHAR
    - description: TEXT
    - created_by : Integer (FK → users.id)

  Table: tasks
    - id          : Serial Primary Key
    - title       : VARCHAR
    - description : TEXT
    - status      : VARCHAR ('pending', 'in-progress', 'completed')
    - assigned_to : Integer (FK → users.id)
    - project_id  : Integer (FK → projects.id)
    - due_date    : DATE


REST API ENDPOINTS


  AUTH
    POST   /api/auth/register       - Register new user
    POST   /api/auth/login          - Login and receive JWT token

  USERS
    GET    /api/users               - Get all users (Admin only)
    PUT    /api/users/:id           - Update user profile

  PROJECTS
    GET    /api/projects            - Get all projects
    POST   /api/projects            - Create new project (Admin only)
    DELETE /api/projects/:id        - Delete project (Admin only)

  TASKS
    GET    /api/tasks               - Get all tasks
    POST   /api/tasks               - Create and assign task (Admin only)
    PUT    /api/tasks/:id           - Update task status
    DELETE /api/tasks/:id           - Delete task (Admin only)


HOW TO RUN LOCALLY

PREREQUISITES:
  - Node.js (v18+)
  - PostgreSQL
  - npm

STEPS:

  1. Clone the repository:
       git clone https://github.com/MaheshwaramKavya/TaskFlow-Project.git
       cd TaskFlow-Project

  2. Install backend dependencies:
       cd backend
       npm install

  3. Set up environment variables:
     Create a .env file in /backend with:
       DATABASE_URL=your_postgresql_connection_string
       JWT_SECRET=your_jwt_secret_key
       EMAIL_USER=your_email@gmail.com
       EMAIL_PASS=your_email_password
       PORT=5000

  4. Run database migrations (if applicable):
       npm run migrate

  5. Start the backend server:
       npm start

  6. Install frontend dependencies:
       cd ../frontend
       npm install

  7. Start the frontend:
       npm start

  8. Open browser at:
       http://localhost:3000


PROJECT STRUCTURE


  TaskFlow-Project/
  ├── frontend/
  │   ├── src/
  │   │   ├── components/        (Reusable UI components)
  │   │   ├── pages/             (Admin & Member pages)
  │   │   ├── context/           (Auth context)
  │   │   └── App.js
  │   └── package.json
  ├── backend/
  │   ├── routes/                (API routes)
  │   ├── controllers/           (Business logic)
  │   ├── models/                (DB models)
  │   ├── middleware/            (JWT auth middleware)
  │   ├── server.js
  │   └── package.json
  └── README.txt


VALIDATIONS & SECURITY

  - JWT token required for all protected routes
  - Role-based middleware restricts Admin-only actions
  - Input validation on all API endpoints
  - Passwords stored as hashed values
  - Email format and field validations on registration


CONTACT
================================================================================

  Name  : M. Kavya
  Email : kavyamaheshwaram1@gmail.com

================================================================================
