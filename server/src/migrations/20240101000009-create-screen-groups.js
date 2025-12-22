/**
 * Migration: Create Screen Groups Table
 *
 * Logical groupings of screens for batch operations and scheduling.
 * A screen can belong to multiple groups.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('screen_groups', {
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
      color: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Hex color for UI identification'
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

    await queryInterface.addIndex('screen_groups', ['tenant_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('screen_groups');
  }
};
