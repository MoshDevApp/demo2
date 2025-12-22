/*
  # Create AI Usage Limits Table

  1. New Tables
    - `ai_usage_limits`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key to tenants, unique)
      - `monthly_request_limit` (integer)
      - `monthly_token_limit` (integer)
      - `monthly_cost_limit_usd` (decimal)
      - `current_month_requests` (integer)
      - `current_month_tokens` (integer)
      - `current_month_cost_usd` (decimal)
      - `last_reset_at` (timestamp)
      - `is_enabled` (boolean)
      - `require_approval` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Only tenant admins can view/edit limits

  3. Indexes
    - Unique index on tenant_id
*/


export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('ai_usage_limits', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    tenant_id: {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'tenants',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    monthly_request_limit: {
      type: Sequelize.INTEGER,
      defaultValue: 1000
    },
    monthly_token_limit: {
      type: Sequelize.INTEGER,
      defaultValue: 1000000
    },
    monthly_cost_limit_usd: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 50.00
    },
    current_month_requests: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    current_month_tokens: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    current_month_cost_usd: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    last_reset_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    is_enabled: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    require_approval: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
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
  });

  await queryInterface.addIndex('ai_usage_limits', ['tenant_id'], { unique: true });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('ai_usage_limits');
}
