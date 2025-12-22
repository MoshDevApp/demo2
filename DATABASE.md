# SignCraft Database Schema

## Overview

SignCraft uses MySQL 8+ with a multi-tenant architecture. All tables include `tenant_id` for data isolation except the `tenants` table itself. Character set is `utf8mb4` with `utf8mb4_unicode_ci` collation for full Unicode support.

## Multi-Tenancy Strategy

### Data Isolation Method
- **Row-Level Isolation**: Primary strategy using `tenant_id` foreign key in all tenant-scoped tables
- **Application-Level Enforcement**: Middleware automatically filters all queries by authenticated user's tenant
- **Optional Schema-Level Isolation**: Can be implemented for high-security tenants (future enhancement)

## Core Tables

### tenants

Organization/company accounts using the platform.

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  subscription_plan ENUM('free', 'starter', 'professional', 'enterprise') DEFAULT 'free',
  max_screens INT DEFAULT 5,
  max_storage_gb INT DEFAULT 10,
  status ENUM('active', 'suspended', 'cancelled') DEFAULT 'active',
  settings JSON DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Indexes:**
- `slug` (unique)
- `status`

**Notes:**
- `max_screens` and `max_storage_gb` enforce subscription limits
- `settings` stores tenant-specific preferences (JSON)

---

### users

