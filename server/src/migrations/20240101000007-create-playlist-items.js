/**
 * Migration: Create Playlist Items Table
 *
 * Individual media items within a playlist with custom duration and ordering.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('playlist_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      playlist_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'playlists',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      media_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'media',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      order_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Display order within playlist'
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Custom duration in seconds (overrides playlist default)'
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

    await queryInterface.addIndex('playlist_items', ['playlist_id']);
    await queryInterface.addIndex('playlist_items', ['media_id']);
    await queryInterface.addIndex('playlist_items', ['playlist_id', 'order_index']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('playlist_items');
  }
};
