# Event Check-In Web App

A React + Vite web application for real-time event check-in with WebSocket support.

## Features
- User login/authentication
- View events
- Join events
- Real-time participant updates via Socket.IO
- Responsive design

## Getting Started

### Install Dependencies
```bash
npm install
```

### Development
```bash
npm run dev
```

Runs on `http://localhost:3000` by default.

### Build
```bash
npm run build
```

### Preview
```bash
npm preview
```

## Architecture
- **Frontend**: React 19 + Vite
- **Routing**: React Router v6
- **GraphQL**: Apollo Client
- **Real-time**: Socket.IO Client
- **State Management**: Zustand
- **Styling**: CSS

## Configuration
Update the API URL in `src/graphql/client.ts` and `src/socket.ts` to match your backend.

Default: `http://192.168.29.69:5000`
