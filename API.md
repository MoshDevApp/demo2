# SignCraft API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

All API endpoints (except auth endpoints) require JWT authentication via Bearer token.

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Authentication Endpoints

### Login

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "tenant_admin"
  }
}
```

### Register

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "My Company"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "tenant_admin"
  }
}
```

---

## Screen Management Endpoints

### List All Screens

```http
GET /api/screens?status=online&provider=signcraft_player&search=lobby
```

**Query Parameters:**
- `status` (optional): Filter by status (online, offline, error, maintenance)
- `provider` (optional): Filter by provider (signcraft_player, screencloud, yodeck, etc.)
- `search` (optional): Search by name, device_id, or location_name

**Response:**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "device_id": "SCREEN-001",
    "name": "Lobby Display",
    "provider": "signcraft_player",
    "screen_width": 1920,
    "screen_height": 1080,
    "orientation": "landscape",
    "location_name": "Main Lobby",
    "location_latitude": 40.7128,
    "location_longitude": -74.0060,
    "timezone": "America/New_York",
    "tags": ["lobby", "reception"],
    "status": "online",
    "last_heartbeat": "2024-01-15T10:30:00Z",
    "player_version": "1.0.0",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### Get Screen Details

```http
GET /api/screens/:id
```

**Response:**
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "device_id": "SCREEN-001",
  "name": "Lobby Display",
  "provider": "signcraft_player",
  "provider_device_id": null,
  "screen_width": 1920,
  "screen_height": 1080,
  "orientation": "landscape",
  "location_name": "Main Lobby",
  "location_address": "123 Main St, New York, NY",
  "location_latitude": 40.7128,
  "location_longitude": -74.0060,
  "timezone": "America/New_York",
  "tags": ["lobby", "reception"],
  "status": "online",
  "last_heartbeat": "2024-01-15T10:30:00Z",
  "connection_token": "encrypted_token",
  "player_version": "1.0.0",
  "device_info": {
    "os": "Windows 11",
    "cpu": "Intel i5",
    "memory_gb": 8
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Register New Screen

```http
POST /api/screens
```

**Request Body:**
```json
{
  "device_id": "SCREEN-001",
  "name": "Lobby Display",
  "provider": "signcraft_player",
  "screen_width": 1920,
  "screen_height": 1080,
  "orientation": "landscape",
  "location_name": "Main Lobby",
  "location_address": "123 Main St, New York, NY",
  "location_latitude": 40.7128,
  "location_longitude": -74.0060,
  "timezone": "America/New_York",
  "tags": ["lobby", "reception"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "device_id": "SCREEN-001",
  "name": "Lobby Display",
  "connection_token": "generated_token_for_player",
  "status": "offline",
  ...
}
```

**Notes:**
- `connection_token` is returned once upon creation for player authentication
- Screen starts in `offline` status until first heartbeat

### Update Screen

```http
PUT /api/screens/:id
```

**Request Body:**
```json
{
  "name": "Updated Display Name",
  "location_name": "New Location",
  "tags": ["updated", "tags"],
  "status": "maintenance"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Updated Display Name",
  ...
}
```

### Delete Screen

```http
DELETE /api/screens/:id
```

**Response:**
```json
{
  "message": "Screen deleted successfully"
}
```

### Regenerate Connection Token

```http
POST /api/screens/:id/regenerate-token
```

**Response:**
```json
{
  "connection_token": "new_generated_token"
}
```

**Use Case:** When a screen's token is compromised or device is reassigned

### Get Screen Statistics

```http
GET /api/screens/:id/stats
```

**Response:**
```json
{
  "status": "online",
  "last_heartbeat": "2024-01-15T10:30:00Z",
  "uptime_ms": 3600000,
  "player_version": "1.0.0",
  "device_info": {
    "os": "Windows 11",
    "cpu": "Intel i5",
    "memory_gb": 8
  }
}
```

---

## AI Design Endpoints

### Generate AI Image

```http
POST /api/design/ai/generate-image
```

**Request Body:**
```json
{
  "prompt": "A professional office lobby with modern furniture",
  "style": "professional",
  "size": "1024x1024",
  "n": 1
}
```

**Parameters:**
- `prompt` (required): Text description of desired image
- `style` (optional): Style preset (professional, modern, minimalist, vibrant, elegant)
- `size` (optional): Image size (1024x1024, 1792x1024, 1024x1792)
- `n` (optional): Number of images to generate (1-4)

**Response:**
```json
{
  "images": [
    {
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
      "revised_prompt": "A professional office lobby with modern furniture, featuring..."
    }
  ]
}
```

**Error Responses:**
```json
{
  "error": "OpenAI API key not configured",
  "message": "Please add OPENAI_API_KEY to your .env file"
}
```

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests to OpenAI API"
}
```

### Suggest Layout

```http
POST /api/design/ai/suggest-layout
```

**Request Body:**
```json
{
  "description": "A welcome screen for a corporate office with company logo, greeting message, and current time",
  "dimensions": "1920x1080",
  "orientation": "landscape"
}
```

**Response:**
```json
{
  "suggestion": {
    "layout": {
      "type": "header-content-footer",
      "sections": [
        { "name": "header", "height": 200 },
        { "name": "content", "height": 680 },
        { "name": "footer", "height": 200 }
      ]
    },
    "elements": [
      {
        "type": "image",
        "x": 50,
        "y": 50,
        "width": 200,
        "height": 100,
        "style": { "purpose": "logo" }
      },
      {
        "type": "text",
        "x": 300,
        "y": 400,
        "width": 1320,
        "height": 100,
        "style": {
          "fontSize": 72,
          "fontWeight": "bold",
          "textAlign": "center"
        }
      }
    ],
    "typography": {
      "heading": {
        "fontFamily": "Arial",
        "fontSize": 72,
        "fontWeight": "bold",
        "color": "#1a1a1a"
      },
      "body": {
        "fontFamily": "Arial",
        "fontSize": 36,
        "fontWeight": "normal",
        "color": "#333333"
      }
    },
    "colors": {
      "primary": "#0066cc",
      "secondary": "#4d4d4d",
      "accent": "#ff6600",
      "background": "#ffffff"
    },
    "tips": [
      "Keep logo in top-left for brand consistency",
      "Use large, readable fonts for viewing distance",
      "Maintain high contrast for readability"
    ]
  },
  "raw_response": "..."
}
```

### Generate Text

```http
POST /api/design/ai/generate-text
```

**Request Body:**
```json
{
  "prompt": "Create a welcoming message for hotel guests",
  "type": "headline",
  "maxLength": 100
}
```

**Parameters:**
- `prompt` (required): Description of text to generate
- `type` (optional): Text type (headline, description, cta)
- `maxLength` (optional): Maximum token length

**Response:**
```json
{
  "text": "Welcome to Paradise Hotel - Your Home Away From Home",
  "type": "headline"
}
```

### Optimize Design

```http
POST /api/design/ai/optimize-design
```

**Request Body:**
```json
{
  "design": {
    "elements": [
      {
        "type": "text",
        "fontSize": 12,
        "color": "#cccccc",
        "background": "#dddddd"
      }
    ]
  },
  "targetAudience": "corporate employees",
  "purpose": "information display"
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "category": "Accessibility",
      "issue": "Low contrast between text and background",
      "suggestion": "Increase contrast ratio to at least 4.5:1. Consider using #333333 text on #ffffff background.",
      "priority": "high"
    },
    {
      "category": "Typography",
      "issue": "Font size too small for distance viewing",
      "suggestion": "Increase font size to at least 36px for content readable from 10 feet away.",
      "priority": "high"
    },
    {
      "category": "Layout",
      "issue": "Elements not aligned to grid",
      "suggestion": "Align elements to an 8px grid for visual consistency.",
      "priority": "medium"
    }
  ],
  "analyzed_at": "2024-01-15T10:30:00Z"
}
```

### Generate AI Video

```http
POST /api/design/ai/generate-video
```

**Request Body:**
```json
{
  "prompt": "A calm ocean with gentle waves at sunset",
  "duration": 24,
  "width": 1024,
  "height": 576
}
```

**Parameters:**
- `prompt` (required): Text description of the desired video
- `duration` (optional): Number of frames (default: 24, ~3 seconds at 8fps)
- `width` (optional): Video width in pixels (default: 1024)
- `height` (optional): Video height in pixels (default: 576)

**Response:**
```json
{
  "video": {
    "url": "https://replicate.delivery/pbxt/xxxxx.mp4",
    "prompt": "A calm ocean with gentle waves at sunset",
    "revised_prompt": "A calm ocean with gentle waves at sunset, high quality, smooth motion, professional digital signage content, cinematic, 4k",
    "frames": 24,
    "dimensions": {
      "width": 1024,
      "height": 576
    }
  }
}
```

**Error Response (API token not configured):**
```json
{
  "error": "Replicate API token not configured",
  "message": "Please add REPLICATE_API_TOKEN to your .env file"
}
```

**Error Response (Rate limit):**
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests to Replicate API"
}
```

