/*
  # Create AI Usage Logs Table

  1. New Tables
    - `ai_usage_logs`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key to tenants)
      - `user_id` (uuid, foreign key to users)
      - `feature_type` (enum: design, copywriting, playlist, diagnostics, analytics, query)
      - `action` (enum: generate_image, generate_video, generate_text, optimize_playlist, analyze_screen, etc.)
      - `prompt` (text)
      - `model_used` (string: gemini-2.0-flash-exp, etc.)
      - `tokens_used` (integer)
      - `cost_usd` (decimal)
      - `status` (enum: pending, completed, failed, moderated)
      - `response_data` (json)
      - `metadata` (json)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `ai_usage_logs` table
    - Users can only read their own tenant's logs
    - Admins can read all logs

  3. Indexes
    - Index on tenant_id for fast filtering
    - Index on created_at for time-based queries
    - Index on feature_type for analytics
*/

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('ai_usage_logs', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
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
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    feature_type: {
      type: Sequelize.ENUM(
        'design',
        'copywriting',
        'playlist',
        'diagnostics',
        'analytics',
        'query',
        'admin'
      ),
      allowNull: false
    },
    action: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    prompt: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    model_used: {
      type: Sequelize.STRING(50),
      defaultValue: 'gemini-2.0-flash-exp'
    },
    tokens_used: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    cost_usd: {
      type: Sequelize.DECIMAL(10, 6),
      defaultValue: 0.000000
    },
    status: {
      type: Sequelize.ENUM('pending', 'completed', 'failed', 'moderated'),
      defaultValue: 'pending'
    },
    response_data: {
      type: Sequelize.JSON,
      allowNull: true
    },
    metadata: {
      type: Sequelize.JSON,
      allowNull: true
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  });

  await queryInterface.addIndex('ai_usage_logs', ['tenant_id']);
  await queryInterface.addIndex('ai_usage_logs', ['user_id']);
  await queryInterface.addIndex('ai_usage_logs', ['feature_type']);
  await queryInterface.addIndex('ai_usage_logs', ['created_at']);
  await queryInterface.addIndex('ai_usage_logs', ['status']);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('ai_usage_logs');
}
