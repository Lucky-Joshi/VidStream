import { config } from '../config/index.js';

const MAX_ROOM_SIZE = 2;
const roomUsers = new Map();

function getRoomSet(roomId) {
  if (!roomUsers.has(roomId)) {
    roomUsers.set(roomId, new Set());
  }
  return roomUsers.get(roomId);
}

function pruneDisconnectedUsers(io, roomId) {
  const users = getRoomSet(roomId);
  for (const socketId of [...users]) {
    if (!io.sockets.sockets.has(socketId)) {
      users.delete(socketId);
    }
  }
  return users;
}

function cleanupUserFromRoom(io, socket, reason) {
  const roomId = config.roomId;
  const users = pruneDisconnectedUsers(io, roomId);
  const hadUser = users.delete(socket.id);

  socket.leave(roomId);
  console.log(`[BACKEND] ROOM CLEANED: ${socket.id} removed=${hadUser} reason=${reason}`);

  if (!hadUser) {
    if (users.size === 0 && roomUsers.has(roomId)) {
      roomUsers.delete(roomId);
      console.log(`[BACKEND] ROOM DELETED: ${roomId}`);
    }
    return;
  }

  console.log(`[BACKEND] ROOM SIZE: ${users.size}`);

  for (const peerId of users) {
    io.to(peerId).emit('user-left', { peerId: socket.id });
    io.to(peerId).emit('waiting-for-partner');
  }

  if (users.size === 0) {
    roomUsers.delete(roomId);
    console.log(`[BACKEND] ROOM DELETED: ${roomId}`);
  }
}

export function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[BACKEND] SOCKET CONNECT: ${socket.id}`);

    socket.on('join-room', () => {
      const roomId = config.roomId;
      const users = pruneDisconnectedUsers(io, roomId);

      console.log(
        `[BACKEND] JOIN-ROOM: ${socket.id} attempting to join ${roomId} (size=${users.size})`
      );

      if (users.size >= MAX_ROOM_SIZE && !users.has(socket.id)) {
        console.log('[BACKEND] ROOM FULL');
        socket.emit('room-full');
        return;
      }

      const hadUser = users.has(socket.id);
      users.add(socket.id);
      socket.join(roomId);
      console.log(`[BACKEND] USER JOINED: ${socket.id}`);
      console.log(`[BACKEND] ROOM SIZE: ${users.size}`);

      if (users.size === 1) {
        console.log('[BACKEND] PARTNER-READY: waiting-for-partner');
        socket.emit('waiting-for-partner');
      } else if (users.size === 2 && !hadUser) {
        const members = [...users];
        const existingPeerId = members.find((id) => id !== socket.id);
        if (!existingPeerId) {
          return;
        }

        console.log(
          `[BACKEND] USER-JOINED: existing=${existingPeerId}, new=${socket.id} in room=${roomId}`
        );
        io.to(existingPeerId).emit('user-joined', { peerId: socket.id });

        // Emit "ready" only when exactly two users are in room.
        console.log(
          `[BACKEND] PARTNER-READY: ready emitted to ${existingPeerId} (offer=false) and ${socket.id} (offer=true)`
        );
        io.to(existingPeerId).emit('ready', { peerId: socket.id, shouldCreateOffer: false });
        socket.emit('ready', { peerId: existingPeerId, shouldCreateOffer: true });
      } else {
        console.log(`[BACKEND] ROOM SIZE: ${users.size}`);
      }
    });

    socket.on('offer', ({ to, offer }) => {
      console.log(`[BACKEND] OFFER FORWARD: from=${socket.id} to=${to}`);
      if (to) {
        io.to(to).emit('offer', { from: socket.id, offer });
      }
    });

    socket.on('answer', ({ to, answer }) => {
      console.log(`[BACKEND] ANSWER FORWARD: from=${socket.id} to=${to}`);
      if (to) {
        io.to(to).emit('answer', { from: socket.id, answer });
      }
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
      console.log(`[BACKEND] ICE FORWARD: from=${socket.id} to=${to}`);
      if (to) {
        io.to(to).emit('ice-candidate', { from: socket.id, candidate });
      }
    });

    socket.on('media-state', (data) => {
      const roomId = config.roomId;
      console.log(`[BACKEND] ${socket.id} media state: ${data.type} = ${data.enabled}`);
      socket.to(roomId).emit('media-state', {
        userId: socket.id,
        type: data.type,
        enabled: data.enabled,
      });
    });

    socket.on('leave-room', () => {
      console.log(`[BACKEND] USER LEFT MANUALLY: ${socket.id}`);
      cleanupUserFromRoom(io, socket, 'manual-leave');
    });

    socket.on('disconnect', () => {
      console.log(`[BACKEND] USER DISCONNECTED: ${socket.id}`);
      cleanupUserFromRoom(io, socket, 'disconnect');
    });

    socket.on('error', (err) => {
      console.error(`[BACKEND] Socket error for ${socket.id}:`, err);
    });
  });
}
