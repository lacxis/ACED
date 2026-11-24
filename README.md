# ACED Attendance

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/lacxis/ACED)


Workforce attendance for **ACED Business Solutions Consulting** — office, work-from-home and client-site, recorded accurately for every working day.

Stack: **React 18 + TypeScript + Vite**, **Firebase** (Auth + Realtime Database), deployed to **Netlify**. Privileged operations run in **Netlify Functions**.

## Working arrangement (configurable)
- Mon / Tue / Thu — office · Wed / Fri — work from home
- Hours 08:00–17:00, lateness threshold 08:20, timezone **Africa/Lagos**
- Occasional client-site work is first-class. No overtime scheduling.

## Run it locally
```bash
npm install
npm run dev        # http://localhost:5173
```
With no Firebase config, the app runs in **demo mode** on sample data — any email signs you in. Try `g.adeyemi@aced.com` (admin) or `a.nwosu@aced.com` (manager).

## Go live
1. Create a Firebase project; enable Email/Password auth and Realtime Database.
2. Import `migrated.json` (from the migration script) and publish `database.rules.json`.
3. Copy `.env.example` to `.env`, fill in the Firebase web config, set `VITE_FIREBASE_ENABLED=true`.

## Project layout
```
src/
  domain/      pure business logic — time (Lagos), schedule, attendance status, permissions (unit-tested)
  firebase/    config + data layer
  context/     auth
  components/  UI primitives (design system in code)
  layouts/     app shell
  features/    auth, dashboard, … (one folder per area)
  types/       shared types
  data/        sample data for demo mode
netlify/functions/   privileged server operations (role changes, leave approval, audit)
```

## Scripts
`npm run dev` · `npm run build` · `npm run typecheck` · `npm test`

## Status
Scaffold: login, employee dashboard, routing, shell, domain layer + tests. Remaining screens stubbed and built next.
