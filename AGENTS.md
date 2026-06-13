# AGENTS.md

## Repository Overview

`weather_starter` is a split frontend/backend weather app starter:

- `frontend/` is a React 18 app built with Vite and styled with Tailwind CSS.
- `backend/` is an Express + TypeScript API that stores location snapshots in SQLite via Drizzle ORM.
- The root package wires the two halves together with shared dev/build/test scripts and small utility scripts in `scripts/`.

The app is centered on Singapore weather data from `api-open.data.gov.sg`. The backend owns the external API calls, persistence, and validation. The frontend talks to `/api/*` only and keeps UI state in a React context store.

## High-Level Architecture

- `scripts/dev.mjs` starts the backend through `portless` so the app is available on a stable local `.localhost` URL.
- `backend/src/server.ts` creates the Express app, exposes `/health`, `/api/logs`, and mounts the locations router.
- `backend/src/routes/locations.ts` handles the weather/location API surface: list, create, refresh, and delete.
- `backend/src/db.ts` owns the SQLite connection, migration startup, and the CRUD helpers for locations.
- `backend/src/schema.ts` defines the Drizzle table shape and the JSON columns used for weather snapshots.
- `frontend/src/state/store.tsx` is the main UI state hub for loading locations, selection, add/remove, and refresh actions.
- `frontend/src/api.ts` is the browser API client for the backend endpoints.
- `frontend/src/components/` contains the visual UI pieces that compose the dashboard.

### Data Flow

1. The frontend loads locations from `/api/locations`.
2. Creating or refreshing a location triggers the backend to fetch the latest weather snapshot.
3. The backend stores the snapshot in SQLite and returns the updated record.
4. The frontend re-loads the location list and updates selection state.

## Common Commands

Run these from the repository root unless noted otherwise.

```bash
npm install
```

Install dependencies for the root workspace and both packages.

```bash
npm run dev
```

Start the app in development mode. This launches the backend through Portless and Vite middleware in a single Node process.

```bash
npm run build
```

Build the frontend workspace and compile the backend TypeScript output.

```bash
npm run start
```

Run the compiled production server from `backend/dist/server.js`.

```bash
npm test
```

Run the root Vitest suite. The current tests live under `backend/src/routes/`.

```bash
npm run test:watch
```

Run Vitest in watch mode.

```bash
npm run doctor
```

Check that the service is healthy by hitting `/health` and `/api/locations`.

```bash
npm run reset
```

Delete the local SQLite database and WAL/SHM files.

```bash
npm run db:generate
```

Generate Drizzle migrations after changing the schema.

```bash
npm run db:migrate
```

Apply Drizzle migrations to the local database.

### Package-Level Commands

```bash
npm run build -w frontend
```

Build only the frontend workspace.

```bash
npm run build -w backend
```

Compile only the backend workspace.

```bash
npm run dev -w frontend
```

Run the frontend Vite dev server directly on `127.0.0.1`.

```bash
npm run dev -w backend
```

Run the backend in watch mode with `tsx`.

## Key Files

- [`package.json`](./package.json) defines the workspace scripts and shared tooling.
- [`backend/package.json`](./backend/package.json) contains backend-only scripts.
- [`frontend/package.json`](./frontend/package.json) contains frontend-only scripts.
- [`backend/src/server.ts`](./backend/src/server.ts) is the backend entry point.
- [`backend/src/routes/locations.ts`](./backend/src/routes/locations.ts) defines the API endpoints.
- [`backend/src/db.ts`](./backend/src/db.ts) contains the database layer and migration startup.
- [`backend/src/schema.ts`](./backend/src/schema.ts) defines the persisted schema.
- [`frontend/src/App.tsx`](./frontend/src/App.tsx) mounts the app shell.
- [`frontend/src/state/store.tsx`](./frontend/src/state/store.tsx) owns client state and API orchestration.
- [`frontend/src/api.ts`](./frontend/src/api.ts) is the frontend request layer.

## Working Conventions

- Prefer updating the backend router and database helpers together when changing API behavior.
- Keep frontend components focused on rendering and user interaction; put request orchestration in `frontend/src/state/store.tsx`.
- The frontend uses relative `/api` calls, so avoid hard-coding backend ports in browser code.
- SQLite lives at `backend/weather.db` by default; use `npm run reset` if you need a clean slate.
- Drizzle migrations are committed in `backend/drizzle/`; update the schema first, then generate migrations.

## Tests And Verification

- Use `npm test` for fast API regression checks.
- Use `npm run build` before shipping backend or schema changes to catch TypeScript issues.
- Use `npm run doctor` after local startup changes to verify the server still responds correctly.
- If you change the frontend UI, run `npm run dev` and verify the behavior in the browser.

## Environment Notes

- `WEATHER_API_KEY` is optional and can be exported locally if needed.
- `DATABASE_PATH` can override the default SQLite file location.
- `PORTLESS_HTTPS=1` enables HTTPS in the Portless dev flow if a feature needs secure context.
