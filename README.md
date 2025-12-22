# SignCraft

**Multi-Tenant Digital Signage Management Platform with AI-Powered Design**

SignCraft is a sophisticated, self-hostable SaaS platform that enables organizations to centrally manage, schedule, and monitor thousands of digital screens worldwide. Built with React, Node.js, MySQL, and integrated with OpenAI for intelligent design assistance.

## Features

### Core Capabilities

- **Multi-Tenant Architecture**: Isolated data and resources per organization
- **Real-Time Screen Monitoring**: WebSocket-based live status updates
- **AI-Powered Intelligence**: Gemini 2.0 for design, copywriting, playlist optimization, diagnostics, and analytics
- **Advanced Scheduling**: Time-based, date-range, and recurring playlist scheduling
- **Universal Device Support**: Works with SignCraft Player, ScreenCloud, Yodeck, Android, Windows
- **Heartbeat Monitoring**: Automatic offline detection with configurable timeouts
- **Location Tracking**: GPS coordinates and physical location management

### Technology Stack

**Frontend**
- React 18 with JavaScript
- Tailwind CSS for styling
- Fabric.js for canvas-based design editor
- Socket.IO client for real-time updates
- Lucide React for icons

**Backend**
- Node.js with Express (JavaScript/ES6 modules)
- MySQL 8+ database
- Sequelize ORM
- Socket.IO for WebSocket communication
- Redis for caching and queues
- Bull for job scheduling

**AI Integration**
- Google Gemini 2.0 Flash for comprehensive AI intelligence
- Creative design generation and optimization
- AI copywriting and localization
- Playlist optimization and scheduling
- Screen diagnostics and predictive maintenance
- Natural language analytics queries

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8+
- Redis 6+

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd signcraft
```

2. Install dependencies
```bash
npm install
cd server && npm install
```

3. Set up MySQL database
```sql
CREATE DATABASE signcraft CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Configure environment
```bash
cd server
cp .env.example .env
# Edit .env with your database credentials and API keys
```

5. Run migrations
```bash
cd server
npm run db:migrate
```

6. Start the servers
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

7. Open your browser to `http://localhost:5173`

For detailed setup instructions, see [SETUP.md](SETUP.md)

## Project Structure

```
signcraft/
├── src/                          # Frontend React application (JavaScript)
│   ├── components/
│   │   ├── DesignEditor.jsx     # AI-powered design studio
│   │   └── ScreenMonitor.jsx    # Real-time screen monitoring
│   ├── App.jsx                   # Main application component
│   └── main.jsx                  # Application entry point
│
├── server/                       # Backend Node.js application (JavaScript)
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # Sequelize configuration
│   │   │   └── sequelize.js     # Database connection
│   │   ├── models/
│   │   │   └── Screen.js        # Screen model
│   │   ├── routes/
│   │   │   ├── auth.js          # Authentication endpoints
│   │   │   ├── screens.js       # Screen management API
│   │   │   ├── design.js        # AI design API
│   │   │   ├── media.js         # Media management
│   │   │   ├── playlists.js     # Playlist management
│   │   │   └── schedules.js     # Scheduling API
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT authentication
│   │   │   └── errorHandler.js  # Global error handling
│   │   ├── services/
│   │   │   └── heartbeatMonitor.js  # Screen health monitoring
│   │   ├── websocket/
│   │   │   └── index.js         # WebSocket server
│   │   ├── migrations/          # Database migrations
│   │   └── index.js             # Server entry point
│   ├── .env.example             # Environment template
│   └── package.json             # Backend dependencies
│
├── SETUP.md                      # Detailed setup guide
├── DATABASE.md                   # Database schema documentation
├── API.md                        # API documentation
└── README.md                     # This file
```

## Key Components

### 1. Screen Monitor

Real-time dashboard displaying all registered screens with:
- Live status indicators (online/offline/error/maintenance)
- Last heartbeat timestamps
- Location information
- Device details
- WebSocket-powered instant updates

### 2. Design Studio

Professional design editor featuring:
- Canvas-based editing with Fabric.js
- Text, shapes, and image tools
- AI complete design generation from prompts
- AI copywriting (headlines, CTAs, body copy)
- AI-powered layout optimization
- Auto-resize for different screen dimensions
- Export to PNG or save as JSON

### 3. Player Management

Comprehensive screen registry with:
- Device registration and authentication
- Connection token management
- Multi-provider support
- Location and timezone configuration
- Status tracking and logging

### 4. AI Intelligence System

