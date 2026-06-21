import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config/index.js';
import { healthCheck } from './controllers/health.js';
import { setupSocket } from './socket/handler.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

app.use(cors({ origin: config.corsOrigin }));
app.get('/health', healthCheck);

setupSocket(io);

server.listen(config.port, () => {
  console.log(`DSA Together server running on port ${config.port}`);
  console.log(`CORS origin: ${JSON.stringify(config.corsOrigin)}`);
});
