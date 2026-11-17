# Event Check-In

Real-time event discovery and attendance tracking built as a full-stack TypeScript application. Authenticated users can discover events, join or leave them, and see live attendee activity. Administrators can manage events and review attendance analytics.

> **Repository:** `dikshaa-012/event-checkin-app`

## Why this project

Event check-in is modeled as two connected workflows:

1. **Persistent attendance:** GraphQL mutations store the attendee relationship and create or close attendance logs in PostgreSQL.
2. **Live presence:** Socket.IO broadcasts room-scoped join/leave activity and the current connected count to everyone viewing the same event.

This separation keeps the database authoritative for attendance history while giving the UI immediate presence updates.

## Features

### Attendees

- Register and sign in with email/password authentication.
- Passwords are hashed with `bcrypt`; sessions use JWTs with a seven-day expiry.
- Browse events with category, name/location search, and date filters.
- View event details, location, date/time, attendee count, and participant initials.
- Join or leave an event.
- See live attendee counts and join/leave notifications through Socket.IO.
- Review upcoming and past joined events.
- Update profile name and email.
- Open public, read-only event pages at `/public/:slug`.

### Administrators

- Role-based access control using `USER` and `ADMIN` roles.
- Create, delete, and close events.
- Review per-event statistics:
  - total attendees
  - completed-session join rate
  - peak concurrent attendance
  - participation percentage
- Inspect attendance logs with join time, leave time, and duration.
- Export current attendees as CSV.
- View attendee and join-activity charts in the admin panel.

## Tech stack

| Area | Technologies |
| --- | --- |
| Web UI | React 19, TypeScript, Vite, React Router 6 |
| Data fetching | Apollo Client, GraphQL |
| Client state | Zustand; TanStack Query is installed for future/server-state use |
| Real-time | Socket.IO client/server |
| API | Node.js, Express, Apollo Server, GraphQL |
| Persistence | PostgreSQL, Prisma ORM |
| Authentication | JWT and bcrypt |
| Visualization/export | Recharts and `csv-writer` |
| Delivery | GitHub Actions CI |

## Architecture

```text
React/Vite browser
  ├─ Apollo Client ── HTTP ──> Express + Apollo GraphQL ──> Prisma ──> PostgreSQL
  └─ Socket.IO client ───────> Socket.IO server ───────────> event rooms
```

### Backend request flow

1. The frontend sends a GraphQL request to `/graphql`.
2. The auth link attaches `Authorization: Bearer <JWT>` when a token exists.
3. The backend verifies the token and resolves the user from the database.
4. Resolvers enforce authentication and admin authorization where required.
5. Prisma reads or updates `User`, `Event`, and `AttendanceLog` records.

### Join flow

1. The user selects **Join this event**.
2. `joinEvent` connects the user to the event and creates an open attendance log if needed.
3. The client emits `join_event` to the Socket.IO event room.
4. The server updates its in-memory room presence list and broadcasts `user_joined` and `live_count`.
5. Other event-detail screens refresh their GraphQL event data and update their live count.

The resolver prevents duplicate event relationships and duplicate open logs for the same user/event. Socket presence also de-duplicates users by ID.

## Project structure

```text
real-time-event-checkin-app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # PostgreSQL data model
│   │   ├── seed.ts             # Development users and sample events
│   │   └── migrations/         # Prisma migrations
│   └── src/
│       ├── server.ts           # Express, Apollo, HTTP server bootstrap
│       ├── context.ts          # JWT extraction and user context
│       ├── socket.ts           # Socket.IO rooms and presence events
│       └── graphql/
│           ├── typeDefs.ts     # GraphQL schema
│           └── resolvers.ts    # Queries, mutations, analytics, CSV export
├── frontend-web/
│   └── src/
│       ├── App.tsx             # Routes and providers
│       ├── graphql/            # Apollo client, queries, mutations
│       ├── store/              # Zustand auth and attendance state
│       ├── screens/            # Login, discovery, detail, admin, profile pages
│       ├── components/         # Shared UI such as event cards and header
│       └── styles/             # Screen and global styles
├── .github/workflows/ci.yml    # Backend and frontend build checks
└── app.json                    # Expo update/runtime metadata retained by the project
```

## Data model

- **User:** identity, unique email, bcrypt password hash, and `USER`/`ADMIN` role.
- **Event:** name, location, start time, optional category, closure state, and many-to-many attendees.
- **AttendanceLog:** one attendance session with `joinedAt`, optional `leftAt`, and a computed duration.

Deleting a user or event cascades to its attendance logs. The event attendee relationship is separate from historical attendance logs, so leaving an event removes the current relationship while preserving the session record.

## GraphQL API

### Queries

| Query | Purpose | Access |
| --- | --- | --- |
| `events(category, search, date)` | Filtered event discovery | Public |
| `event(id)` | Event details and attendees | Public |
| `publicEvent(slug)` | Public event lookup; current slug is the event ID | Public |
| `me` | Current authenticated user | Authenticated |
| `eventStats(eventId)` | Attendance metrics | Admin |
| `attendanceLogs(eventId)` | Session history | Admin |

### Mutations

| Mutation | Purpose | Access |
| --- | --- | --- |
| `login` / `register` | Authenticate or create a user | Public |
| `updateProfile` | Update name/email | Authenticated |
| `joinEvent` / `leaveEvent` | Start/end attendance | Authenticated |
| `createEvent` / `updateEvent` | Manage event details | Admin |
| `deleteEvent` / `closeEvent` | Remove or close registration | Admin |
| `exportAttendees` | Return attendee CSV text | Admin |

