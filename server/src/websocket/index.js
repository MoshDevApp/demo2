/**
 * WebSocket Server Configuration
 * Handles real-time communication with screens and dashboard clients
 */

import jwt from 'jsonwebtoken';
import Screen from '../models/Screen.js';

const connectedScreens = new Map();
const dashboardClients = new Map();

/**
 * Initialize WebSocket server with authentication and event handlers
 */
export function setupWebSocket(io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    const deviceToken = socket.handshake.auth.deviceToken;

    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.tenantId = decoded.tenantId;
        socket.userId = decoded.userId;
        return next();
      }

      if (deviceToken) {
        const screen = await Screen.findOne({
          where: { connection_token: deviceToken }
        });

        if (screen) {
          socket.tenantId = screen.tenant_id;
          socket.screenId = screen.id;
          socket.deviceId = screen.device_id;
          return next();
        }
      }

      return next(new Error('Authentication failed'));
    } catch (error) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    if (socket.screenId) {
      handleScreenConnection(socket, io);
    } else if (socket.userId) {
      handleDashboardConnection(socket, io);
    }

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      if (socket.screenId) {
        handleScreenDisconnection(socket, io);
      } else if (socket.userId) {
        dashboardClients.delete(socket.id);
      }
    });
  });
}

/**
 * Handle screen player connections
 */
function handleScreenConnection(socket, io) {
  const screenId = socket.screenId;
  const tenantId = socket.tenantId;

  connectedScreens.set(socket.id, screenId);

  socket.join(`tenant:${tenantId}`);
  socket.join(`screen:${screenId}`);

  Screen.update(
    {
      status: 'online',
      last_heartbeat: new Date()
    },
    { where: { id: screenId } }
  ).then(() => {
    io.to(`tenant:${tenantId}`).emit('screen:status', {
      screenId,
      status: 'online',
      timestamp: new Date()
    });
  });

  socket.on('screen:heartbeat', async (data) => {
    await Screen.update(
      {
        last_heartbeat: new Date(),
        player_version: data.playerVersion,
        device_info: data.deviceInfo || {}
      },
      { where: { id: screenId } }
    );

    socket.emit('heartbeat:ack', { timestamp: new Date() });
  });

  socket.on('screen:log', async (data) => {
    io.to(`tenant:${tenantId}`).emit('screen:log', {
      screenId,
      ...data,
      timestamp: new Date()
    });
  });

  socket.on('screen:screenshot', (data) => {
    io.to(`tenant:${tenantId}`).emit('screen:screenshot', {
      screenId,
      screenshot: data.screenshot,
      timestamp: new Date()
    });
  });

  console.log(`Screen ${screenId} connected and marked online`);
}

/**
 * Handle screen disconnection
 */
function handleScreenDisconnection(socket, io) {
  const screenId = socket.screenId;
  const tenantId = socket.tenantId;

  connectedScreens.delete(socket.id);

  Screen.update(
    { status: 'offline' },
    { where: { id: screenId } }
  ).then(() => {
    io.to(`tenant:${tenantId}`).emit('screen:status', {
      screenId,
      status: 'offline',
      timestamp: new Date()
    });
  });

  console.log(`Screen ${screenId} disconnected and marked offline`);
}

/**
 * Handle dashboard client connections
 */
function handleDashboardConnection(socket, io) {
  const tenantId = socket.tenantId;
  const userId = socket.userId;

  dashboardClients.set(socket.id, userId);
  socket.join(`tenant:${tenantId}`);

  socket.on('command:screen', async (data) => {
    const { screenId, command, payload } = data;

    const screen = await Screen.findOne({
      where: { id: screenId, tenant_id: tenantId }
    });

    if (screen) {
      io.to(`screen:${screenId}`).emit('command', {
        command,
        payload,
        timestamp: new Date()
      });

      socket.emit('command:sent', {
        screenId,
        command,
        status: 'sent'
      });
    } else {
      socket.emit('command:error', {
        screenId,
        error: 'Screen not found'
      });
    }
  });

  socket.on('request:screen_list', async () => {
    const screens = await Screen.findAll({
      where: { tenant_id: tenantId },
      attributes: ['id', 'name', 'status', 'last_heartbeat', 'location_latitude', 'location_longitude']
    });

    socket.emit('screen_list', screens);
  });

  console.log(`Dashboard user ${userId} connected to tenant ${tenantId}`);
}

export { connectedScreens, dashboardClients };
