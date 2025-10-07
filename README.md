# SwopTrader API

REST API server for the SwopTrader Android application.

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

## Deployment

### Railway (Recommended)
1. Push code to GitHub
2. Connect Railway to your GitHub repo
3. Add environment variables in Railway dashboard
4. Deploy automatically

### Render
1. Create new Web Service on Render
2. Connect GitHub repository
3. Add environment variables
4. Deploy

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 3000)
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)
- `NODE_ENV` - Environment (development/production)

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


