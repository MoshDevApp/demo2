/**
 * Migration: Create Folders Table
 *
 * Hierarchical folder structure for organizing media assets.
 * Supports nested folders with parent-child relationships.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('folders', {
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
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'folders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Parent folder for nested structure'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      color: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Hex color for UI organization'
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

    await queryInterface.addIndex('folders', ['tenant_id']);
    await queryInterface.addIndex('folders', ['parent_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('folders');
  }
};
