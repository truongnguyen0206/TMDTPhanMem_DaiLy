const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

let io;

/**
 * Init Socket.IO server.
 * - Auth via JWT (same secret as REST auth)
 * - Join basic rooms: user:<id>, role:<role>, role_id:<role_id>
 */
function initSocket(httpServer) {
  const corsOriginsRaw = process.env.CORS_ORIGINS || process.env.CLIENT_ORIGIN || '*';
  const corsOrigins = corsOriginsRaw === '*'
    ? '*'
    : corsOriginsRaw.split(',').map((s) => s.trim()).filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const tokenFromAuth = socket.handshake.auth?.token;
      const tokenFromHeader = socket.handshake.headers?.authorization?.split(' ')[1];
      const tokenFromQuery = socket.handshake.query?.token;
      const token = tokenFromAuth || tokenFromHeader || tokenFromQuery;

      if (!token) return next(new Error('AUTH_REQUIRED'));

      jwt.verify(token, process.env.JWT_SECRET || 'mysecret', (err, user) => {
        if (err) return next(new Error('AUTH_INVALID'));
        socket.user = user;
        return next();
      });
    } catch (e) {
      return next(new Error('AUTH_ERROR'));
    }
  });

  io.on('connection', (socket) => {
    const u = socket.user || {};

    if (u.id) socket.join(`user:${u.id}`);
    if (u.role) socket.join(`role:${String(u.role)}`);
    if (u.role_id) socket.join(`role_id:${String(u.role_id)}`);

    socket.emit('socket:connected', {
      userId: u.id,
      role: u.role,
      role_id: u.role_id,
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO is not initialized. Call initSocket(server) first.');
  return io;
}

/**
 * Emit an event safely (won't crash if socket isn't ready).
 */
function safeEmit(event, payload) {
  try {
    if (!io) return;
    io.emit(event, payload);
  } catch (e) {
    // Do nothing – realtime must never break REST flow
  }
}

module.exports = {
  initSocket,
  getIO,
  safeEmit,
};