### Socket.IO events

| Event | Direction | Purpose |
| --- | --- | --- |
| `join_room` / `leave_room` | Client → server | Subscribe to an event room |
| `join_event` / `leave_event` | Client → server | Announce persisted attendance changes |
| `user_joined` / `user_left` | Server → room | Broadcast participant activity |
| `live_count` | Server → room/client | Broadcast connected count |
| `get_participants` | Client → server | Request current in-memory participants |
| `event_participants` | Server → client | Return the requested participant list |

`joinEvent`/`leaveEvent` and `join_event`/`leave_event` are intentionally separate: GraphQL persists attendance, while Socket.IO updates live presence.

## Local setup

### Prerequisites

- Node.js 20+ (the CI workflow builds with Node 20)
- npm
- PostgreSQL

### 1. Configure the backend

Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/eventdb"
DIRECT_URL="postgresql://postgres:password@localhost:5432/eventdb"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=5000
```

`DIRECT_URL` is used by the Prisma datasource and should point to the same database unless your deployment requires a separate direct connection.

### 2. Install and initialize the backend

```powershell
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

Backend URLs:

- Health check: `http://localhost:5000/`
- GraphQL: `http://localhost:5000/graphql`
- Socket.IO: `http://localhost:5000`

Available backend scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run TypeScript server with respawn |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production server |
| `npm run generate` | Generate Prisma Client |
| `npm run migrate` | Apply committed migrations |
| `npm run seed` | Seed development users/events |
| `npm run studio` | Open Prisma Studio |

### 3. Configure and run the web app

Create `frontend-web/.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

Then run:

```powershell
cd frontend-web
npm install
npm run dev
```

The Vite dev server is normally available at `http://localhost:5173`. The frontend uses `VITE_API_URL` for both GraphQL and Socket.IO; do not include `/graphql` in that value.

Available frontend scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check and create production assets |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint with warnings treated as errors |

### Development preview mode

For a UI-only demo without a running backend, start Vite with:

```powershell
$env:VITE_DEV_PREVIEW="true"
npm run dev
```

Preview mode is enabled only during development and uses local fixtures from `frontend-web/src/preview.ts`. It is not a replacement for the API-backed flow.

### Seed accounts

The seed script creates these development accounts with password `password`:

| Role | Email |
| --- | --- |
| Admin | `admin@example.com` |
| User | `john@example.com` |

Change these credentials before sharing a deployed environment.

## CI and validation

GitHub Actions runs on pushes to `main` and pull requests:

- backend: `npm ci`, Prisma Client generation, `npm run build`
- frontend: `npm ci`, `npm run build`

Local validation:

```powershell
cd backend
npm run build

cd ..\frontend-web
npm run build
npm run lint
```

The current frontend build reports a Vite chunk-size warning for the main JavaScript bundle, but completes successfully. The project does not currently contain an automated unit or integration test suite.

## Production considerations

The current implementation is suitable for a portfolio/demo deployment, but the following should be addressed before production:

- Replace wildcard CORS origins with an allowlist and configure credentials intentionally.
- Use HTTPS and secure, httpOnly cookie-based token storage where appropriate.
- Add rate limiting, structured validation, and centralized error handling.
- Move Socket.IO participant state to a shared store/adapter such as Redis before horizontal scaling; the current list is process-local.
- Add pagination and indexes for large event and attendance datasets.
- Add automated resolver, authorization, real-time, and end-to-end tests.
- Avoid exposing development seed credentials in deployed databases.
- Add observability for database, GraphQL, and WebSocket failures.
- Wire the shared role-aware context into the Apollo HTTP server; the current bootstrap verifies a JWT but only passes the user ID, so admin GraphQL operations need this integration fixed before deployment.
- Enforce `isClosed` in the `joinEvent` resolver as well as the frontend so clients cannot bypass event closure through a direct API request.
- Replace the current demo-friendly behavior that auto-creates a user during `login` when the email is unknown with explicit registration-only account creation.

## Resume-ready summary

**Project description**

> Built a full-stack real-time event check-in platform with React, TypeScript, GraphQL, Prisma, PostgreSQL, and Socket.IO. Implemented JWT/bcrypt authentication, role-based admin workflows, live event-room presence, attendance history, analytics, and CSV export.

**Resume bullets**

- Engineered a TypeScript React/Vite frontend and Node.js GraphQL backend for event discovery, registration, attendance, profiles, and public event sharing.
- Implemented JWT authentication with bcrypt password hashing and `USER`/`ADMIN` authorization across GraphQL resolvers and protected routes.
- Designed a Prisma/PostgreSQL attendance model that separates current event membership from durable join/leave session logs and computed durations.
- Built Socket.IO event rooms that broadcast participant joins, leaves, and live counts, with client-side refreshes and duplicate prevention for concurrent activity.
- Delivered an admin analytics dashboard with total attendance, completion rate, peak concurrency, participation percentage, activity charts, attendance logs, event closure, and CSV export.
- Added GitHub Actions CI to install dependencies, generate Prisma Client, and build both backend and frontend on every pull request.

**Skills to list**

`React` · `TypeScript` · `Vite` · `React Router` · `Apollo Client` · `GraphQL` · `Node.js` · `Express` · `Apollo Server` · `Socket.IO` · `Prisma` · `PostgreSQL` · `JWT` · `bcrypt` · `Zustand` · `Recharts` · `GitHub Actions`

## License

MIT