**Notes:**
- Uses Replicate's Zeroscope V2 XL model for text-to-video generation
- Generation takes approximately 60-90 seconds
- Video URL is temporary and should be downloaded/stored permanently
- Requires `REPLICATE_API_TOKEN` configured in backend `.env` file
- Cost: ~$0.05-0.10 per video generation

---

## Media Endpoints

### List Media

```http
GET /api/media
```

**Response:**
```json
[]
```

**Status:** Placeholder - Full implementation pending

### Upload Media

```http
POST /api/media
```

**Response:**
```json
{
  "error": "Not implemented yet"
}
```

**Status:** Placeholder - Full implementation pending

---

## Playlist Endpoints

### List Playlists

```http
GET /api/playlists
```

**Response:**
```json
[]
```

**Status:** Placeholder - Full implementation pending

### Create Playlist

```http
POST /api/playlists
```

**Response:**
```json
{
  "error": "Not implemented yet"
}
```

**Status:** Placeholder - Full implementation pending

---

## Schedule Endpoints

### List Schedules

```http
GET /api/schedules
```

**Response:**
```json
[]
```

**Status:** Placeholder - Full implementation pending

### Create Schedule

```http
POST /api/schedules
```

**Response:**
```json
{
  "error": "Not implemented yet"
}
```

