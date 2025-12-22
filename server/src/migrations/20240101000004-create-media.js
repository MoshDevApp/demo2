/**
 * Migration: Create Media Table
 *
 * Stores metadata for all media assets (images, videos, designs).
 * Actual files stored in object storage (S3/local filesystem).
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('media', {
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
      folder_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'folders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Display name of the media file'
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Original filename'
      },
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'Storage path or S3 key'
      },
      file_size: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'File size in bytes'
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      media_type: {
        type: Sequelize.ENUM('image', 'video', 'design'),
        allowNull: false,
        comment: 'Media category'
      },
      width: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Image/video width in pixels'
      },
      height: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Image/video height in pixels'
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Video duration in seconds'
      },
      thumbnail_path: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Path to generated thumbnail'
      },
      optimized_path: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Path to optimized/transcoded version'
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'Additional file metadata (EXIF, codec info, etc.)'
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

    await queryInterface.addIndex('media', ['tenant_id']);
    await queryInterface.addIndex('media', ['folder_id']);
    await queryInterface.addIndex('media', ['media_type']);
    await queryInterface.addIndex('media', ['created_by']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('media');
  }
};
