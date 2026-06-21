# Technical Requirements Document

## Tech Stack

### Frontend

- React
- Vite
- CSS3
- Socket.IO Client
- Simple Peer

### Backend

- Node.js
- Express
- Socket.IO

### Infrastructure

Frontend:
- Vercel

Backend:
- Render

---

## Architecture

Frontend
    ↓
Socket.IO Server
    ↓
WebRTC Signaling
    ↓
Peer-to-Peer Connection

---

## Communication Flow

1. User opens application
2. User joins room
3. Socket connection established
4. Offer generated
5. Answer generated
6. ICE candidates exchanged
7. Peer connection established
8. Media stream shared

---

## Media APIs

Camera & Microphone

navigator.mediaDevices.getUserMedia()

Screen Share

navigator.mediaDevices.getDisplayMedia()

---

## WebRTC Configuration

ICE Servers

{
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    }
  ]
}

---

## Room Configuration

ROOM_ID = "dsa-study-room"

Fixed room for both users.

---

## Security

- HTTPS deployment
- Secure Socket Connection
- WebRTC encryption

---

## Scalability

Current:
- 2 users

Future:
- Multi-room support
- Group study sessions

---

## Folder Structure

src/

components/
pages/
hooks/
services/
utils/

server/

socket/
controllers/