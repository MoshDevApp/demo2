/**
 * Migration: Create Screens Table
 *
 * Central registry for all digital screens/displays managed by the platform.
 * Supports multiple device types and providers with comprehensive metadata.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('screens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      device_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Unique device identifier (MAC address, serial, or generated)'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Friendly display name'
      },
      provider: {
        type: Sequelize.ENUM('signcraft_player', 'screencloud', 'yodeck', 'android', 'windows', 'other'),
        defaultValue: 'signcraft_player',
        allowNull: false,
        comment: 'Device provider/platform'
      },
      provider_device_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Provider-specific device ID for API integration'
      },
      screen_width: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Screen width in pixels'
      },
      screen_height: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Screen height in pixels'
      },
      orientation: {
        type: Sequelize.ENUM('landscape', 'portrait'),
        defaultValue: 'landscape',
        allowNull: false
      },
      location_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Physical location description'
      },
      location_address: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Physical address'
      },
      location_latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
        comment: 'GPS latitude'
      },
      location_longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
        comment: 'GPS longitude'
      },
      timezone: {
        type: Sequelize.STRING(100),
        defaultValue: 'UTC',
        comment: 'Local timezone for scheduling'
      },
      tags: {
        type: Sequelize.JSON,
        defaultValue: [],
        comment: 'Searchable tags (e.g., ["lobby", "reception"])'
      },
      status: {
        type: Sequelize.ENUM('online', 'offline', 'error', 'maintenance'),
        defaultValue: 'offline',
        allowNull: false
      },
      last_heartbeat: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Last successful heartbeat/ping'
      },
      connection_token: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Secure token for player authentication'
      },
      player_version: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'SignCraft Player version (if applicable)'
      },
      device_info: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'Additional device specifications and metadata'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.addIndex('screens', ['tenant_id']);
    await queryInterface.addIndex('screens', ['device_id']);
    await queryInterface.addIndex('screens', ['status']);
    await queryInterface.addIndex('screens', ['tenant_id', 'status']);
    await queryInterface.addIndex('screens', ['last_heartbeat']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('screens');
  }
};
