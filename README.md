# EduTrack

A school management system built for small-to-mid private schools in Nigeria — replacing the Excel-and-paper workflow most proprietors still rely on with role-based dashboards for admins, teachers, parents, and students.

**Live demo:** _add your deployed link here once hosted_

## What it does

- **Admin** — manages students, staff/parent accounts, class timetable, attendance, and exam schedules; sees fee defaulters at a glance instead of digging through spreadsheets
- **Teacher** — enters and views results ranked by class average, generates printable PDF result sheets
- **Parent** — views their own child's results, fees, and attendance — nothing else (data isolation by design)
- **Student** — their own timetable, exam schedule, results, fee status, and attendance record

## Tech stack

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT authentication, PDFKit for result sheets
**Frontend:** React, Vite, Tailwind CSS v4, React Router, Axios

## Project structure

EduTrack/
├── backend/ — Express API, MongoDB models, JWT auth
└── frontend/ — React dashboards (Admin, Teacher, Parent, Student)

Each folder has its own README with detailed setup instructions:
- [`backend/README.md`](./backend/README.md)
- [`frontend/README.md`](./frontend/README.md)

## Quick start

1. **Backend** — `cd backend`, install, set up `.env` (Mongo URI + JWT secret), seed the database, then run:
```bash
   npm install
   npm run seed
   npm run dev
```
2. **Frontend** — in a separate terminal, `cd frontend`:
```bash
   npm install
   npm run dev
```
3. Open the frontend URL and log in with any of the seeded demo accounts (see `backend/README.md` for the full list).

## Demo login credentials

| Role    | Email                     | Password    |
|---------|---------------------------|-------------|
| Admin   | admin@demoschool.com      | password123 |
| Teacher | teacher@demoschool.com    | password123 |
| Parent  | parent1@demoschool.com    | password123 |
| Student | student1@demoschool.com   | password123 |

## Status

This is an active MVP — built to demonstrate the concept to school proprietors and gather feedback before a production rollout. Account creation is admin-controlled (no open self-signup), matching how schools actually onboard staff and students.

## Author

Built by [Ibrahim Isiaq Alabi](https://github.com/hybriqprime) — Hybriq Prime Nig. Ltd.
Contact: hybriqprime@gmail.com