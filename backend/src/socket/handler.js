import { config } from '../config/index.js';

export function setupSocket(io) {
  io.on('connection', (socket) => {
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

    socket.on('join-room', () => {
      const roomId = config.roomId;
      socket.join(roomId);

      const room = io.sockets.adapter.rooms.get(roomId);
      const size = room ? room.size : 0;

      console.log(`Room ${roomId} size: ${size}`);

      if (size >= 2) {
        const peerIds = [...room].filter((id) => id !== socket.id);
        socket.emit('partner-joined', { peerId: peerIds[0] });
        socket.to(roomId).emit('partner-joined', { peerId: socket.id });
      } else {
        socket.emit('waiting-for-partner');
      }
    });

    socket.on('disconnect', () => {
      const roomId = config.roomId;
      const room = io.sockets.adapter.rooms.get(roomId);

      if (room && room.size > 0) {
        socket.to(roomId).emit('partner-disconnected');
      }

      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
