/**
 * Migration: Create Screen Logs Table
 *
 * Activity and status logs for screens (heartbeats, errors, commands).
 * Used for monitoring, debugging, and analytics.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('screen_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      screen_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'screens',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      log_type: {
        type: Sequelize.ENUM('heartbeat', 'error', 'warning', 'command', 'status_change'),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'Additional context (error codes, command details, etc.)'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.addIndex('screen_logs', ['screen_id']);
    await queryInterface.addIndex('screen_logs', ['log_type']);
    await queryInterface.addIndex('screen_logs', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('screen_logs');
  }
};
