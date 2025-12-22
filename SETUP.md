# SignCraft Setup Guide

## Overview

SignCraft is a multi-tenant digital signage management platform with AI-powered design capabilities. This guide will help you set up and run the system locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **MySQL Server** (v8.0 or higher)
- **Redis Server** (v6.0 or higher)
- **Git**

## Installation Steps

### 1. Install MySQL

#### macOS (using Homebrew)
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

#### Windows
Download and install from: https://dev.mysql.com/downloads/mysql/

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### 2. Install Redis

#### macOS (using Homebrew)
```bash
brew install redis
brew services start redis
```

#### Windows
Download from: https://github.com/microsoftarchive/redis/releases

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
```

### 3. Create MySQL Database

```bash
mysql -u root -p
```

Then in MySQL console:
```sql
CREATE DATABASE signcraft CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'signcraft_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON signcraft.* TO 'signcraft_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Backend Setup

```bash
cd server
npm install
```

Create `.env` file in the `server` directory:
```bash
cp .env.example .env
```

Edit `.env` and configure your settings:
```env
NODE_ENV=development
PORT=3001

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=signcraft
DB_USER=signcraft_user
DB_PASSWORD=your_secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secrets (generate secure random strings)
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# OpenAI API (for AI design features)
OPENAI_API_KEY=your_openai_api_key_here
```

Run database migrations:
```bash
npm run db:migrate
```

Start the backend server:
```bash
npm run dev
```

The backend will be running at `http://localhost:3001`

### 5. Frontend Setup

Open a new terminal window:

```bash
npm install
npm run dev
```

The frontend will be running at `http://localhost:5173`

## Database Schema

The system creates the following tables automatically through migrations:

- **tenants** - Organizations/companies using the platform
- **users** - User accounts with role-based access
- **screens** - Digital displays/screens registry
- **media** - Media files metadata
- **folders** - Media organization structure
- **playlists** - Content playlists
- **playlist_items** - Items within playlists
- **schedules** - Scheduling rules
- **screen_groups** - Logical groupings of screens
- **screen_group_members** - Screen-to-group associations
- **screen_logs** - Activity and status logs

## Features

### 1. Screen Management & Monitoring

- **Real-time Status Monitoring**: WebSocket-based live updates
- **Heartbeat Detection**: Automatic offline detection after 60 seconds
- **Device Registry**: Support for multiple providers (SignCraft Player, ScreenCloud, Yodeck, etc.)
- **Location Tracking**: GPS coordinates and physical location management

#### API Endpoints

```
GET    /api/screens              - List all screens
POST   /api/screens              - Register new screen
GET    /api/screens/:id          - Get screen details
PUT    /api/screens/:id          - Update screen
DELETE /api/screens/:id          - Remove screen
POST   /api/screens/:id/regenerate-token - Generate new connection token
GET    /api/screens/:id/stats    - Get screen statistics
```

### 2. AI-Powered Design Editor

The design editor uses OpenAI's DALL-E 3 and GPT-4 for intelligent design assistance.

#### AI Features

1. **Image Generation**
   - Generate images from text descriptions
   - Multiple style options (professional, modern, minimalist, vibrant, elegant)
   - High-quality output optimized for digital signage

2. **Layout Suggestions**
   - AI analyzes your requirements
   - Provides element placement recommendations
   - Suggests color schemes and typography

3. **Text Generation**
   - Headlines, descriptions, and call-to-action text
   - Context-aware content generation

4. **Design Optimization**
   - Analyzes existing designs
   - Provides actionable improvement suggestions
   - Accessibility and contrast recommendations

#### API Endpoints

```
POST /api/design/ai/generate-image    - Generate AI image
POST /api/design/ai/suggest-layout    - Get layout suggestions
POST /api/design/ai/generate-text     - Generate text content
POST /api/design/ai/optimize-design   - Get design feedback
```

### 3. WebSocket Events

#### Screen Events (from player to server)
```javascript
socket.emit('screen:heartbeat', {
  playerVersion: '1.0.0',
  deviceInfo: { /* ... */ }
});

socket.emit('screen:log', {
  type: 'info',
  message: 'Playlist changed'
});

socket.emit('screen:screenshot', {
  screenshot: 'base64_data'
});
```

#### Dashboard Events (from server to clients)
```javascript
socket.on('screen:status', (data) => {
  // { screenId, status, timestamp }
});

socket.on('screen:log', (data) => {
  // { screenId, type, message, timestamp }
});

socket.on('screen:screenshot', (data) => {
  // { screenId, screenshot, timestamp }
});
```

