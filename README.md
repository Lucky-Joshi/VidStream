# VidChat

A lightweight 2-person video calling application built for pair programming, coding interviews, and remote collaboration. Features real-time video calling, audio communication, and screen sharing with a focus on simplicity and reliability.

**No authentication. No database. No chat. Just instant peer-to-peer connection.**

---

## 🎯 Quick Overview

**What it is:** A real-time video conferencing application for exactly 2 users
**How it works:** Peer-to-peer WebRTC connections with Socket.IO signaling
**Use cases:** Pair programming, coding interviews, screen sharing sessions
**Deployment:** Frontend on Vercel, Backend on Render

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [API & Events](#-api--events)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Development](#-development)
- [License](#-license)

---

## ✨ Features

### Core Communication
- **Video Calling** — Enable/disable camera with real-time toggle
- **Audio Calling** — Mute/unmute microphone with echo cancellation
- **Screen Sharing** — Share your entire screen for code walkthroughs and demos

### Smart Room Management
- **Auto-Connect** — Automatically joins the fixed study room (`vidchat-room`)
- **Room Guard** — Prevents third users from joining (max 2 users enforced)
- **Waiting Status** — Clear waiting screen while partner joins
- **Room Full Indicator** — Friendly message when room is at capacity

### Reliability & Recovery
- **Connection Recovery** — Auto-reconnects on network interruption
- **Trickle ICE** — Enables faster peer connection establishment
- **Health Check** — Backend health monitoring for deployment verification
- **Graceful Cleanup** — Proper room cleanup on user disconnect

### User Experience
- **Permission Handling** — Friendly error messages for denied permissions
- **Media State Sync** — Remote user sees your camera/mic status in real-time
- **Responsive Design** — Desktop, tablet, and mobile support
- **Dark Theme** — Eye-friendly dark interface optimized for long coding sessions
- **Error Boundary** — Graceful error handling with reload option

---

## 🛠️ Tech Stack

| Layer      | Technology                                  | Version |
|------------|---------------------------------------------|---------|
| **Frontend** | React 18, Vite, CSS3, Socket.IO Client      | 18.3.1  |
| **WebRTC** | Simple Peer (WebRTC abstraction)           | 9.11.1  |
| **Backend** | Node.js, Express, Socket.IO                | LTS     |
| **Build** | Vite                                        | 6.0.3   |
| **Deployment** | Frontend → Vercel, Backend → Render         | —       |

### Key Dependencies

**Backend (`backend/package.json`):**
- `express` ^4.21.1 — Web server framework
- `socket.io` ^4.8.1 — Real-time bidirectional communication
- `cors` ^2.8.5 — Cross-Origin Resource Sharing middleware

**Frontend (`frontend/package.json`):**
- `react` ^18.3.1 — UI library
- `react-dom` ^18.3.1 — React DOM renderer
- `socket.io-client` ^4.8.1 — WebSocket client
- `simple-peer` ^9.11.1 — WebRTC wrapper
- `vite` ^6.0.3 — Build tool
- `@vitejs/plugin-react` ^4.3.4 — React plugin for Vite

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **npm** 9 or higher
- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)

### 1️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

The server starts on `http://localhost:3001`.

**Available commands:**
- `npm run dev` — Start server with file watching (development)
- `npm start` — Start server (production)

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

**Available commands:**
- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — Build for production
- `npm run preview` — Preview production build locally

### 3️⃣ Testing Locally

Open **two separate browser windows** (or tabs) at `http://localhost:5173`:
- Tab 1: You will see "Waiting for partner..."
- Tab 2: Both users connect and see each other
- Use controls to enable/disable camera, mute/unmute audio, or share screen

---

## 📁 Project Structure

```
VidChat/
├── README.md                       # This file
├── .gitignore                      # Git ignore rules
│
├── frontend/                       # React client application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ConnectionStatus.jsx
│   │   │   ├── ControlBar.jsx      # Video/audio/share controls
│   │   │   ├── PermissionPrompt.jsx
│   │   │   ├── RoomFull.jsx        # Max users reached message
│   │   │   └── VideoGrid.jsx       # Video display grid
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useCall.js          # Main orchestrator hook
│   │   │   ├── useMedia.js         # Camera, mic, screen share logic
│   │   │   ├── usePeer.js          # WebRTC peer connection
│   │   │   └── useSocket.js        # Socket.IO connection management
│   │   ├── pages/
│   │   │   └── CallPage.jsx        # Main call interface
│   │   ├── services/
│   │   │   └── socket.js           # Socket.IO singleton
│   │   ├── styles/
│   │   │   └── index.css           # Global styles (dark theme)
│   │   ├── utils/
│   │   │   └── constants.js        # App constants and config
│   │   ├── App.jsx                 # Root component with error boundary
│   │   └── main.jsx                # App entry point
│   ├── index.html                  # HTML template
│   ├── vite.config.js              # Vite configuration
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── backend/                        # Node.js/Express server
│   ├── src/
│   │   ├── index.js                # Server entry point
│   │   ├── config/
│   │   │   └── index.js            # Configuration management
│   │   ├── controllers/
│   │   │   └── health.js           # Health check endpoint
│   │   └── socket/
│   │       └── handler.js          # Socket.IO event handlers
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── docs/                           # Documentation
    ├── PRD.md                      # Product Requirements Document
    ├── TRD.md                      # Technical Requirements Document
    ├── DESIGN.md                   # UI/UX Design details
    ├── APP_FLOW.md                 # Application flow diagram
    └── USER_FLOW.md                # User interaction flow
```

---

## 🏗️ Architecture

### High-Level Diagram

```
┌─────────────────────────┐                ┌─────────────────────────┐
│   User A (Browser)      │                │   User B (Browser)      │
├─────────────────────────┤                ├─────────────────────────┤
│  React App              │                │  React App              │
│  ├─ CallPage           │                │  ├─ CallPage           │
│  ├─ useCall Hook       │                │  ├─ useCall Hook       │
│  ├─ useMedia Hook      │                │  ├─ useMedia Hook      │
│  └─ usePeer Hook       │                │  └─ usePeer Hook       │
└────────┬────────────────┘                └────────┬────────────────┘
         │ Socket.IO                                │ Socket.IO
         │ (Signaling)                              │ (Signaling)
         └─────────────────────────┬────────────────┘
                                   │
                        ┌──────────▼──────────┐
                        │  Signal Server      │
                        │  (Express + SIO)    │
                        │  Port: 3001         │
                        │  Handlers:          │
                        │  ├─ join-room      │
                        │  ├─ offer          │
                        │  ├─ answer         │
                        │  ├─ ice-candidate  │
                        │  ├─ media-state    │
                        │  └─ leave-room     │
                        └────────────────────┘
         ┌──────────────────────────┴──────────────────────────┐
         │                                                      │
    ┌────▼─────┐                                          ┌────▼─────┐
    │  WebRTC   │◄─────────────────────────────────────────│  WebRTC   │
    │ Peer Conn │  Offer/Answer/ICE Candidates           │ Peer Conn │
    │           │         (SDP Signaling)                │           │
    │  Stream   │                                         │  Stream   │
    │  Flow     │                                         │  Flow     │
    └───────────┘                                         └───────────┘
         │                                                     │
         └──────────────────────────┬──────────────────────────┘
                                    │
              P2P Video/Audio/Screen (Direct Connection)
```

### Data Flow

**Connection Establishment:**
1. User A opens app → `useSocket` connects to signaling server
2. User A emits `join-room` → Server adds to room
3. User B opens app → `useSocket` connects to signaling server
4. User B emits `join-room` → Server detects room has 1 user
5. Server emits `ready` to both users with `shouldCreateOffer` flag
6. User A (offer creator) generates SDP offer via Simple Peer
7. User A sends offer via Socket.IO to User B
8. User B receives offer → generates SDP answer
9. User B sends answer back to User A
10. Both exchange ICE candidates for NAT traversal
11. WebRTC connection established → media streams flow P2P

**Media State Sync:**
- When User A disables camera → emits `media-state` with type='video', enabled=false
- Server broadcasts to room → User B receives and updates UI accordingly

---

## 📡 API & Events

### Socket.IO Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{}` | Join the fixed video room |
| `offer` | `{ to, offer }` | Send WebRTC offer to peer |
| `answer` | `{ to, answer }` | Send WebRTC answer to peer |
| `ice-candidate` | `{ to, candidate }` | Send ICE candidate to peer |
| `media-state` | `{ type, enabled }` | Broadcast media state (video/audio) |
| `leave-room` | `{}` | Explicitly leave the room |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `waiting-for-partner` | `{}` | Waiting for second user to join |
| `user-joined` | `{ peerId }` | Second user joined, start offer |
| `ready` | `{ peerId, shouldCreateOffer }` | Both users ready, exchange SDP |
| `room-full` | `{}` | Room at max capacity (2 users) |
| `user-left` | `{ peerId }` | Peer disconnected |
| `offer` | `{ from, offer }` | Received WebRTC offer |
| `answer` | `{ from, answer }` | Received WebRTC answer |
| `ice-candidate` | `{ from, candidate }` | Received ICE candidate |
| `media-state` | `{ userId, type, enabled }` | Peer's media state changed |

### HTTP Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check (returns 200) |

---

## ⚙️ Configuration

### Environment Variables

#### Backend (`backend/.env`)

Create file from `backend/.env.example`:

```env
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port to listen on |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origins (comma-separated for multiple) |

**Production Example:**
```env
PORT=3001
CORS_ORIGIN=https://vidchat.vercel.app,https://app.vidchat.com
```

#### Frontend (`frontend/.env`)

Create file from `frontend/.env.example`:

```env
VITE_SOCKET_URL=http://localhost:3001
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_SOCKET_URL` | `http://localhost:3001` | Backend Socket.IO server URL |

**Production Example:**
```env
VITE_SOCKET_URL=https://vidchat-api.onrender.com
```

### WebRTC Configuration (Hardcoded)

Defined in frontend code:

| Setting | Value | Purpose |
|---------|-------|---------|
| STUN Server 1 | `stun:stun.l.google.com:19302` | NAT traversal |
| STUN Server 2 | `stun:stun1.l.google.com:19302` | Redundancy |
| Trickle ICE | Enabled | Faster connection |
| Room ID | `vidchat-room` | Fixed room identifier |
| Max Users | 2 | Room capacity limit |
| ICE Timeout | 10s (ping), 5s (timeout) | Connection keepalive |

---

## 🚢 Deployment

### Backend → Render.com

1. **Create Web Service**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Build & Start**
   ```
   Root Directory: backend
   Build Command: npm install
   Start Command: node src/index.js
   Environment: Node
   ```

3. **Add Environment Variables**
   ```env
   PORT=3001
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render auto-deploys on git push
   - Note your backend URL (e.g., `https://vidchat-backend.onrender.com`)

### Frontend → Vercel.com

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure Build**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

3. **Add Environment Variables**
   ```env
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel auto-deploys on git push
   - Get your frontend URL (e.g., `https://vidchat.vercel.app`)

### Post-Deployment Checklist

- [ ] Backend health check: `curl https://your-backend.onrender.com/health`
- [ ] Update backend `CORS_ORIGIN` to match frontend URL
- [ ] Update frontend `VITE_SOCKET_URL` to match backend URL
- [ ] Test with two browser tabs on both URLs
- [ ] Verify camera/mic permissions requested
- [ ] Test screen sharing on mobile
- [ ] Monitor logs for connection issues

---

## 🔍 Troubleshooting

### Connection Issues

**Problem:** "Waiting for partner..." never resolves
- **Check:** Is backend running? (`npm run dev` in backend folder)
- **Check:** Is `CORS_ORIGIN` in backend `.env` matching frontend URL?
- **Check:** Is `VITE_SOCKET_URL` in frontend `.env` correct?
- **Check:** Browser console for errors

**Problem:** Camera/Microphone not working
- Verify browser permissions (check address bar)
- Clear browser cache and reload
- Try different browser
- Check device permission settings (OS level)

**Problem:** "Room Full" message appears
- Room is currently at 2-user capacity
- Wait for one user to disconnect
- Refresh browser and try again

**Problem:** No video/audio after connecting
- Check media state in browser console
- Ensure microphone/camera hardware is working
- Try muting/unmuting from control bar
- Restart browser

**Problem:** Screen sharing not working
- Some browsers require HTTPS for screen share
- Desktop only (not mobile)
- Check browser console for specific errors
- Try different browser

### Performance Issues

**Slow video/audio:**
- Check network connection quality
- Reduce browser tabs/processes running
- Close other video applications
- Move closer to Wi-Fi router (if using Wi-Fi)

**High latency:**
- Normal for P2P across continents
- Check STUN server response times
- Consider TURN server for firewall issues

### Logging

**Backend logs:**
```
[BACKEND] SOCKET CONNECT: abc123
[BACKEND] JOIN-ROOM: abc123 attempting to join vidchat-room (size=0)
[BACKEND] USER JOINED: abc123
[BACKEND] ROOM SIZE: 1
```

**Frontend:** Check browser DevTools Console (F12)

---

## 👨‍💻 Development

### Project Setup from Scratch

```bash
# Clone and install
git clone <repo>
cd vidchat

# Backend
cd backend && npm install && npm run dev &

# Frontend (in new terminal)
cd frontend && npm install && npm run dev
```

### Code Organization

**Frontend:**
- Hooks manage all logic (media, peer, socket, orchestration)
- Components focus on UI rendering
- CSS is global dark theme
- Socket service is singleton instance

**Backend:**
- Express handles HTTP (minimal, mostly health check)
- Socket.IO handles all real-time communication
- Room management via Map-based user tracking
- Config centralized for easy deployment

### Adding Features

**New Socket Event:**
1. Add handler in `backend/src/socket/handler.js`
2. Emit corresponding event from frontend hook
3. Update Socket Events table in README

**New Component:**
1. Create in `frontend/src/components/`
2. Import in `CallPage.jsx`
3. Use hooks to manage state

**New Environment Variable:**
1. Add to `.env.example`
2. Read in config (`backend/src/config/index.js` or Vite magic)
3. Update Configuration section in README

### Testing Tips

- Use browser DevTools Console for errors
- Enable Chrome DevTools → Network → WS to watch Socket messages
- Test on different networks (mobile hotspot, different Wi-Fi)
- Test on different browsers (Chrome, Firefox, Safari)
- Monitor `console.log` statements in browser and server

---

## 📝 Documentation

Additional documentation in `docs/` folder:
- **PRD.md** — Product Requirements & Vision
- **TRD.md** — Technical Architecture & Design Decisions
- **DESIGN.md** — UI/UX Design Specifications
- **APP_FLOW.md** — Application Data Flow Diagrams
- **USER_FLOW.md** — User Interaction Flows

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Test locally before submitting changes
2. Update README if adding features
3. Follow existing code style
4. Keep components small and focused

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🆘 Support & Feedback

For issues, feature requests, or feedback, please open an issue on GitHub.

**Last Updated:** January 2026
