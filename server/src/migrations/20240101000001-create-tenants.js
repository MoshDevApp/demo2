/**
 * Migration: Create Tenants Table
 *
 * Creates the foundational tenants (organizations) table for multi-tenant architecture.
 * Each tenant represents a separate organization/company using the SignCraft platform.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tenants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Organization/company name'
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'URL-friendly identifier'
      },
      subscription_plan: {
        type: Sequelize.ENUM('free', 'starter', 'professional', 'enterprise'),
        defaultValue: 'free',
        allowNull: false
      },
      max_screens: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
        comment: 'Maximum number of screens allowed'
      },
      max_storage_gb: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
        comment: 'Maximum storage in GB'
      },
      status: {
        type: Sequelize.ENUM('active', 'suspended', 'cancelled'),
        defaultValue: 'active',
        allowNull: false
      },
      settings: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'Tenant-specific settings and preferences'
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

    await queryInterface.addIndex('tenants', ['slug']);
    await queryInterface.addIndex('tenants', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tenants');
  }
};
