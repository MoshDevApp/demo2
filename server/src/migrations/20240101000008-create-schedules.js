/**
 * Migration: Create Schedules Table
 *
 * Advanced scheduling rules to assign playlists to screens based on
 * date ranges, time periods, and recurring weekly patterns.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('schedules', {
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
      screen_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'screens',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Specific screen (null if applies to group)'
      },
      screen_group_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'screen_groups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Screen group (null if applies to single screen)'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Absolute start date/time (null for immediate)'
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Absolute end date/time (null for indefinite)'
      },
      days_of_week: {
        type: Sequelize.JSON,
        defaultValue: [0, 1, 2, 3, 4, 5, 6],
        comment: 'Array of days: 0=Sunday, 6=Saturday'
      },
      time_start: {
        type: Sequelize.TIME,
        allowNull: true,
        comment: 'Daily start time (e.g., 09:00:00)'
      },
      time_end: {
        type: Sequelize.TIME,
        allowNull: true,
        comment: 'Daily end time (e.g., 17:00:00)'
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Higher number = higher priority when schedules overlap'
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

    await queryInterface.addIndex('schedules', ['tenant_id']);
    await queryInterface.addIndex('schedules', ['playlist_id']);
    await queryInterface.addIndex('schedules', ['screen_id']);
    await queryInterface.addIndex('schedules', ['screen_group_id']);
    await queryInterface.addIndex('schedules', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('schedules');
  }
};