Comprehensive AI features powered by Google Gemini 2.0:
- **Creative Intelligence**: Complete design generation, SVG icons, backgrounds, optimization
- **Copywriting Intelligence**: Headlines, CTAs, translation, localization, text fitting
- **Playlist Intelligence**: Optimization, scheduling, content fatigue detection
- **Diagnostics Intelligence**: Screen health analysis, predictive maintenance, remote actions
- **Analytics Intelligence**: Natural language queries, result interpretation, performance comparison

## API Overview

### Authentication
```
POST /api/auth/login      - User login
POST /api/auth/register   - User registration
```

### Screen Management
```
GET    /api/screens                      - List all screens
POST   /api/screens                      - Register new screen
GET    /api/screens/:id                  - Get screen details
PUT    /api/screens/:id                  - Update screen
DELETE /api/screens/:id                  - Remove screen
POST   /api/screens/:id/regenerate-token - Generate new token
GET    /api/screens/:id/stats            - Get statistics
```

### AI Intelligence
```
POST /api/ai/creative/*      - Design generation, optimization, resizing
POST /api/ai/copy/*           - Copywriting, translation, text fitting
POST /api/ai/playlist/*       - Playlist optimization, scheduling
POST /api/ai/diagnostics/*    - Screen health, predictive maintenance
POST /api/ai/analytics/*      - Natural language queries, insights
GET  /api/ai/usage/stats      - Usage statistics and limits
```

For complete API documentation, see [API.md](API.md)

## Database Schema

The system uses a multi-tenant MySQL database with the following key tables:

- `tenants` - Organization/company accounts
- `users` - User accounts with RBAC
- `screens` - Digital display registry
- `media` - Media file metadata
- `folders` - Media organization
- `playlists` - Content playlists
- `playlist_items` - Playlist contents
- `schedules` - Scheduling rules
- `screen_groups` - Screen groupings
- `screen_logs` - Activity logs

For detailed schema documentation, see [DATABASE.md](DATABASE.md)

## WebSocket Events

### From Screen Players
```javascript
screen:heartbeat    - Periodic health check
screen:log          - Activity logging
screen:screenshot   - Screen capture
```

### From Dashboard
```javascript
command:screen      - Send command to screen
request:screen_list - Request screen data
```

### Server Broadcasts
```javascript
screen:status       - Status change notification
screen:log          - Log event notification
screen:screenshot   - Screenshot received
```

## Configuration

### Backend Environment Variables

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=signcraft
DB_USER=root
DB_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_key

# AI Features
OPENAI_API_KEY=sk-your-key-here

# Monitoring
HEARTBEAT_TIMEOUT=60
```

## Development

### Running Tests
```bash
npm test
```

### Database Migrations
```bash
cd server
npm run db:migrate              # Run all migrations
npm run db:migrate:undo         # Undo last migration
```

### Building for Production
```bash
npm run build                   # Build frontend
```

## Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Manual Deployment

1. Build the frontend
```bash
npm run build
```

2. Set up production environment variables

3. Run migrations on production database

4. Start the server with PM2 or similar process manager

## Security

- JWT-based authentication
- Per-screen connection tokens
- Role-based access control (RBAC)
- Tenant data isolation
- SQL injection prevention via ORM
- CORS configuration
- Environment variable protection

## Performance

- MySQL connection pooling
- Redis caching layer
- WebSocket for efficient real-time updates
- Optimized database indexes
- Horizontal scaling support

## Multi-Language Support (Planned)

- English (EN)
- Malay (MS)
- Mandarin Chinese (ZH)

## Roadmap

- [ ] Media upload and processing
- [ ] Complete playlist management UI
- [ ] Advanced scheduling interface
- [ ] Analytics and reporting dashboard
- [ ] SignCraft Player application (Windows/Android)
- [ ] Provider API integrations (ScreenCloud, Yodeck)
- [ ] Multi-language interface
- [ ] Mobile app for monitoring
- [ ] Audit logging system
- [ ] Email/SMS alerts

## Language

This project is written in **JavaScript (ES6 modules)** for both frontend and backend. See [JAVASCRIPT_CONVERSION.md](JAVASCRIPT_CONVERSION.md) for details about the conversion from TypeScript.

## Contributing

This is a proprietary system. For internal development guidelines, please refer to the team documentation.

## License

Proprietary - All rights reserved

## Support

For setup assistance, see [SETUP.md](SETUP.md)

For API details, see [API.md](API.md)

For database information, see [DATABASE.md](DATABASE.md)

For Gemini AI features, see [GEMINI_AI.md](GEMINI_AI.md)

---

Built with React, Node.js, MySQL, and Google Gemini 2.0
