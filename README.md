# 🎫 Real-Time Event Check-In App

[![CI](https://github.com/dikshaa-012/event-checkin-app/actions/workflows/ci.yml/badge.svg)](https://github.com/dikshaa-012/event-checkin-app/actions)

A full-stack real-time event check-in application with a modern web frontend and GraphQL backend. Users can browse events, join in real-time, and see live participant updates as others join/leave.

**Frontend:** React 19 + Vite + React Router  
**Backend:** Node.js + Express + GraphQL + Prisma + PostgreSQL  
**Real-time:** Socket.IO with WebSocket support

---

## 🎯 Features

✅ **User Authentication** - Email/password login with JWT tokens & bcrypt hashing  
✅ **Role-Based Access Control** - USER and ADMIN roles with protected routes  
✅ **Event Management** - Full CRUD operations for events (admin only)  
✅ **Real-time Participants** - See who's joined/left instantly via Socket.IO  
✅ **Live Metrics** - Real-time attendee count, join notifications, online indicators  
✅ **Event Categories & Filtering** - Filter by category, search by name, date filtering  
✅ **Attendance Logs** - Track join/leave timestamps and duration calculation  
✅ **Analytics Dashboard** - Total attendees, join rate, peak concurrent users, participation stats  
✅ **CSV Export** - Admin can export attendee lists as CSV  
✅ **Public Event Pages** - Shareable event links without login  
✅ **Event Closure** - Admins can close events to prevent further joins  
✅ **Live Rooms** - WebSocket rooms per event for efficient broadcasting  
✅ **Responsive UI** - Modern web interface with Vite  
✅ **Persistent State** - Zustand for client-side state management  
✅ **Type-Safe** - Full TypeScript across frontend & backend  
✅ **Synchronized Joins** - Handles concurrent joins without race conditions  

---

## 📁 Project Structure

```
real-time-event-checkin-app/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── server.ts       # Apollo Server + HTTP setup
│   │   ├── socket.ts       # Socket.IO real-time logic
│   │   ├── context.ts      # GraphQL context
│   │   └── graphql/
│   │       ├── typeDefs.ts # GraphQL schema
│   │       └── resolvers.ts # Query & mutation resolvers
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
│
├── frontend-web/            # React + Vite web app
│   ├── src/
│   │   ├── screens/        # Page components
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── EventListScreen.tsx
│   │   │   └── EventDetailScreen.tsx
│   │   ├── graphql/        # Apollo Client queries & mutations
│   │   ├── store/          # Zustand state management
│   │   ├── styles/         # CSS styling
│   │   ├── App.tsx         # Main app with React Router
│   │   └── main.tsx        # Entry point
│   ├── vite.config.ts
│   └── package.json
│
└── README.md

```

---

## 🛠️ Tech Stack

### Frontend (frontend-web/)
- **React 19** - UI library
- **Vite** - Build tool & dev server
- **React Router v6** - Client-side routing
- **Apollo Client** - GraphQL client
- **Socket.IO Client** - Real-time WebSocket
- **Zustand** - Lightweight state management
- **TypeScript** - Type safety
- **CSS** - Styling with modern gradients

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Apollo Server** - GraphQL server
- **Socket.IO** - WebSocket server
- **Prisma** - ORM & database toolkit
- **PostgreSQL** - Database
- **JWT** - Token-based authentication
- **TypeScript** - Type safety

---

## ⚙️ CI/CD Pipeline

This project uses **GitHub Actions** for Continuous Integration (CI).

On every push to the `main` branch, the pipeline automatically:

- Installs dependencies
- Generates the Prisma client
- Builds the TypeScript project
- Validates compilation to prevent broken deployments

This ensures code stability, automated validation, and production-ready build verification before deployment.

The CI status badge at the top of this README reflects the current build health.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm
- PostgreSQL running locally
- Git

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env  # or create .env with DATABASE_URL and JWT_SECRET

# Run migrations
npm run migrate

# Seed database (optional)
npm run prisma:seed

# Start dev server
npm run dev
```

Backend runs on `http://localhost:5000`  
GraphQL endpoint: `http://localhost:5000/graphql`

### Frontend Setup

```bash
cd frontend-web

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## 📋 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/eventdb"
JWT_SECRET="your-secret-key-here"
```

---

## 🔄 How It Works

### User Flow
1. **Login** → GraphQL mutation creates/fetches user, returns JWT token
2. **Browse Events** → Apollo Client queries event list
3. **View Details** → Navigate to event, listen for socket changes
4. **Join Event** → GraphQL mutation + Socket.IO emission
5. **Real-time Updates** → Socket.IO broadcasts user_joined/user_left

### Socket.IO Events
- **`joinEvent`** - User joins event room (sends user data)
- **`leaveRoom`** - User leaves event room
- **`user_joined`** - Broadcast when user joins (received by room)
- **`user_left`** - Broadcast when user leaves (received by room)
- **`get_participants`** - Request current participant list
- **`event_participants`** - Receive all participants (handles race conditions)

### Race Condition Handling
If 2 users join simultaneously:
1. Both emit `joinEvent` → added to backend tracking
2. Both emit `get_participants` → receive full list from backend
3. Both receive broadcasts of each other joining
4. UI deduplicates to show correct count

---

## 📚 API Reference

### GraphQL Mutations

**Login**
```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user { id name }
  }
}
```

**Join Event**
```graphql
mutation JoinEvent($eventId: ID!) {
  joinEvent(eventId: $eventId) {
    id name attendees { id name }
  }
}
```

### GraphQL Queries

**Get Events**
```graphql
query GetEvents {
  events {
    id name location startTime attendees { id name }
  }
}
```

**Get Current User**
```graphql
query GetMe {
  me { id name email }
}
```

---

## 🧪 Testing

### Manual Testing
1. Login with any email (auto-creates user)
2. Open app in 2 browser windows (same user or different)
3. Both join same event → should see both participants in real-time
4. One leaves → other sees removal immediately

### Socket.IO Testing
- Browser DevTools → Network tab → WS
- Can see `joinEvent`, `user_joined`, `get_participants` messages in real-time

---

## 🌐 Deployment

### Frontend (Vite)
```bash
npm run build    # Creates optimized dist/
npm run preview  # Test production build locally
```

Deploy `dist/` folder to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Backend
```bash
npm run build    # Compile TypeScript to dist/
npm start        # Run production server
```

Deploy to:
- Heroku
- AWS EC2
- DigitalOcean
- Railway
- Render

---

## 🔒 Security Notes

⚠️ **Development Configuration:**
- CORS allows all origins (`*`)
- Cleartext HTTP enabled for Android
- JWT validation on header

**For Production:**
- Set specific CORS origins
- Use HTTPS only
- Environment-specific config
- Rate limiting
- Input validation
- Secure token storage

---

## 📝 Database Schema

model User {
  id             String          @id @default(cuid())
  name           String
  email          String          @unique
  password       String?
  role           Role            @default(USER)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  events         Event[]         @relation("EventAttendees")
  attendanceLogs AttendanceLog[]
}

model Event {
  id             String          @id @default(cuid())
  name           String
  location       String
  startTime      DateTime
  category       String?
  isClosed       Boolean         @default(false)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  attendees      User[]          @relation("EventAttendees")
  attendanceLogs AttendanceLog[]
}

model AttendanceLog {
  id        String   @id @default(cuid())
  userId    String
  eventId   String
  joinedAt  DateTime @default(now())
  leftAt    DateTime?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
}

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't connect to backend | Check IP address, ensure backend running on port 5000 |
| Invalid date displayed | Backend sending null/invalid startTime, check DB |
| Participants not updating | Verify Socket.IO connected, check Network tab |
| User appears before join | Fixed - socket.emit moved to handleJoin |
| Module not found | Run `npm install` in respective directory |

---

## 📈 Scalability Considerations

This application is designed with scalability in mind for production deployment:

### Horizontal Scaling
- **Stateless API**: All backend services are stateless, enabling easy horizontal scaling via load balancers
- **WebSocket Room Isolation**: Socket.IO rooms per event prevent cross-event interference and allow room-based scaling
- **Database Indexing**: Optimized queries with proper indexing on `eventId`, `userId`, and timestamps

### Performance Optimizations
- **Connection Pooling**: Prisma handles database connection pooling automatically
- **GraphQL Batching**: Apollo Server supports query batching and caching
- **Real-time Efficiency**: WebSocket events are scoped to event rooms, reducing unnecessary broadcasts

### Monitoring & Analytics
- **Live Metrics**: Built-in real-time analytics for attendee tracking
- **Attendance Logs**: Comprehensive logging for business intelligence
- **Error Handling**: Proper error boundaries and logging for production monitoring

### Production Deployment
- **Rate Limiting**: Ready for implementation of request rate limiting
- **Caching Layer**: Can integrate Redis for session and query caching
- **CDN Support**: Static assets can be served via CDN for global distribution

### Database Considerations
- **Read Replicas**: PostgreSQL read replicas can be added for analytics queries
- **Partitioning**: Event data can be partitioned by date for large-scale deployments
- **Backup Strategy**: Automated backups with point-in-time recovery

---

## �📄 License

MIT - Feel free to use and modify

---

## 🤝 Contributing

1. Create feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open Pull Request

---

## 📞 Support

For issues or questions:
- Check the Troubleshooting section
- Review Socket.IO events in browser DevTools
- Check backend console for errors
- Verify database connection & migrations

Happy coding! 🎉
