import { config } from '../config/index.js';

const MAX_ROOM_SIZE = 2;

export function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[BACKEND] SOCKET CONNECT: ${socket.id}`);

    socket.on('join-room', () => {
      const roomId = config.roomId;
      const room = io.sockets.adapter.rooms.get(roomId);
      const currentSize = room ? room.size : 0;

      console.log(
        `[BACKEND] JOIN-ROOM: ${socket.id} attempting to join ${roomId} (size=${currentSize})`
      );

      if (currentSize >= MAX_ROOM_SIZE) {
        console.log(`[BACKEND] JOIN-ROOM: room full, rejecting ${socket.id}`);
        socket.emit('room-full');
        return;
      }

      socket.join(roomId);

      const updatedRoom = io.sockets.adapter.rooms.get(roomId);
      const updatedSize = updatedRoom ? updatedRoom.size : 0;
      const members = updatedRoom ? Array.from(updatedRoom) : [];

      console.log(
        `[BACKEND] JOIN-ROOM: ${socket.id} joined ${roomId} (size=${updatedSize}, members=${members.join(', ')})`
      );

      if (updatedSize === 1) {
        console.log('[BACKEND] PARTNER-READY: waiting-for-partner');
        socket.emit('waiting-for-partner');
      } else if (updatedSize === 2) {
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
        console.log(`[BACKEND] JOIN-ROOM: unexpected room size=${updatedSize}`);
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

    socket.on('disconnect', () => {
      const roomId = config.roomId;
      const room = io.sockets.adapter.rooms.get(roomId);
      const remainingSize = room ? room.size : 0;
      console.log(
        `[BACKEND] DISCONNECT: ${socket.id} disconnected from ${roomId} (remaining=${remainingSize})`
      );

      socket.to(roomId).emit('partner-disconnected', { peerId: socket.id });
      if (remainingSize === 1) {
        socket.to(roomId).emit('waiting-for-partner');
      }
    });

    socket.on('error', (err) => {
      console.error(`[BACKEND] Socket error for ${socket.id}:`, err);
    });
  });
}
