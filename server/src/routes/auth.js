/**
 * Authentication API Routes
 * Handles user login, registration, and token management
 */

import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const token = jwt.sign(
      {
        userId: 'demo-user-id',
        tenantId: 'demo-tenant-id',
        email: email
      },
      process.env.JWT_SECRET || 'cacbd0c88a06125e9c3ecf9213939660dcf2b813006f68f156fa27b6567c8fb67b2d1ba012e9d5dbe2640f7f68e128c3e61bf230092f7fe29e3ce986d4e1f069',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: 'demo-user-id',
        email,
        firstName: 'Demo',
        lastName: 'User',
        role: 'tenant_admin'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, organizationName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const token = jwt.sign(
      {
        userId: 'demo-user-id',
        tenantId: 'demo-tenant-id',
        email: email
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: 'demo-user-id',
        email,
        firstName,
        lastName,
        role: 'tenant_admin'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

export default router;
