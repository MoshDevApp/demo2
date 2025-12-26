/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user context to requests
 */

import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cacbd0c88a06125e9c3ecf9213939660dcf2b813006f68f156fa27b6567c8fb67b2d1ba012e9d5dbe2640f7f68e128c3e61bf230092f7fe29e3ce986d4e1f069');
    req.user = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      email: decoded.email
    };
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}
