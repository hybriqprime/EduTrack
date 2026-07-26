# EduTrack — Backend

School management system: results, fees, and student records in one place.

## Setup

1. `cd backend`
2. `npm install`
   - If you hit the SSL cipher error again on your machine:
     `npm config set strict-ssl false`
     Then re-run `npm install`, and set it back to `true` afterward.
3. Copy `.env.example` to `.env` and fill in:
   - `MONGO_URI` — use the **non-SRV** connection string format if you hit
     `querySrv ECONNREFUSED` again, e.g.:
     `mongodb://<user>:<password>@ac-xxxxx-shard-00-00.mongodb.net:27017,ac-xxxxx-shard-00-01.mongodb.net:27017,ac-xxxxx-shard-00-02.mongodb.net:27017/schooldb?ssl=true&replicaSet=atlas-xxxxx&authSource=admin&retryWrites=true&w=majority`
     (Grab the exact non-SRV string from Atlas: Connect → Drivers → "Add
     legacy connection string" or drop the current SRV string here and I'll
     convert it.)
   - `JWT_SECRET` — any long random string
4. `npm run seed` — populates demo data (2 students with parents, 2 without,
   results, and fee records with one clear defaulter for the dashboard demo)
5. `npm run dev` — starts the server on port 5000 (requires nodemon,
   included in devDependencies)

## Demo login credentials (after seeding)

| Role    | Email                     | Password    |
|---------|---------------------------|-------------|
| Admin   | admin@demoschool.com      | password123 |
| Teacher | teacher@demoschool.com    | password123 |
| Parent  | parent1@demoschool.com    | password123 |
| Parent  | parent2@demoschool.com    | password123 |

## What to show in the pitch

1. **Login as admin** → dashboard shows fee defaulters at a glance
   (Kunle Ogundipe = ₦0 paid, Ifeoma Eze = partial payment)
2. **Login as teacher** → input/view JSS 1 results, see auto-computed averages
3. **Generate a PDF result sheet** — `GET /api/results/:id/pdf` — this is the
   single most convincing feature for proprietors doing this by hand at
   term end
4. **Login as a parent** → shows only their own child's result and fee
   status, nothing else (data isolation matters to schools — reassures them
   on privacy)

## API quick reference

- `POST /api/auth/login` — get JWT token
- `GET /api/fees/defaulters?term=Second Term&session=2025/2026` — admin only
- `GET /api/results/class/JSS 1?term=Second Term&session=2025/2026` — ranked
  results with position
- `GET /api/results/:id/pdf` — printable result sheet

## Not built yet (by design — this is a lean demo)

- Attendance tracking
- Timetabling
- In-app messaging
- Real payment collection (Paystack) — fee tracking is currently manual
  entry by admin only
- Multi-school / multi-tenant support (this demo is single-school)

Add these once a proprietor is actually paying, not before.
