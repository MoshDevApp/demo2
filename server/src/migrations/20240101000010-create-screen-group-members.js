/**
 * Migration: Create Screen Group Members Table
 *
 * Junction table linking screens to groups (many-to-many relationship).
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('screen_group_members', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      screen_group_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'screen_groups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.addIndex('screen_group_members', ['screen_group_id']);
    await queryInterface.addIndex('screen_group_members', ['screen_id']);
    await queryInterface.addIndex('screen_group_members', ['screen_group_id', 'screen_id'], { unique: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('screen_group_members');
  }
};
