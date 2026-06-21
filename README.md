# DSA Together

A lightweight 2-person DSA study application with video calling, audio calling, and screen sharing.

No authentication. No database. No chat. Just instant peer-to-peer connection for coding practice.

## Tech Stack

- **Frontend:** React, Vite, CSS3, Socket.IO Client, Simple Peer
- **Backend:** Node.js, Express, Socket.IO
- **Deployment:** Frontend → Vercel, Backend → Render

## Folder Structure

```
vidchat/
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ConnectionStatus.jsx
│   │   │   ├── ControlBar.jsx
│   │   │   ├── PermissionPrompt.jsx
│   │   │   └── VideoGrid.jsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useCall.js
│   │   │   ├── useMedia.js
│   │   │   ├── usePeer.js
│   │   │   └── useSocket.js
│   │   ├── pages/             # Page components
│   │   │   └── CallPage.jsx
│   │   ├── services/          # External service integrations
│   │   │   └── socket.js
│   │   ├── styles/            # Global styles
│   │   │   └── index.css
│   │   ├── utils/             # Constants and utilities
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── config/            # Server configuration
│   │   │   └── index.js
│   │   ├── controllers/       # Route handlers
│   │   │   └── health.js
│   │   ├── socket/            # Socket.IO signaling
│   │   │   └── handler.js
│   │   └── index.js           # Server entry point
│   ├── .env
│   └── package.json
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+
- npm

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in two browser windows to test.

## How It Works

1. Open the app — camera and microphone permissions are requested
2. Automatically joins the fixed study room (`dsa-study-room`)
3. Waits for a partner to join
4. WebRTC peer connection is established via Socket.IO signaling
5. Video and audio streams flow peer-to-peer
6. Use the control bar to mute mic, toggle camera, share screen, or leave

## Deployment

### Backend (Render)

1. Push the `backend/` directory to a new repository
2. Create a new Web Service on Render
3. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
4. Add environment variable: `CORS_ORIGIN=https://your-frontend-url.vercel.app`

### Frontend (Vercel)

1. Push the `frontend/` directory to a new repository
2. Import project in Vercel
3. Set:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
4. Add environment variable: `VITE_SOCKET_URL=https://your-backend-url.onrender.com`

## Environment Variables

### Backend

| Variable      | Default                 | Description          |
|---------------|-------------------------|----------------------|
| `PORT`        | `3001`                  | Server port          |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin  |

### Frontend

| Variable          | Default                 | Description        |
|-------------------|-------------------------|--------------------|
| `VITE_SOCKET_URL` | `http://localhost:3001` | Backend Socket URL |

## Features

- Video calling with camera toggle
- Audio calling with mute/unmute
- Screen sharing with one click
- Local video preview (picture-in-picture)
- Automatic reconnection
- Permission error handling
- Responsive design (desktop, tablet, mobile)
- Dark theme optimized for study sessions