**Status:** Placeholder - Full implementation pending

---

## WebSocket Events

### Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'jwt_token',           // For dashboard clients
    deviceToken: 'screen_token'   // For screen players
  }
});
```

### Events from Screen Players

#### Heartbeat

```javascript
socket.emit('screen:heartbeat', {
  playerVersion: '1.0.0',
  deviceInfo: {
    os: 'Windows 11',
    cpu: 'Intel i5',
    memory_gb: 8
  }
});

// Server responds with:
socket.on('heartbeat:ack', (data) => {
  console.log(data.timestamp);
});
```

#### Log Event

```javascript
socket.emit('screen:log', {
  type: 'info',
  message: 'Playlist changed',
  metadata: {
    playlistId: 'uuid',
    playlistName: 'Morning Content'
  }
});
```

#### Screenshot

```javascript
socket.emit('screen:screenshot', {
  screenshot: 'base64_encoded_image_data'
});
```

### Events to Dashboard Clients

#### Screen Status Change

```javascript
socket.on('screen:status', (data) => {
  console.log(data);
  // {
  //   screenId: 'uuid',
  //   status: 'offline',
  //   reason: 'heartbeat_timeout',
  //   timestamp: '2024-01-15T10:30:00Z'
  // }
});
```

#### Screen Log

```javascript
socket.on('screen:log', (data) => {
  console.log(data);
  // {
  //   screenId: 'uuid',
  //   type: 'info',
  //   message: 'Playlist changed',
  //   timestamp: '2024-01-15T10:30:00Z'
  // }
});
```

#### Screen List

```javascript
socket.emit('request:screen_list');

