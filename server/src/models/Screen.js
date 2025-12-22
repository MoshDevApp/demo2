/**
 * Screen Model
 * Represents digital displays/screens managed by the platform
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Screen extends Model {}

Screen.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    device_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    provider: {
      type: DataTypes.ENUM('signcraft_player', 'screencloud', 'yodeck', 'android', 'windows', 'other'),
      defaultValue: 'signcraft_player',
      allowNull: false
    },
    provider_device_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    screen_width: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    screen_height: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    orientation: {
      type: DataTypes.ENUM('landscape', 'portrait'),
      defaultValue: 'landscape',
      allowNull: false
    },
    location_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    location_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location_latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    location_longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    timezone: {
      type: DataTypes.STRING(100),
      defaultValue: 'UTC'
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('online', 'offline', 'error', 'maintenance'),
      defaultValue: 'offline',
      allowNull: false
    },
    last_heartbeat: {
      type: DataTypes.DATE,
      allowNull: true
    },
    connection_token: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    player_version: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    device_info: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    created_at: {
      type: DataTypes.DATE,
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.DATE,
      field: 'updated_at'
    }
  },
  {
    sequelize,
    tableName: 'screens',
    timestamps: true,
    underscored: true
  }
);

export default Screen;
