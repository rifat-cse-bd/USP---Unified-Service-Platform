import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { verifyToken } from './utils/tokens.js';

const PORT = Number(process.env.PORT) || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    const decoded = verifyToken(token);
    socket.userId = decoded.sub;
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.join(`user:${socket.userId}`);
  socket.on('join:booking', (bookingId) => {
    if (bookingId) socket.join(`booking:${bookingId}`);
  });
  socket.on('leave:booking', (bookingId) => {
    if (bookingId) socket.leave(`booking:${bookingId}`);
  });
});

app.set('io', io);

server.listen(PORT, () => {
  console.info(`WorkSure API listening on port ${PORT}`);
});
