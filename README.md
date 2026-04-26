# Runcademic

A web-based multipurpose ticketing and scheduling system for universities.
Students submit service requests, instructors manage assignments, and admins
oversee the workflow — all from a single centralized platform.

## Features

- Role-based access for Students, Instructors, and Admins
- Ticket submission, assignment, and status workflow
- Threaded comments on tickets
- Local auth (email/password) and GitHub OAuth sign-in
- Linear integration for syncing tickets to issues
- Admin dashboard for user and system management

## Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- React Router
- Zustand (state) + Axios (HTTP)
- anime.js, lucide-react

**Backend**
- Node.js + Express
- PostgreSQL (`pg`)
- Passport.js (local + GitHub) with JWT
- Joi for validation, bcrypt for password hashing

## Project Structure

```
runcademic/
├── src/                      # Express API
│   ├── server.js
│   ├── auth/                 # Passport strategies
│   ├── database/             # Postgres setup
│   ├── middleware/
│   └── routes/               # auth, tickets, comments, users, admin, workflow, linear
└── runcademic-frontend/      # Vite + React client
    └── src/
        ├── pages/
        ├── components/
        ├── stores/           # Zustand stores
        ├── services/         # API clients
        └── utils/
```

## Roles

- Student — Submit tickets, track status, view schedules
- Instructor — Triage and resolve assigned tickets, manage schedules
- Admin — Manage users, oversee tickets, configure the system

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Setup

1. Clone the repo
   ```
   git clone https://github.com/yourusername/runcademic.git
   cd runcademic
   ```

2. Install dependencies (backend + frontend)
   ```
   npm install
   cd runcademic-frontend && npm install && cd ..
   ```

3. Configure environment variables
   ```
   cp .env.example .env
   ```
   Fill in database credentials, JWT secret, GitHub OAuth keys, and Linear API
   key as needed.

4. Seed demo users (optional)
   ```
   node src/seed-demo-users.js
   ```

5. Run backend + frontend together
   ```
   npm run dev:all
   ```

   Or separately:
   ```
   npm run dev            # API with file watcher
   npm run dev:frontend   # Vite dev server
   ```

### Demo Credentials

| Role       | Email                       | Password       |
|------------|-----------------------------|----------------|
| Student    | student@runcademic.com      | student123     |
| Instructor | instructor@runcademic.com   | instructor123  |
| Admin      | admin@runcademic.com        | admin123       |

## Scripts

- `npm run dev` — Run API with file watcher
- `npm run dev:frontend` — Run Vite dev server
- `npm run dev:all` — Run both concurrently
- `npm run build` — Build the frontend for production
- `npm start` — Run the API in production mode

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: Render PostgreSQL

## License

MIT
