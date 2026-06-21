import { config } from '../config/index.js';

const MAX_ROOM_SIZE = 2;

export function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', () => {
      const roomId = config.roomId;
      const room = io.sockets.adapter.rooms.get(roomId);
      const currentSize = room ? room.size : 0;

      if (currentSize >= MAX_ROOM_SIZE) {
        socket.emit('room-full');
        return;
      }

      socket.join(roomId);

      const updatedRoom = io.sockets.adapter.rooms.get(roomId);
      const updatedSize = updatedRoom ? updatedRoom.size : 0;

      console.log(`[${roomId}] ${socket.id} joined — room size: ${updatedSize}`);

      if (updatedSize >= MAX_ROOM_SIZE) {
        const peerIds = [...updatedRoom].filter((id) => id !== socket.id);
        socket.emit('partner-joined', { peerId: peerIds[0] });
        socket.to(roomId).emit('partner-joined', { peerId: socket.id });
      } else {
        socket.emit('waiting-for-partner');
      }
    });

    socket.on('signal', (data) => {
      const roomId = config.roomId;
      socket.to(roomId).emit('signal', {
        sender: socket.id,
        signal: data.signal,
      });
    });

    socket.on('media-state', (data) => {
      const roomId = config.roomId;
      socket.to(roomId).emit('media-state', {
        userId: socket.id,
        type: data.type,
        enabled: data.enabled,
      });
    });

    socket.on('disconnect', () => {
      const roomId = config.roomId;
      socket.to(roomId).emit('partner-disconnected');
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
