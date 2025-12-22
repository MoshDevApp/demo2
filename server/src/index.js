/**
 * SignCraft Backend Server
 * Main entry point for the Express API server with WebSocket support
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/sequelize.js';
import { setupWebSocket } from './websocket/index.js';
import { startHeartbeatMonitor } from './services/heartbeatMonitor.js';
import authRoutes from './routes/auth.js';
import screenRoutes from './routes/screens.js';
import mediaRoutes from './routes/media.js';
import playlistRoutes from './routes/playlists.js';
import scheduleRoutes from './routes/schedules.js';
import aiRoutes from './routes/ai.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.WEBSOCKET_CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/screens', screenRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/ai', aiRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await initializeDatabase();
    console.log('✅ Database connected successfully');

    setupWebSocket(io);
    console.log('✅ WebSocket server initialized');

    startHeartbeatMonitor(io);
    console.log('✅ Heartbeat monitor started');

    httpServer.listen(PORT, () => {
      console.log(`🚀 SignCraft Backend running on port ${PORT}`);
      console.log(`📡 WebSocket server ready`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { io };