#### Command Events (from dashboard to screens)
```javascript
socket.emit('command:screen', {
  screenId: 'screen-uuid',
  command: 'reload_playlist',
  payload: { playlistId: 'playlist-uuid' }
});
```

## Testing the System

### 1. Start the Backend
```bash
cd server
npm run dev
```

### 2. Start the Frontend
```bash
npm run dev
```

### 3. Access the Application

Open your browser and navigate to `http://localhost:5173`

### 4. Test Features

#### Screen Monitor
1. Click "Screen Monitor" in the navigation
2. You'll see a real-time dashboard (empty initially)
3. Use the API to register screens (see API documentation)

#### Design Studio
1. Click "Design Studio" in the navigation
2. Add elements using the left sidebar
3. Click "AI Assistant" to access AI features
4. Enter prompts to generate images or get layout suggestions

## Environment Variables Reference

### Backend (.env in server folder)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| NODE_ENV | Environment mode | No | development |
| PORT | Server port | No | 3001 |
| DB_HOST | MySQL host | Yes | localhost |
| DB_PORT | MySQL port | No | 3306 |
| DB_NAME | Database name | Yes | signcraft |
| DB_USER | Database user | Yes | root |
| DB_PASSWORD | Database password | Yes | - |
| REDIS_HOST | Redis host | Yes | localhost |
| REDIS_PORT | Redis port | No | 6379 |
| JWT_SECRET | JWT signing key | Yes | - |
| JWT_REFRESH_SECRET | Refresh token key | Yes | - |
| OPENAI_API_KEY | OpenAI API key | No* | - |
| HEARTBEAT_TIMEOUT | Screen timeout (seconds) | No | 60 |

*Required only for AI design features

## Troubleshooting

### MySQL Connection Error

**Error**: `ER_NOT_SUPPORTED_AUTH_MODE`

**Solution**: Update MySQL authentication method
```sql
ALTER USER 'signcraft_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use`

**Solution**: Change the PORT in `.env` or kill the process using the port

### Redis Connection Error

**Error**: `Error connecting to Redis`

**Solution**: Ensure Redis is running
```bash
redis-cli ping
# Should return: PONG
```

### OpenAI API Errors

**Error**: `Invalid OpenAI API key`

**Solution**:
1. Get API key from https://platform.openai.com/api-keys
2. Add to `.env` file: `OPENAI_API_KEY=sk-...`
3. Restart the backend server

## Development Tips

### Database Migrations

Create a new migration:
```bash
cd server
npx sequelize-cli migration:generate --name migration-name
```

Run migrations:
```bash
npm run db:migrate
```

Undo last migration:
```bash
npm run db:migrate:undo
```

### Testing WebSocket Connection

Use the browser console:
```javascript
const socket = io('http://localhost:3001', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => console.log('Connected!'));
socket.emit('request:screen_list');
```

### Registering a Test Screen

```bash
curl -X POST http://localhost:3001/api/screens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "device_id": "test-screen-001",
    "name": "Test Screen",
    "provider": "signcraft_player",
    "screen_width": 1920,
    "screen_height": 1080,
    "orientation": "landscape",
    "location_name": "Office Lobby",
    "timezone": "America/New_York"
  }'
```

## Next Steps

1. **User Authentication**: Implement full user registration and login
2. **Media Upload**: Add media file upload and processing
3. **Playlist Management**: Build playlist creation and scheduling UI
4. **Screen Player**: Develop the SignCraft Player agent for Windows/Android
5. **Provider Integrations**: Add adapters for ScreenCloud, Yodeck APIs
6. **Analytics Dashboard**: Build usage statistics and reporting
7. **Internationalization**: Add language support (English, Malay, Mandarin)

## Support

For issues and questions:
- Check the troubleshooting section above
- Review the API documentation in `API.md`
- Examine server logs for detailed error messages

## Architecture Notes

### Multi-Tenant Isolation

All database tables include `tenant_id` for data isolation. API middleware automatically filters queries by the authenticated user's tenant.

### Real-Time Communication

- WebSocket for bi-directional screen communication
- Automatic reconnection handling
- Heartbeat monitoring with configurable timeout

### Security

- JWT-based authentication
- Per-screen connection tokens
- Role-based access control (RBAC)
- Tenant data isolation

### Scalability Considerations

- Redis for caching and session management
- Bull queue for async job processing
- MySQL connection pooling
- Stateless API design for horizontal scaling
