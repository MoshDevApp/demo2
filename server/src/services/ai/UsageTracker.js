import { Sequelize } from 'sequelize';
import sequelize from '../../config/sequelize.js';


const AIUsageLog = sequelize.define('AIUsageLog', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  tenant_id: Sequelize.UUID,
  user_id: Sequelize.UUID,
  feature_type: Sequelize.STRING,
  action: Sequelize.STRING,
  prompt: Sequelize.TEXT,
  model_used: Sequelize.STRING,
  tokens_used: Sequelize.INTEGER,
  cost_usd: Sequelize.DECIMAL(10, 6),
  status: Sequelize.STRING,
  response_data: Sequelize.JSON,
  metadata: Sequelize.JSON
}, {
  tableName: 'ai_usage_logs',
  timestamps: false,
  createdAt: 'created_at'
});

const AIUsageLimit = sequelize.define('AIUsageLimit', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  tenant_id: Sequelize.UUID,
  monthly_request_limit: Sequelize.INTEGER,
  monthly_token_limit: Sequelize.INTEGER,
  monthly_cost_limit_usd: Sequelize.DECIMAL(10, 2),
  current_month_requests: Sequelize.INTEGER,
  current_month_tokens: Sequelize.INTEGER,
  current_month_cost_usd: Sequelize.DECIMAL(10, 2),
  last_reset_at: Sequelize.DATE,
  is_enabled: Sequelize.BOOLEAN,
  require_approval: Sequelize.BOOLEAN
}, {
  tableName: 'ai_usage_limits',
  timestamps: true,
  underscored: true
});

export class UsageTracker {
  async checkLimits(tenantId) {
    try {
      let limits = await AIUsageLimit.findOne({
        where: { tenant_id: tenantId }
      });

      if (!limits) {
        limits = await AIUsageLimit.create({
          tenant_id: tenantId,
          monthly_request_limit: 1000,
          monthly_token_limit: 1000000,
          monthly_cost_limit_usd: 50.00,
          current_month_requests: 0,
          current_month_tokens: 0,
          current_month_cost_usd: 0.00,
          last_reset_at: new Date(),
          is_enabled: true,
          require_approval: false
        });
      }

      await this.resetIfNewMonth(limits);

      if (!limits.is_enabled) {
        return { allowed: false, reason: 'AI features are disabled for this organization' };
      }

      if (limits.current_month_requests >= limits.monthly_request_limit) {
        return { allowed: false, reason: 'Monthly request limit exceeded' };
      }

      if (limits.current_month_tokens >= limits.monthly_token_limit) {
        return { allowed: false, reason: 'Monthly token limit exceeded' };
      }

      if (parseFloat(limits.current_month_cost_usd) >= parseFloat(limits.monthly_cost_limit_usd)) {
        return { allowed: false, reason: 'Monthly cost limit exceeded' };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking AI usage limits:', error);
      return { allowed: true };
    }
  }

  async resetIfNewMonth(limits) {
    const now = new Date();
    const lastReset = new Date(limits.last_reset_at);

    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      await limits.update({
        current_month_requests: 0,
        current_month_tokens: 0,
        current_month_cost_usd: 0.00,
        last_reset_at: now
      });
    }
  }

  async logRequest(data) {
    try {
      const log = await AIUsageLog.create({
        tenant_id: data.tenantId,
        user_id: data.userId,
        feature_type: data.featureType,
        action: data.action,
        prompt: data.prompt,
        model_used: data.model,
        status: 'pending',
        tokens_used: 0,
        cost_usd: 0.000000
      });

      return log.id;
    } catch (error) {
      console.error('Error logging AI request:', error);
      return null;
    }
  }

  async updateRequest(logId, data) {
    try {
      if (!logId) return;

      const log = await AIUsageLog.findByPk(logId);
      if (!log) return;

      await log.update({
        status: data.status,
        tokens_used: data.tokensUsed || 0,
        cost_usd: data.costUsd || 0.000000,
        response_data: data.responseData
      });

      if (data.status === 'completed' && data.tokensUsed) {
        await this.incrementUsage(log.tenant_id, data.tokensUsed, data.costUsd);
      }
    } catch (error) {
      console.error('Error updating AI request:', error);
    }
  }

  async incrementUsage(tenantId, tokens, cost) {
    try {
      const limits = await AIUsageLimit.findOne({
        where: { tenant_id: tenantId }
      });

      if (limits) {
        await limits.increment({
          current_month_requests: 1,
          current_month_tokens: tokens,
          current_month_cost_usd: parseFloat(cost)
        });
      }
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  }

  async getUsageStats(tenantId) {
    try {
      const limits = await AIUsageLimit.findOne({
        where: { tenant_id: tenantId }
      });

      if (!limits) {
        return {
          requests: { used: 0, limit: 1000, percentage: 0 },
          tokens: { used: 0, limit: 1000000, percentage: 0 },
          cost: { used: 0, limit: 50.00, percentage: 0 }
        };
      }

      return {
        requests: {
          used: limits.current_month_requests,
          limit: limits.monthly_request_limit,
          percentage: (limits.current_month_requests / limits.monthly_request_limit * 100).toFixed(2)
        },
        tokens: {
          used: limits.current_month_tokens,
          limit: limits.monthly_token_limit,
          percentage: (limits.current_month_tokens / limits.monthly_token_limit * 100).toFixed(2)
        },
        cost: {
          used: parseFloat(limits.current_month_cost_usd),
          limit: parseFloat(limits.monthly_cost_limit_usd),
          percentage: (limits.current_month_cost_usd / limits.monthly_cost_limit_usd * 100).toFixed(2)
        }
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return null;
    }
  }
}

export default UsageTracker;
