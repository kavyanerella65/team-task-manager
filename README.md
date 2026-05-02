# Team Task Manager

A full-stack web application for managing team projects and tasks with role-based access control.

## 🔗 Live Demo

- **Frontend:** https://your-app.vercel.app
- **Backend API:** team-task-manager-production-64b7.up.railway.app

## ✨ Features

- **Authentication** — Signup/Login with JWT, password hashing via bcryptjs
- **Role-Based Access Control** — Admins manage projects & tasks; Members update task status only
- **Project Management** — Create projects, add/remove members, view all projects
- **Task Management** — Create tasks, assign to members, set due dates, track status
- **Dashboard** — Real-time stats: total, completed, pending, and overdue tasks
- **Overdue Detection** — Automatically flags tasks past their due date

## 🛠 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, React Router v6, Axios  |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB Atlas (Mongoose ODM)      |
| Auth       | JWT + bcryptjs                    |
| Deployment | Vercel (frontend), Railway (backend) |

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── models/               # User, Project, Task schemas
│   │   ├── middleware/           # auth.js, role.js
│   │   ├── controllers/          # Business logic
│   │   ├── routes/               # API routes
│   │   └── server.js             # Entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/axios.js          # Axios instance
    │   ├── context/AuthContext   # Auth state
    │   ├── components/           # Navbar, TaskList, TaskCard, PrivateRoute
    │   ├── pages/                # Login, Signup, Dashboard, Projects, ProjectPage
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)

### 1. Clone the repo
```bash
git clone https://github.com/kavyanerella65/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev

```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev

```

## 🌍 API Endpoints

### Auth
| Method | Endpoint         | Access  | Description       |
|--------|-----------------|---------|-------------------|
| POST   | /api/auth/signup | Public  | Register user     |
| POST   | /api/auth/login  | Public  | Login user        |
| GET    | /api/auth/me     | Private | Get current user  |

### Projects
| Method | Endpoint                           | Access | Description         |
|--------|-----------------------------------|--------|---------------------|
| GET    | /api/projects                     | Private | List projects       |
| POST   | /api/projects                     | Admin  | Create project      |
| GET    | /api/projects/:id                 | Private | Get project         |
| POST   | /api/projects/:id/members         | Admin  | Add member          |
| DELETE | /api/projects/:id/members/:userId | Admin  | Remove member       |
| DELETE | /api/projects/:id                 | Admin  | Delete project      |

### Tasks
| Method | Endpoint                    | Access  | Description          |
|--------|-----------------------------|---------|----------------------|
| GET    | /api/tasks/project/:id      | Private | Get project tasks    |
| POST   | /api/tasks                  | Admin   | Create task          |
| PATCH  | /api/tasks/:id/status       | Private | Update status        |
| PUT    | /api/tasks/:id              | Admin   | Full task update     |
| DELETE | /api/tasks/:id              | Admin   | Delete task          |

### Dashboard
| Method | Endpoint       | Access  | Description        |
|--------|---------------|---------|-------------------|
| GET    | /api/dashboard | Private | Get stats          |

## 🚀 Deployment

See `DEPLOYMENT.md` for step-by-step Railway + Vercel deployment.

## 🔐 Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-app.vercel.app
```

### Frontend (.env)
```
VITE_API_URL=team-task-manager-production-64b7.up.railway.app
```

## 📄 License
MIT
