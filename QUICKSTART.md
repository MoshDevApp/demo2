# SignCraft Quick Start Guide

Get SignCraft up and running in 10 minutes!

## Prerequisites Check

```bash
# Check Node.js version (needs 18+)
node --version

# Check if MySQL is installed
mysql --version

# Check if Redis is installed
redis-cli --version
```

If any are missing, see [SETUP.md](SETUP.md) for installation instructions.

## 1. Database Setup (2 minutes)

```bash
# Start MySQL
mysql -u root -p

# In MySQL console, run:
CREATE DATABASE signcraft CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'signcraft'@'localhost' IDENTIFIED BY 'signcraft123';
GRANT ALL PRIVILEGES ON signcraft.* TO 'signcraft'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 2. Install Dependencies (3 minutes)

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

## 3. Configure Environment (1 minute)

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your settings:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=signcraft
DB_USER=signcraft
DB_PASSWORD=signcraft123

JWT_SECRET=my_secret_key_12345
JWT_REFRESH_SECRET=my_refresh_key_67890

# Optional: Add OpenAI key for AI features
OPENAI_API_KEY=sk-your-key-here
```

## 4. Run Migrations (1 minute)

```bash
cd server
npm run db:migrate
cd ..
```

You should see:
```
✅ Migration: create-tenants
✅ Migration: create-users
✅ Migration: create-screens
... (11 migrations total)
```

## 5. Start the Application (1 minute)

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

Wait for:
```
✅ Database connected successfully
✅ WebSocket server initialized
✅ Heartbeat monitor started
🚀 SignCraft Backend running on port 3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Wait for:
```
VITE ready in XXXms
Local: http://localhost:5173
```

## 6. Access the Application

Open your browser to: **http://localhost:5173**

You should see the SignCraft interface with two tabs:
- **Screen Monitor** - Real-time screen monitoring dashboard
- **Design Studio** - AI-powered design editor

## 7. Test the API (Optional)

Register a test screen:

```bash
# First, get a JWT token (demo mode returns a token without real auth)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test"}' \
  > token.json

# Extract token (or copy manually from response)
TOKEN=$(cat token.json | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Register a screen
curl -X POST http://localhost:3001/api/screens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "device_id": "SCREEN-DEMO-001",
    "name": "Demo Lobby Display",
    "provider": "signcraft_player",
    "screen_width": 1920,
    "screen_height": 1080,
    "orientation": "landscape",
    "location_name": "Main Lobby",
    "timezone": "America/New_York",
    "tags": ["demo", "lobby"]
  }'
```

Refresh the Screen Monitor page to see your screen!

## 8. Try AI Features

1. Click **"Design Studio"** in the navigation
2. Click **"AI Assistant"** button (purple gradient)
3. Enter a prompt like: "A welcome screen with modern design"
4. Click **"Generate Image"**

Note: AI features require an OpenAI API key in `server/.env`

## Common Issues

### "Can't connect to MySQL"

**Solution:**
```bash
# Start MySQL service
# macOS:
brew services start mysql

# Linux:
sudo systemctl start mysql

# Windows: Start MySQL service from Services app
```

### "Redis connection error"

**Solution:**
```bash
# Start Redis service
# macOS:
brew services start redis

# Linux:
sudo systemctl start redis

# Windows: Start redis-server.exe
```

### "Port 3001 already in use"

**Solution:**
```bash
# Change port in server/.env
PORT=3002
```

### "OpenAI API error"

**Solution:**
1. Get API key from: https://platform.openai.com/api-keys
2. Add to `server/.env`: `OPENAI_API_KEY=sk-...`
3. Restart backend server

## Next Steps

### Add More Screens
Use the `/api/screens` endpoint to register more displays.

### Build Media Library
Implement media upload functionality (currently placeholder).

### Create Playlists
Implement playlist management (currently placeholder).

### Set Up Scheduling
Configure when playlists should play on screens.

### Deploy to Production
See [SETUP.md](SETUP.md) for Docker deployment instructions.

## Key Files to Customize

- `server/src/routes/*` - Add new API endpoints
- `src/components/*` - Modify UI components
- `server/src/migrations/*` - Database schema changes
- `server/.env` - Configuration settings

## Useful Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter

# Backend
cd server
npm run dev          # Start dev server
npm run build        # Build for production
npm run db:migrate   # Run migrations
npm run db:migrate:undo  # Rollback migration

# Database
mysql -u signcraft -p signcraft  # Connect to database
```

## Documentation

- **[README.md](README.md)** - Project overview
- **[SETUP.md](SETUP.md)** - Detailed setup guide
- **[API.md](API.md)** - Complete API reference
- **[DATABASE.md](DATABASE.md)** - Database schema

## Support

### Check Logs

**Backend logs:**
Watch Terminal 1 for error messages.

**Frontend logs:**
Open browser DevTools (F12) → Console tab.

**MySQL logs:**
```bash
# Find MySQL error log location
mysql -u root -p -e "SHOW VARIABLES LIKE 'log_error';"
tail -f /path/to/error.log
```

### Test Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Verify Database

```bash
mysql -u signcraft -p signcraft

# In MySQL:
SHOW TABLES;
# Should show 11 tables

SELECT COUNT(*) FROM screens;
# Should show your registered screens
```

---

You're all set! Start building your digital signage network with SignCraft! 🚀
