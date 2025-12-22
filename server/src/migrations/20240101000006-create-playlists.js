/**
 * Migration: Create Playlists Table
 *
 * Playlists are collections of media items to be displayed in sequence.
 * Can be scheduled to specific screens with date/time rules.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('playlists', {
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
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      default_duration: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
        comment: 'Default display duration per item in seconds'
      },
      transition_type: {
        type: Sequelize.ENUM('none', 'fade', 'slide', 'zoom'),
        defaultValue: 'fade',
        comment: 'Transition effect between items'
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Default/fallback playlist when no schedule active'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    await queryInterface.addIndex('playlists', ['tenant_id']);
    await queryInterface.addIndex('playlists', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('playlists');
  }
};
