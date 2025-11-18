# SwopTrader API

REST API server for the SwopTrader Android application.

https://swoptrader-api.onrender.com/health

<img width="1581" height="823" alt="image" src="https://github.com/user-attachments/assets/1ba958b3-b79c-4822-8b9c-c7123c8353c3" />


## Features

- **Users Management**: Create, read, update user profiles
- **Items Management**: CRUD operations for trading items
- **Offers System**: Handle trade offers and negotiations
- **Chat System**: Real-time messaging between users
- **Trade History**: Track completed trades and ratings
- **MongoDB Integration**: Persistent data storage
- **Security**: Rate limiting, CORS, Helmet security headers

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Environment Variables
Copy `env.example` to `.env` and update the values:
```bash
cp env.example .env
```

### 3. Set up MongoDB
- **Local**: Install MongoDB locally or use MongoDB Atlas (recommended)
- **Atlas**: Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)

### 4. Run the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Users
- `GET /api/v1/users/:userId` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:userId` - Update user

### Items
- `GET /api/v1/items` - Get all available items (with pagination, search, filters)
- `GET /api/v1/items/:itemId` - Get item by ID
- `POST /api/v1/items` - Create new item
- `PUT /api/v1/items/:itemId` - Update item
- `DELETE /api/v1/items/:itemId` - Soft delete item

### Offers
- `GET /api/v1/offers` - Get offers (with pagination, filters)
- `GET /api/v1/offers/:offerId` - Get offer by ID
- `POST /api/v1/offers` - Create new offer
- `PUT /api/v1/offers/:offerId` - Update offer

### Chats
- `GET /api/v1/chats?userId=:userId` - Get user's chats
- `GET /api/v1/chats/:chatId/messages` - Get chat messages
- `POST /api/v1/chats/:chatId/messages` - Send message

### Trade History
- `GET /api/v1/trades/history?userId=:userId` - Get user's trade history
- `POST /api/v1/trades/history` - Create trade history entry

### Push Notifications
- `POST /api/v1/notifications/token` - Register FCM device token
  - Body: `{ userId, token, deviceId? }`
  - Registers a Firebase Cloud Messaging token for push notifications
  
- `POST /api/v1/notifications/offers` - Send offer notification
  - Body: `{ offerId, recipientUserId, senderUserId, senderName, itemName?, message? }`
  - Sends a push notification when a user receives a new trade offer

## Deployment

### Render (Current)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `.` (leave empty or set to root)
4. Add environment variables in Render dashboard
5. Deploy automatically on git push

### Railway (Legacy)
1. Push code to GitHub
2. Connect Railway to your GitHub repo
3. Add environment variables in Railway dashboard
4. Deploy automatically

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 3000)
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)
- `NODE_ENV` - Environment (development/production)
- `FIREBASE_SERVICE_ACCOUNT` - Base64-encoded Firebase service account JSON (for push notifications)
- `FIREBASE_SERVICE_ACCOUNT_JSON` - Raw Firebase service account JSON (alternative to above)

**Firebase Setup for Push Notifications:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key (downloads JSON file)
3. Either:
   - Base64 encode the JSON: `base64 -i service-account.json` (or use online tool)
   - Set `FIREBASE_SERVICE_ACCOUNT` to the Base64 string
   - OR set `FIREBASE_SERVICE_ACCOUNT_JSON` to the raw JSON (escape quotes if needed)

## Database Schema

The API uses MongoDB with the following collections:
- `users` - User profiles and statistics
- `items` - Trading items
- `offers` - Trade offers and negotiations
- `chats` - Chat conversations
- `chatmessages` - Individual chat messages
- `tradehistories` - Completed trades

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Request body validation
- **Error Handling**: Comprehensive error responses
- **Firebase Admin SDK**: Secure push notification delivery

## Push Notifications

The API supports Firebase Cloud Messaging (FCM) for push notifications:

- **Device Token Registration**: Users register their FCM tokens via `/api/v1/notifications/token`
- **Offer Notifications**: Automatic notifications when offers are created
- **Offline Support**: Notifications are queued and delivered when device comes online
- **Multi-device Support**: Users can register multiple devices per account




