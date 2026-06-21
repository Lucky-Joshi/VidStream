import { config } from '../config/index.js';

const rooms = {};

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

      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }

      if (!rooms[roomId].includes(socket.id)) {
        rooms[roomId].push(socket.id);
      }

      const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      console.log(`Room ${roomId}: ${roomSize} sockets, ${rooms[roomId].length} tracked`);

      const peers = rooms[roomId].filter((id) => id !== socket.id);

      if (peers.length > 0) {
        socket.emit('partner-joined', { peerId: peers[peers.length - 1] });
        socket.to(roomId).emit('partner-joined', { peerId: socket.id });
      } else {
        socket.emit('waiting-for-partner');
      }
    });

    socket.on('disconnect', () => {
      const roomId = config.roomId;
      socket.to(roomId).emit('partner-disconnected');
      if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
        }
      }
    });
  });
}
