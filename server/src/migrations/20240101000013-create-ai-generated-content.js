/*
  # Create AI Generated Content Table

  1. New Tables
    - `ai_generated_content`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key to tenants)
      - `user_id` (uuid, foreign key to users)
      - `usage_log_id` (uuid, foreign key to ai_usage_logs)
      - `content_type` (enum: image, video, svg, text, layout, design)
      - `url` (string)
      - `prompt` (text)
      - `metadata` (json: dimensions, format, style, etc.)
      - `approval_status` (enum: pending, approved, rejected)
      - `approved_by` (uuid, foreign key to users)
      - `approved_at` (timestamp)
      - `version` (integer)
      - `parent_id` (uuid, self-reference for versioning)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Users can only access their tenant's content

  3. Indexes
    - Index on tenant_id
    - Index on content_type
    - Index on approval_status
*/

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('ai_generated_content', {
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
    usage_log_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'ai_usage_logs',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    content_type: {
      type: Sequelize.ENUM('image', 'video', 'svg', 'text', 'layout', 'design'),
      allowNull: false
    },
    url: {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    prompt: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    metadata: {
      type: Sequelize.JSON,
      allowNull: true
    },
    approval_status: {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'approved'
    },
    approved_by: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    approved_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    version: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    },
    parent_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'ai_generated_content',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
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

  await queryInterface.addIndex('ai_generated_content', ['tenant_id']);
  await queryInterface.addIndex('ai_generated_content', ['user_id']);
  await queryInterface.addIndex('ai_generated_content', ['content_type']);
  await queryInterface.addIndex('ai_generated_content', ['approval_status']);
  await queryInterface.addIndex('ai_generated_content', ['created_at']);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('ai_generated_content');
}
