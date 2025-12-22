/**
 * Heartbeat Monitor Service
 * Monitors screen heartbeats and marks screens offline if heartbeat expires
 */

import cron from 'node-cron';
import { Op } from 'sequelize';
import Screen from '../models/Screen.js';

const HEARTBEAT_TIMEOUT = parseInt(process.env.HEARTBEAT_TIMEOUT || '60');

/**
 * Start the heartbeat monitoring service
 * Runs every 30 seconds to check for expired heartbeats
 */
export function startHeartbeatMonitor(io) {
  cron.schedule('*/30 * * * * *', async () => {
    try {
      const timeoutThreshold = new Date(Date.now() - HEARTBEAT_TIMEOUT * 1000);

      const expiredScreens = await Screen.findAll({
        where: {
          status: 'online',
          last_heartbeat: {
            [Op.lt]: timeoutThreshold
          }
        }
      });

      for (const screen of expiredScreens) {
        await screen.update({ status: 'offline' });

        io.to(`tenant:${screen.tenant_id}`).emit('screen:status', {
          screenId: screen.id,
          status: 'offline',
          reason: 'heartbeat_timeout',
          timestamp: new Date()
        });

        console.log(`⚠️  Screen ${screen.name} (${screen.id}) marked offline due to heartbeat timeout`);
      }
    } catch (error) {
      console.error('Error in heartbeat monitor:', error);
    }
  });

  console.log(`Heartbeat monitor started (timeout: ${HEARTBEAT_TIMEOUT}s)`);
}
