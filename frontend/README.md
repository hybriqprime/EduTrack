# EduTrack — Frontend

React/Vite + Tailwind v4. Three dashboards: Admin, Teacher, Parent.

## Setup

1. `cd frontend`
2. `npm install`
   - If you hit the SSL cipher error again: `npm config set strict-ssl false`,
     reinstall, then set it back to `true` after.
3. Make sure the **backend is running on port 5000** first (`npm run dev`
   in the backend folder) — the dev server proxies `/api` calls straight
   to `http://localhost:5000` (see `vite.config.js`).
4. `npm run dev` — opens on the Vite default port (usually 5173)

## Login and you'll land on

- `admin@demoschool.com` → `/admin` — fee defaulters dashboard + full
  student list
- `teacher@demoschool.com` → `/teacher` — class results ranked by average,
  with a "Download PDF" button per student (this is the standout feature
  to demo)
- `parent1@demoschool.com` or `parent2@demoschool.com` → `/parent` — only
  shows their own linked child's results and fees (good to point out:
  proprietors care about this data isolation)

All demo passwords: `password123`

## Structure

```
src/
  api/client.js          — axios instance, attaches JWT automatically
  context/AuthContext.jsx — login state, persisted to localStorage
  routes/ProtectedRoute.jsx — role-based route guarding
  components/            — DashboardLayout, StatCard, StatusBadge
  pages/
    Login.jsx
    admin/AdminDashboard.jsx
    teacher/TeacherDashboard.jsx
    parent/ParentDashboard.jsx
```

## Notes

- Tailwind v4 is set up via `@tailwindcss/vite` plugin — no
  `tailwind.config.js` or `postcss.config.js` needed, it's wired directly
  in `vite.config.js`.
- Teacher and admin dashboards are currently hardcoded to `JSS 1`,
  `Second Term`, `2025/2026` to match the seed data. Swap these for
  dropdowns once you're past the demo stage and have real multi-class data.
- No student/result/fee creation forms yet — this demo reads seeded data.
  Add create/edit forms once a proprietor says yes and you're onboarding
  real students.