socket.on('screen_list', (screens) => {
  console.log(screens);
  // Array of screen objects
});
```

### Commands from Dashboard to Screens

```javascript
socket.emit('command:screen', {
  screenId: 'uuid',
  command: 'reload_playlist',
  payload: {
    playlistId: 'uuid'
  }
});

socket.on('command:sent', (data) => {
  console.log(data);
  // { screenId: 'uuid', command: 'reload_playlist', status: 'sent' }
});

socket.on('command:error', (data) => {
  console.error(data);
  // { screenId: 'uuid', error: 'Screen not found' }
});
```

#### Available Commands

- `reload_playlist` - Force reload current playlist
- `restart_player` - Restart player application
- `clear_cache` - Clear local media cache
- `take_screenshot` - Request screenshot
- `update_settings` - Update player settings

### Events Received by Screens

```javascript
socket.on('command', (data) => {
  console.log(data);
  // {
  //   command: 'reload_playlist',
  //   payload: { playlistId: 'uuid' },
  //   timestamp: '2024-01-15T10:30:00Z'
  // }
});
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation error",
  "details": "Email is required"
}
```

### 401 Unauthorized

```json
{
  "error": "Access token required"
}
```

### 403 Forbidden

```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found

```json
{
  "error": "Screen not found"
}
```

### 409 Conflict

```json
{
  "error": "Screen with this device ID already exists"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "stack": "..." // Only in development mode
}
```

### 503 Service Unavailable

```json
{
  "error": "OpenAI API key not configured",
  "message": "Please add OPENAI_API_KEY to your .env file"
}
```

---

## Rate Limiting

Currently not implemented. Future implementation will use Redis-based rate limiting:
- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated endpoints

---

## Pagination

For endpoints returning large datasets (future implementation):

```http
GET /api/screens?page=1&limit=50
```

**Response Headers:**
```
X-Total-Count: 1000
X-Page: 1
X-Per-Page: 50
X-Total-Pages: 20
```

---

## Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# List screens (replace TOKEN)
curl http://localhost:3001/api/screens \
  -H "Authorization: Bearer TOKEN"

# Register screen
curl -X POST http://localhost:3001/api/screens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "device_id": "TEST-001",
    "name": "Test Screen",
    "screen_width": 1920,
    "screen_height": 1080
  }'

# Generate AI image
curl -X POST http://localhost:3001/api/design/ai/generate-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "prompt": "A modern office lobby",
    "style": "professional"
  }'

# Generate AI video
curl -X POST http://localhost:3001/api/design/ai/generate-video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "prompt": "Gentle ocean waves at sunset",
    "duration": 24,
    "width": 1024,
    "height": 576
  }'
```

### Using JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});
const { token } = await loginResponse.json();

// List screens
const screensResponse = await fetch('http://localhost:3001/api/screens', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const screens = await screensResponse.json();

// Generate AI image
const imageResponse = await fetch('http://localhost:3001/api/design/ai/generate-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    prompt: 'A professional welcome screen',
    style: 'modern'
  })
});
const { images } = await imageResponse.json();

// Generate AI video
const videoResponse = await fetch('http://localhost:3001/api/design/ai/generate-video', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    prompt: 'Gentle ocean waves at sunset',
    duration: 24,
    width: 1024,
    height: 576
  })
});
const { video } = await videoResponse.json();
console.log('Video URL:', video.url);
```

---

## Version History

- **v1.1.0** (2024-12-19)
  - Added AI video generation endpoint using Replicate Zeroscope V2 XL
  - Enhanced AI design capabilities with text-to-video generation
  - Added support for Replicate API integration

- **v1.0.0** (2024-01-15)
  - Initial API release
  - Screen management endpoints
  - AI design endpoints (image, text, layout)
  - WebSocket real-time communication
  - JWT authentication

---

For detailed setup instructions, see [SETUP.md](SETUP.md)

For database schema, see [DATABASE.md](DATABASE.md)

For AI video generation details, see [AI_VIDEO_GENERATION.md](AI_VIDEO_GENERATION.md)
