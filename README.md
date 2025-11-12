GetSetRide

GetSetRide is a full-stack car rental / marketplace application built with a Vite + React frontend and an Express backend. The project provides a responsive marketplace UI, user authentication, booking flows, host/car management, and a seeded sample dataset for development.

## Repository layout

- `package.json` — Root project scripts & dependencies
- `vite.config.js` — Vite config for frontend dev server / build
- `tailwind.config.js` — TailwindCSS config
- `postcss.config.js` — PostCSS config

Frontend
- `src/` — React app source
  - `src/main.jsx` — app bootstrap + ReactDOM
  - `src/App.jsx` — main app component and routing
  - `src/index.css` — global styles
  - `src/components/` — shared UI components
  - `src/pages/` — page components (Home, Marketplace, Login, Car detail, Host flows, etc.)

Public assets
- `public/` — static assets served by Vite

Backend
- `backend/` — Express API and data layer
  - `backend/package.json` — backend scripts & deps
  - `backend/.env` — environment variables (not committed)
  - `backend/src/app.js` — Express app setup (routes, middleware)
  - `backend/src/server.js` — server bootstrap (listen)
  - `backend/src/config/database.js` — DB connection logic
  - `backend/src/controllers/` — route controllers (auth, cars, bookings)
  - `backend/src/middleware/auth.js` — auth middleware
  - `backend/scripts/seedCars.js` — seed script to populate sample cars

## High-level architecture

- Frontend: React + Vite. The UI is component-driven with pages under `src/pages/`. The app is bootstrapped in `src/main.jsx` and routed via `src/App.jsx`.
- Backend: Node + Express application with routes and controllers under `backend/src/`. The app is created in `backend/src/app.js` and started from `backend/src/server.js`.
- Data & seeding: Use `backend/scripts/seedCars.js` to populate sample cars for development.
- Deployment: Backend contains `backend/vercel.json` (if present) for Vercel deployment; the frontend builds with Vite.

## Getting started (development)

1. Install dependencies

- Root (frontend)

```sh
# from project root
npm install
```

- Backend

```sh
cd backend
npm install
```

2. Configure environment variables

- Create `backend/.env` with required variables (DB connection string, JWT secret, etc.). See `backend/src/config/database.js` and `backend/src/middleware/auth.js` for keys used by the server.

3. Seed sample data (optional)

```sh
# from project root or backend/
node backend/scripts/seedCars.js
```

4. Run in development

- Frontend (Vite)

```sh
npm run dev
```

- Backend

```sh
cd backend
npm run dev
# or `npm start` depending on backend scripts
```

Run both servers concurrently to allow the frontend to call backend API endpoints.

## Useful files & entry points

- Frontend entry: `src/main.jsx`, `src/App.jsx`
- Backend entry: `backend/src/app.js`, `backend/src/server.js`
- DB config: `backend/src/config/database.js`
- Seed script: `backend/scripts/seedCars.js`
- Backend controllers: `backend/src/controllers/` (auth, car, booking)
- Auth middleware: `backend/src/middleware/auth.js`

## Tests

- No test suite detected in the repository. If tests are added, run them via scripts defined in `package.json` or `backend/package.json`.

## Deployment

- Frontend: build with Vite (`npm run build`) and deploy the generated static assets to your hosting platform.
- Backend: follow the `backend` deploy configuration (for example `backend/vercel.json`) or deploy the Express app to your chosen Node host.

## Troubleshooting

- Check backend logs printed by `backend/src/server.js` and ensure the DB is reachable.
- Verify environment variables in `backend/.env` (DB URL, JWT secret) are set correctly.
- Inspect controllers for route definitions and payload expectations in `backend/src/controllers/`.

---

If you want, I can update the README with exact npm scripts, environment variable names, or add a CONTRIBUTING section and license file.