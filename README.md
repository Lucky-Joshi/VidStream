# VidChat

A lightweight 2-person VidChat application with real-time video calling, audio calling, and screen sharing. Built for pair programming and coding interview preparation.

No authentication. No database. No chat. Just instant peer-to-peer connection.

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | React 18, Vite, CSS3, Socket.IO Client      |
| WebRTC     | Simple Peer                                 |
| Backend    | Node.js, Express, Socket.IO                 |
| Deployment | Frontend → Vercel, Backend → Render         |

## Features

- **Video Calling** — Enable/disable camera with real-time toggle
- **Audio Calling** — Mute/unmute microphone with echo cancellation
- **Screen Sharing** — Share your screen for code walkthroughs
- **Auto-Connect** — Automatically joins the fixed study room
- **Connection Recovery** — Reconnects on network interruption
- **Permission Handling** — Friendly error messages for denied permissions
- **Room Guard** — Prevents third users from joining
- **Responsive Design** — Desktop, tablet, and mobile support
- **Dark Theme** — Eye-friendly design optimized for long study sessions

## Folder Structure

```
vidchat/
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ConnectionStatus.jsx
│   │   │   ├── ControlBar.jsx
│   │   │   ├── PermissionPrompt.jsx
│   │   │   ├── RoomFull.jsx
│   │   │   └── VideoGrid.jsx
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useCall.js       # Orchestrates all hooks
│   │   │   ├── useMedia.js      # Camera, mic, screen share
│   │   │   ├── usePeer.js       # WebRTC peer connection
│   │   │   └── useSocket.js     # Socket.IO connection
│   │   ├── pages/               # Page-level components
│   │   │   └── CallPage.jsx
│   │   ├── services/            # External service layer
│   │   │   └── socket.js
│   │   ├── styles/              # Global CSS
│   │   │   └── index.css
│   │   ├── utils/               # Constants and config
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── config/              # Server configuration
│   │   │   └── index.js
│   │   ├── controllers/         # HTTP route handlers
│   │   │   └── health.js
│   │   ├── socket/              # Socket.IO signaling
│   │   │   └── handler.js
│   │   └── index.js             # Server entry point
│   ├── .env
│   ├── .env.example
│   └── package.json
├── docs/                        # Documentation
│   ├── PRD.md
│   ├── TRD.md
│   ├── DESIGN.md
│   ├── APP_FLOW.md
│   └── USER_FLOW.md
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+
- npm 9+

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The server starts on `http://localhost:3001`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

### Testing Locally

Open `http://localhost:5173` in **two separate browser windows** (or tabs) to simulate two users connecting.

## How It Works

1. **Open the app** — Camera and microphone permissions are requested
2. **Auto-join** — Automatically connects to the fixed room (`vidchat-room`)
3. **Wait** — Shows a waiting screen until the second user joins
4. **Connect** — WebRTC peer connection is established via Socket.IO signaling
5. **Study** — Video and audio streams flow directly peer-to-peer
6. **Share** — Use the control bar to share your screen
7. **Leave** — Click leave to end the session

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Default                 | Description                    |
|----------------|-------------------------|--------------------------------|
| `PORT`         | `3001`                  | Server port                    |
| `CORS_ORIGIN`  | `http://localhost:5173` | Allowed CORS origins (comma-separated) |

### Frontend (`frontend/.env`)

| Variable           | Default                 | Description          |
|--------------------|-------------------------|----------------------|
| `VITE_SOCKET_URL`  | `http://localhost:3001` | Backend Socket.IO URL |

## Deployment

### Backend → Render

1. Create a **Web Service** on [Render](https://render.com)
2. Connect your repository
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
4. Add environment variable:
   ```
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

### Frontend → Vercel

1. Import your project on [Vercel](https://vercel.com)
2. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
3. Add environment variable:
   ```
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```

## Architecture

```
User A (Browser)                    User B (Browser)
     │                                    │
     ├── getUserMedia()                   ├── getUserMedia()
     │                                    │
     ├── Socket.IO ────────┐    ┌──────── Socket.IO
     │                     ▼    ▼              │
     │              ┌─────────────────┐        │
     │              │  Signal Server  │        │
     │              │  (Express +     │        │
     │              │   Socket.IO)    │        │
     │              └─────────────────┘        │
     │                                         │
     └── WebRTC (Peer-to-Peer) ───────────────┘
         Video / Audio / Screen Share
```

## WebRTC Configuration

| Setting         | Value                            |
|-----------------|----------------------------------|
| STUN Server 1   | `stun:stun.l.google.com:19302`   |
| STUN Server 2   | `stun:stun1.l.google.com:19302`  |
| Trickle ICE     | Enabled                          |
| Room ID         | `vidchat-room` (fixed)           |
| Max Users       | 2                                |

## License

MIT
