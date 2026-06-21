import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket = null;

export function connectSocket() {
  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function joinRoom() {
  if (socket?.connected) {
    socket.emit('join-room');
  }
}

export function sendSignal(signal) {
  if (socket?.connected) {
    socket.emit('signal', { signal });
  }
}

export function sendMediaState(type, enabled) {
  if (socket?.connected) {
    socket.emit('media-state', { type, enabled });
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