User accounts with role-based access control.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('tenant_admin', 'content_manager', 'viewer', 'technician') DEFAULT 'viewer',
  language ENUM('en', 'ms', 'zh') DEFAULT 'en',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY (tenant_id, email)
);
```

**Indexes:**
- `tenant_id`
- `email`
- `tenant_id, email` (unique composite)

**Roles:**
- `tenant_admin` - Full access within tenant
- `content_manager` - Create/edit content and playlists
- `viewer` - Read-only access
- `technician` - Screen management and monitoring

---

### screens

Central registry for all digital displays managed by the platform.

```sql
CREATE TABLE screens (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  device_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  provider ENUM('signcraft_player', 'screencloud', 'yodeck', 'android', 'windows', 'other') DEFAULT 'signcraft_player',
  provider_device_id VARCHAR(255) NULL,
  screen_width INT NULL,
  screen_height INT NULL,
  orientation ENUM('landscape', 'portrait') DEFAULT 'landscape',
  location_name VARCHAR(255) NULL,
  location_address TEXT NULL,
  location_latitude DECIMAL(10, 8) NULL,
  location_longitude DECIMAL(11, 8) NULL,
  timezone VARCHAR(100) DEFAULT 'UTC',
  tags JSON DEFAULT '[]',
  status ENUM('online', 'offline', 'error', 'maintenance') DEFAULT 'offline',
  last_heartbeat TIMESTAMP NULL,
  connection_token VARCHAR(500) NULL,
  player_version VARCHAR(50) NULL,
  device_info JSON DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
```

**Indexes:**
- `tenant_id`
- `device_id` (unique)
- `status`
- `tenant_id, status` (composite)
- `last_heartbeat`

**Provider Types:**
- `signcraft_player` - Custom SignCraft player application
- `screencloud` - ScreenCloud integration
- `yodeck` - Yodeck integration
- `android` - Generic Android device
- `windows` - Generic Windows device
- `other` - Other platforms

**Status Values:**
- `online` - Active and responsive
- `offline` - Not responding to heartbeats
- `error` - Reported error condition
- `maintenance` - Manually set maintenance mode

---

### folders

Hierarchical folder structure for media organization.

```sql
CREATE TABLE folders (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  parent_id UUID NULL,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(20) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
);
```

**Indexes:**
- `tenant_id`
- `parent_id`

**Notes:**
- `parent_id` is NULL for root-level folders
- Supports unlimited nesting depth

---

### media

Metadata for all media assets (images, videos, designs).

```sql
CREATE TABLE media (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  folder_id UUID NULL,
  name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  media_type ENUM('image', 'video', 'design') NOT NULL,
  width INT NULL,
  height INT NULL,
  duration INT NULL,
  thumbnail_path VARCHAR(500) NULL,
  optimized_path VARCHAR(500) NULL,
  metadata JSON DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

**Indexes:**
- `tenant_id`
- `folder_id`
- `media_type`
- `created_by`

**Media Types:**
- `image` - JPG, PNG, WebP, SVG, GIF
- `video` - MP4, WebM
- `design` - Canvas designs from SignCraft Studio

**Notes:**
- Actual files stored in S3 or local filesystem
- `file_path` contains storage location/key
- `thumbnail_path` for video thumbnails
- `optimized_path` for processed versions

---

### playlists

Collections of media items for sequential display.

```sql
CREATE TABLE playlists (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  default_duration INT DEFAULT 10,
  transition_type ENUM('none', 'fade', 'slide', 'zoom') DEFAULT 'fade',
  is_default BOOLEAN DEFAULT FALSE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

**Indexes:**
- `tenant_id`
- `status`

**Notes:**
- `default_duration` in seconds
- `is_default` marks fallback playlist when no schedule active

---

### playlist_items

Individual media items within playlists.

```sql
CREATE TABLE playlist_items (
  id UUID PRIMARY KEY,
  playlist_id UUID NOT NULL,
  media_id UUID NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  duration INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
);
```

**Indexes:**
- `playlist_id`
- `media_id`
- `playlist_id, order_index` (composite)

**Notes:**
- `order_index` determines display sequence
- `duration` overrides playlist default if set

---

### screen_groups

Logical groupings of screens for batch operations.

```sql
CREATE TABLE screen_groups (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  color VARCHAR(20) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
```

**Indexes:**
- `tenant_id`

---

### screen_group_members

Junction table for many-to-many relationship between screens and groups.

```sql
CREATE TABLE screen_group_members (
  id UUID PRIMARY KEY,
  screen_group_id UUID NOT NULL,
  screen_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (screen_group_id) REFERENCES screen_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (screen_id) REFERENCES screens(id) ON DELETE CASCADE,
  UNIQUE KEY (screen_group_id, screen_id)
);
```

**Indexes:**
- `screen_group_id`
- `screen_id`
- `screen_group_id, screen_id` (unique composite)

---

### schedules

Advanced scheduling rules for playlist assignment.

```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  playlist_id UUID NOT NULL,
  screen_id UUID NULL,
  screen_group_id UUID NULL,
  name VARCHAR(255) NOT NULL,
  start_date TIMESTAMP NULL,
  end_date TIMESTAMP NULL,
  days_of_week JSON DEFAULT '[0,1,2,3,4,5,6]',
  time_start TIME NULL,
  time_end TIME NULL,
  priority INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (screen_id) REFERENCES screens(id) ON DELETE CASCADE,
  FOREIGN KEY (screen_group_id) REFERENCES screen_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

**Indexes:**
- `tenant_id`
- `playlist_id`
- `screen_id`
- `screen_group_id`
- `status`

**Schedule Logic:**
- Either `screen_id` OR `screen_group_id` is set (not both)
- `days_of_week` is JSON array: [0=Sunday, 1=Monday, ..., 6=Saturday]
- NULL date/time values mean "always" for that dimension
- Higher `priority` wins when schedules overlap

---

### screen_logs

Activity and status logs for debugging and analytics.

```sql
CREATE TABLE screen_logs (
  id UUID PRIMARY KEY,
  screen_id UUID NOT NULL,
  log_type ENUM('heartbeat', 'error', 'warning', 'command', 'status_change') NOT NULL,
  message TEXT NULL,
  metadata JSON DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (screen_id) REFERENCES screens(id) ON DELETE CASCADE
);
```

**Indexes:**
- `screen_id`
- `log_type`
- `created_at`

**Log Types:**
- `heartbeat` - Regular health checks
- `error` - Error conditions
- `warning` - Warning conditions
- `command` - Commands sent to screen
- `status_change` - Status transitions

---

## Relationships

### One-to-Many
- `tenants` → `users`
- `tenants` → `screens`
- `tenants` → `folders`
- `tenants` → `media`
- `tenants` → `playlists`
- `tenants` → `screen_groups`
- `tenants` → `schedules`
- `folders` → `folders` (self-referencing)
- `folders` → `media`
- `playlists` → `playlist_items`
- `screens` → `screen_logs`
- `users` → `media` (created_by)
- `users` → `playlists` (created_by)
- `users` → `schedules` (created_by)

### Many-to-Many
- `screens` ↔ `screen_groups` (via `screen_group_members`)
- `playlists` ↔ `media` (via `playlist_items`)

## Data Types

### UUID
All primary keys use UUID v4 for:
- Global uniqueness
- Security (non-sequential)
- Distributed system compatibility

### JSON Fields
Used for flexible, semi-structured data:
- `tenants.settings` - Tenant preferences
- `screens.tags` - Searchable tags array
- `screens.device_info` - Device metadata
- `media.metadata` - File metadata
- `schedules.days_of_week` - Week schedule array
- `screen_logs.metadata` - Log context

### Timestamps
- `created_at` - Auto-populated on insert
- `updated_at` - Auto-updated on modification
- `last_heartbeat` - Updated by heartbeat service
- `last_login` - Updated on successful authentication

## Migration Strategy

All schema changes are managed through Sequelize migrations in `/server/src/migrations/`:

```bash
# Run all pending migrations
npm run db:migrate

# Rollback last migration
npm run db:migrate:undo

# Create new migration
npx sequelize-cli migration:generate --name description
```

## Performance Optimization

### Indexes
Strategic indexes on:
- Foreign keys for join performance
- Commonly filtered columns (status, type)
- Unique constraints for data integrity
- Composite indexes for multi-column queries

### Connection Pooling
```javascript
pool: {
  max: 20,      // Maximum connections
  min: 5,       // Minimum connections
  acquire: 60000,  // Max time to acquire connection
  idle: 10000   // Max idle time before release
}
```

### Query Optimization
- Use `SELECT` with specific columns (avoid `SELECT *`)
- Add indexes for WHERE, ORDER BY, and JOIN columns
- Use pagination for large result sets
- Implement caching with Redis for frequent queries

## Security

### SQL Injection Prevention
- All queries use Sequelize ORM parameterization
- No raw SQL concatenation
- Input validation on all user data

### Data Access Control
- Row-level filtering by `tenant_id`
- JWT authentication required for all tenant data
- Role-based permissions enforced in middleware

### Sensitive Data
- Passwords stored with bcrypt hashing
- Connection tokens hashed when stored
- JWT secrets stored in environment variables

## Backup and Recovery

### Recommended Backup Strategy
```bash
# Daily full backup
mysqldump -u user -p signcraft > backup_$(date +%Y%m%d).sql

# Incremental binary logs
mysqlbinlog --start-datetime="2024-01-01 00:00:00" binlog.000001
```

### Point-in-Time Recovery
MySQL binary logs enable recovery to any point in time.

## Monitoring

### Key Metrics
- Connection pool utilization
- Query execution time
- Table sizes and growth rates
- Index usage statistics
- Slow query log analysis

### Useful Queries

```sql
-- Table sizes
SELECT
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES
WHERE table_schema = 'signcraft'
ORDER BY size_mb DESC;

-- Active screens per tenant
SELECT
  t.name,
  COUNT(s.id) AS screen_count,
  SUM(CASE WHEN s.status = 'online' THEN 1 ELSE 0 END) AS online_count
FROM tenants t
LEFT JOIN screens s ON s.tenant_id = t.id
GROUP BY t.id;

-- Recent screen logs
SELECT
  s.name,
  sl.log_type,
  sl.message,
  sl.created_at
FROM screen_logs sl
JOIN screens s ON s.id = sl.screen_id
WHERE sl.created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY sl.created_at DESC;
```

---

**Database Version**: MySQL 8.0+
**Character Set**: utf8mb4
**Collation**: utf8mb4_unicode_ci
**Engine**: InnoDB
