# Event Check-In Web App

React/Vite frontend for the real-time event check-in platform. See the [root README](../README.md) for the complete architecture, API, backend setup, and resume-ready project summary.

## Local development

```bash
npm install
npm run dev
```

Create `.env.local` before starting the dev server:

```env
VITE_API_URL=http://localhost:5000
```

The value is used for both Apollo GraphQL requests (`/graphql`) and Socket.IO connections. The Vite dev server normally runs at `http://localhost:5173`.

## Scripts

```bash
npm run build    # Type-check and create production assets
npm run preview  # Serve the production build locally
npm run lint     # Run ESLint
```

## Frontend architecture

- **React 19 + TypeScript:** screen and component UI
- **React Router:** login, event discovery, detail, profile, admin, and public routes
- **Apollo Client:** GraphQL queries/mutations with JWT headers
- **Socket.IO Client:** live event-room counts and join/leave notifications
- **Zustand:** authenticated user, token, joined events, and attendee counts
- **Vite:** development server and production bundling

For a backend-free UI walkthrough during development, set `VITE_DEV_PREVIEW=true`. This uses local fixtures from `src/preview.ts`.
