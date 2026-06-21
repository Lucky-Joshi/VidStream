import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket = null;

export function connectSocket() {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function joinRoom() {
  if (socket) {
    socket.emit('join-room');
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function sendSignal(signal) {
  if (socket) {
    socket.emit('signal', { signal });
  }
}

export function sendMediaState(type, enabled) {
  if (socket) {
    socket.emit('media-state', { type, enabled });
  }
}
