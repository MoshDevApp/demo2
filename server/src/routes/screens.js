/**
 * Screens API Routes
 * Endpoints for managing digital screens/displays
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Screen from '../models/Screen.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, provider, search } = req.query;
    const where = { tenant_id: req.user.tenantId };

    if (status) {
      where.status = status;
    }

    if (provider) {
      where.provider = provider;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { device_id: { [Op.like]: `%${search}%` } },
        { location_name: { [Op.like]: `%${search}%` } }
      ];
    }

    const screens = await Screen.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    res.json(screens);
  } catch (error) {
    console.error('Error fetching screens:', error);
    res.status(500).json({ error: 'Failed to fetch screens' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const screen = await Screen.findOne({
      where: {
        id: req.params.id,
        tenant_id: req.user.tenantId
      }
    });

    if (!screen) {
      return res.status(404).json({ error: 'Screen not found' });
    }

    res.json(screen);
  } catch (error) {
    console.error('Error fetching screen:', error);
    res.status(500).json({ error: 'Failed to fetch screen' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      device_id,
      name,
      provider,
      provider_device_id,
      screen_width,
      screen_height,
      orientation,
      location_name,
      location_address,
      location_latitude,
      location_longitude,
      timezone,
      tags
    } = req.body;

    const existingScreen = await Screen.findOne({
      where: { device_id }
    });

    if (existingScreen) {
      return res.status(409).json({ error: 'Screen with this device ID already exists' });
    }

    const connectionToken = `${uuidv4()}-${Date.now()}`;

    const screen = await Screen.create({
      id: uuidv4(),
      tenant_id: req.user.tenantId,
      device_id,
      name,
      provider: provider || 'signcraft_player',
      provider_device_id,
      screen_width,
      screen_height,
      orientation: orientation || 'landscape',
      location_name,
      location_address,
      location_latitude,
      location_longitude,
      timezone: timezone || 'UTC',
      tags: tags || [],
      status: 'offline',
      connection_token: connectionToken,
      device_info: {}
    });

    res.status(201).json(screen);
  } catch (error) {
    console.error('Error creating screen:', error);
    res.status(500).json({ error: 'Failed to create screen' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const screen = await Screen.findOne({
      where: {
        id: req.params.id,
        tenant_id: req.user.tenantId
      }
    });

    if (!screen) {
      return res.status(404).json({ error: 'Screen not found' });
    }

    const {
      name,
      screen_width,
      screen_height,
      orientation,
      location_name,
      location_address,
      location_latitude,
      location_longitude,
      timezone,
      tags,
      status
    } = req.body;

    await screen.update({
      name: name !== undefined ? name : screen.name,
      screen_width: screen_width !== undefined ? screen_width : screen.screen_width,
      screen_height: screen_height !== undefined ? screen_height : screen.screen_height,
      orientation: orientation !== undefined ? orientation : screen.orientation,
      location_name: location_name !== undefined ? location_name : screen.location_name,
      location_address: location_address !== undefined ? location_address : screen.location_address,
      location_latitude: location_latitude !== undefined ? location_latitude : screen.location_latitude,
      location_longitude: location_longitude !== undefined ? location_longitude : screen.location_longitude,
      timezone: timezone !== undefined ? timezone : screen.timezone,
      tags: tags !== undefined ? tags : screen.tags,
      status: status !== undefined ? status : screen.status
    });

    res.json(screen);
  } catch (error) {
    console.error('Error updating screen:', error);
    res.status(500).json({ error: 'Failed to update screen' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const screen = await Screen.findOne({
      where: {
        id: req.params.id,
        tenant_id: req.user.tenantId
      }
    });

    if (!screen) {
      return res.status(404).json({ error: 'Screen not found' });
    }

    await screen.destroy();
    res.json({ message: 'Screen deleted successfully' });
  } catch (error) {
    console.error('Error deleting screen:', error);
    res.status(500).json({ error: 'Failed to delete screen' });
  }
});

router.post('/:id/regenerate-token', authenticateToken, async (req, res) => {
  try {
    const screen = await Screen.findOne({
      where: {
        id: req.params.id,
        tenant_id: req.user.tenantId
      }
    });

    if (!screen) {
      return res.status(404).json({ error: 'Screen not found' });
    }

    const newToken = `${uuidv4()}-${Date.now()}`;
    await screen.update({ connection_token: newToken });

    res.json({ connection_token: newToken });
  } catch (error) {
    console.error('Error regenerating token:', error);
    res.status(500).json({ error: 'Failed to regenerate token' });
  }
});

router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const screen = await Screen.findOne({
      where: {
        id: req.params.id,
        tenant_id: req.user.tenantId
      }
    });

    if (!screen) {
      return res.status(404).json({ error: 'Screen not found' });
    }

    const uptime = screen.last_heartbeat
      ? Date.now() - new Date(screen.last_heartbeat).getTime()
      : null;

    res.json({
      status: screen.status,
      last_heartbeat: screen.last_heartbeat,
      uptime_ms: uptime,
      player_version: screen.player_version,
      device_info: screen.device_info
    });
  } catch (error) {
    console.error('Error fetching screen stats:', error);
    res.status(500).json({ error: 'Failed to fetch screen stats' });
  }
});

export default router;
