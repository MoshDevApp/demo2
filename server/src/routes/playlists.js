/**
 * Playlists API Routes
 * Placeholder routes for playlist management
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  res.json([]);
});

router.post('/', authenticateToken, async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
