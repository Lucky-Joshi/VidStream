import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket = null;
let connectionPromise = null;

export function connectSocket() {
  if (socket?.connected) {
    console.log('[SOCKET] Already connected:', socket.id);
    return socket;
  }

  if (connectionPromise) {
    console.log('[SOCKET] Connection in progress, waiting...');
    return connectionPromise;
  }

  if (socket) {
    console.log('[SOCKET] Cleaning up old socket instance');
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  console.log('[SOCKET] Creating new connection to', SOCKET_URL);

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  connectionPromise = new Promise((resolve) => {
    socket.on('connect', () => {
      console.log('[SOCKET] Connected:', socket.id);
      connectionPromise = null;
      resolve(socket);
    });
  });

  socket.on('connect_error', (error) => {
    console.error('[SOCKET] Connection error:', error);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function joinRoom() {
  if (socket?.connected) {
    console.log('[SOCKET] Joining room...');
    socket.emit('join-room');
  } else {
    console.warn('[SOCKET] Cannot join room - socket not connected');
  }
}

export function sendSignal(signal) {
  if (socket?.connected) {
    console.log('[SIGNAL] SENDING -', signal.type);
    socket.emit('signal', { signal });
  } else {
    console.warn('[SIGNAL] Cannot send - socket not connected');
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
    connectionPromise = null;
  }
}
