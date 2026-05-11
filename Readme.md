# Real-Time Chat Application

A premium full-stack real-time chat application inspired by Slack/Discord. Built with React 18, TypeScript, Node.js, Express.js, Socket.io, MongoDB, Redis, and Docker.

## Tech Stack

**Frontend:** React 18, TypeScript, Tailwind CSS, Vite, Socket.io-client, Emoji-mart  
**Backend:** Node.js, Express.js, Socket.io, MongoDB + Mongoose, Redis (ioredis), JWT, Multer  
**Infrastructure:** Docker, Docker Compose  

## Features

- JWT Authentication (Register / Login)
- One-to-one Direct Messages
- Group Chat Rooms (multi-member)
- Real-time messaging via WebSocket (Socket.io)
- Typing indicators with animated dots
- Read receipts (sent → delivered → seen checkmarks)
- Online/offline presence tracking with Redis
- File & image sharing (click image to open lightbox)
- Emoji picker (emoji-mart)
- Message history paginated from MongoDB
- Redis cache for recent messages per room (last 50)
- Dark modern UI — dark sidebar (#1A1A2E), chat area (#16213E), electric blue accents
- Mobile-responsive layout

## Project Structure

```
Real-Time Chat APP/
├── backend/
│   ├── src/
│   │   ├── config/         # MongoDB & Redis connections
│   │   ├── middleware/     # JWT auth middleware
│   │   ├── models/         # User, Room, Message schemas
│   │   ├── routes/         # Auth, Rooms, Upload routes
│   │   ├── controllers/    # Business logic
│   │   ├── socket/         # Socket.io event handler
│   │   └── server.js       # Entry point
│   ├── uploads/            # Uploaded files
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/       # Login, Register
│   │   │   ├── Chat/       # ChatArea, MessageBubble, MessageInput, TypingIndicator
│   │   │   ├── Sidebar/    # Sidebar, RoomItem, Avatar
│   │   │   └── Modals/     # CreateRoomModal
│   │   ├── context/        # AuthContext, SocketContext
│   │   ├── pages/          # ChatPage
│   │   ├── services/       # api.ts (axios)
│   │   └── types/          # TypeScript interfaces
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
└── docker-compose.yml
```

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Redis (local or Redis Cloud free tier)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Redis URL
npm install
npm run dev
```

**Backend `.env`:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:5173
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

### 3. Docker (Full Stack)

```bash
# From the root directory
docker compose up --build
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:5000

## Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `message:send` | Client → Server | Send a message |
| `message:receive` | Server → Client | Receive a message |
| `typing:start` | Client → Server | User started typing |
| `typing:stop` | Client → Server | User stopped typing |
| `user:online` | Server → Client | User came online |
| `user:offline` | Server → Client | User went offline |
| `room:join` | Client → Server | Join a room |
| `read:confirm` | Client → Server | Mark messages as read |

## REST API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/users/search?q=` | Search users |

### Rooms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rooms` | Get user's rooms |
| POST | `/api/rooms` | Create room (DM or group) |
| GET | `/api/rooms/:id` | Get room details |
| GET | `/api/rooms/:id/messages` | Get paginated messages |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload file/image (max 10MB) |