import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket = null;

export function connectSocket() {
  if (socket) {
    console.log('[SOCKET] Reusing existing socket instance');
    return socket;
  }

  console.log('[SOCKET] Creating singleton socket connection to', SOCKET_URL);

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('[SOCKET] CONNECTED:', socket.id);
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function joinRoom() {
  if (socket?.connected) {
    console.log('[SOCKET] JOIN-ROOM emitted');
    socket.emit('join-room');
  } else {
    console.warn('[SOCKET] Cannot join room - socket not connected');
  }
}

export function sendOffer(to, offer) {
  if (socket?.connected) {
    console.log('[SIGNAL] OFFER SENT');
    socket.emit('offer', { to, offer });
  } else {
    console.warn('[SIGNAL] Cannot send offer - socket not connected');
  }
}

export function sendAnswer(to, answer) {
  if (socket?.connected) {
    console.log('[SIGNAL] ANSWER SENT');
    socket.emit('answer', { to, answer });
  } else {
    console.warn('[SIGNAL] Cannot send answer - socket not connected');
  }
}

export function sendIceCandidate(to, candidate) {
  if (socket?.connected) {
    console.log('[SIGNAL] ICE SENT');
    socket.emit('ice-candidate', { to, candidate });
  } else {
    console.warn('[SIGNAL] Cannot send ICE - socket not connected');
  }
}

export function sendMediaState(type, enabled) {
  if (socket?.connected) {
    socket.emit('media-state', { type, enabled });
  }
}

export function disconnectSocket() {
  if (socket) {
    console.log('[SOCKET] Disconnecting...');
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
