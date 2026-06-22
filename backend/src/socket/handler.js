import { config } from '../config/index.js';

const MAX_ROOM_SIZE = 2;

export function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[BACKEND] User connected: ${socket.id}`);

    socket.on('join-room', () => {
      const roomId = config.roomId;
      const room = io.sockets.adapter.rooms.get(roomId);
      const currentSize = room ? room.size : 0;

      console.log(`[BACKEND] ${socket.id} attempting to join room - current size: ${currentSize}`);

      if (currentSize >= MAX_ROOM_SIZE) {
        console.log(`[BACKEND] Room full — rejecting ${socket.id}`);
        socket.emit('room-full');
        return;
      }

      socket.join(roomId);

      const updatedRoom = io.sockets.adapter.rooms.get(roomId);
      const updatedSize = updatedRoom ? updatedRoom.size : 0;

      console.log(`[BACKEND] [${roomId}] ${socket.id} joined — room size: ${updatedSize}`);

      if (updatedSize === 1) {
        // First user in room
        console.log(`[BACKEND] First user in room, waiting for partner`);
        socket.emit('waiting-for-partner');
      } else if (updatedSize === 2) {
        // Second user joined, notify both
        const allSocketIds = Array.from(updatedRoom);
        const peerId = allSocketIds.find((id) => id !== socket.id);
        console.log(`[BACKEND] Room full! Both users paired - ${socket.id} <-> ${peerId}`);
        
        // Notify both users they have a partner
        socket.emit('partner-joined', { peerId });
        socket.to(roomId).emit('partner-joined', { peerId: socket.id });
      } else {
        console.log(`[BACKEND] Room size exceeded: ${updatedSize}`);
      }
    });

    socket.on('signal', (data) => {
      const roomId = config.roomId;
      const signalType = data.signal?.type || 'unknown';
      console.log(`[BACKEND] ${socket.id} sending ${signalType} to room ${roomId}`);
      socket.to(roomId).emit('signal', {
        sender: socket.id,
        signal: data.signal,
      });
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
      console.log(`[BACKEND] User disconnected: ${socket.id} - room size now: ${remainingSize}`);
      socket.to(roomId).emit('partner-disconnected');
    });

    socket.on('error', (err) => {
      console.error(`[BACKEND] Socket error for ${socket.id}:`, err);
    });
  });
}
