# Runcademic

A web-based multipurpose ticketing and scheduling system for universities.
Manages service requests, appointments, and task assignments through a 
single centralized platform.

## Tech Stack

**Frontend:** React + Vite + Tailwind CSS  
**Backend:** Node.js + Express  
**Database:** PostgreSQL  
**Auth:** JWT + Passport.js  

## Roles

- 🎓 Student — Submit tickets, view schedules
- 👨‍🏫 Instructor — Manage assigned tickets, create schedules
- ⚙️ Admin — Full system management, reports, user management

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Setup

1. Clone the repo
   git clone https://github.com/yourusername/runcademic.git

2. Install backend dependencies
   cd runcademic
   npm install

3. Install frontend dependencies
   cd runcademic-frontend
   npm install

4. Set up environment variables
   cp .env.example .env
   Fill in your database credentials in .env

5. Run the project
   npm run dev:all

### Demo Credentials
- Student: student@runcademic.com / student123
- Instructor: instructor@runcademic.com / instructor123
- Admin: admin@runcademic.com / admin123

## Deployment
- Frontend: Vercel
- Backend: Render
- Database: Render PostgreSQL
