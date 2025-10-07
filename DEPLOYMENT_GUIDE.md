# Complete Deployment Guide

## 🚀 Quick Start (15 minutes)

### Step 1: Set up MongoDB Atlas (5 minutes)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free account → Choose **FREE M0 cluster**
3. Create database user (save username/password!)
4. Add IP address: **0.0.0.0/0** (allow all)
5. Get connection string from "Connect" → "Connect your application"

### Step 2: Deploy API to Railway (5 minutes)
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Push your code to GitHub:
   ```bash
   cd swoptrader-api
   git init
   git add .
   git commit -m "Initial API setup"
   git remote add origin https://github.com/yourusername/swoptrader-api.git
   git push -u origin main
   ```
4. In Railway: "New Project" → "Deploy from GitHub repo"
5. Select your repository
6. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/swoptrader?retryWrites=true&w=majority
   NODE_ENV=production
   ALLOWED_ORIGINS=*
   ```

### Step 3: Update Android App (5 minutes)
1. Get your Railway URL (e.g., `https://swoptrader-api-production.railway.app`)
2. Update `NetworkModule.kt`:
   ```kotlin
   private const val BASE_URL = "https://your-url.railway.app/api/v1/"
   ```
3. Build and test!

## 🧪 Testing Your API

### Health Check
```bash
curl https://your-url.railway.app/health
```

### Test Endpoints
```bash
# Get items
curl https://your-url.railway.app/api/v1/items

# Create a user
curl -X POST https://your-url.railway.app/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"id":"user1","name":"Test User","email":"test@example.com"}'

# Get user
curl https://your-url.railway.app/api/v1/users/user1
```

## 📱 Android Integration

### Option 1: Gradual Migration (Recommended)
Keep using Firestore for now, but add API as backup:
```kotlin
// In your repository
override suspend fun getAllItems(): Result<List<Item>> {
    return try {
        // Try API first
        apiRepository.getAllItems()
    } catch (e: Exception) {
        // Fallback to Firestore
        firestoreRepository.getAllItems()
    }
}
```

### Option 2: Full Migration
Replace repository implementations:
```kotlin
// In DatabaseModule.kt
@Provides
@Singleton
fun provideItemRepository(api: SwopTraderApi): ItemRepository {
    return ApiItemRepository(api) // Instead of ItemRepositoryImpl
}
```

## 🔧 Environment Variables

### Required
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `NODE_ENV` - Set to "production" for deployment

### Optional
- `PORT` - Server port (default: 3000)
- `ALLOWED_ORIGINS` - CORS origins (default: *)

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/items` | Get all items |
| POST | `/api/v1/items` | Create item |
| GET | `/api/v1/items/:id` | Get item by ID |
| PUT | `/api/v1/items/:id` | Update item |
| DELETE | `/api/v1/items/:id` | Delete item |
| GET | `/api/v1/users/:id` | Get user by ID |
| POST | `/api/v1/users` | Create user |
| PUT | `/api/v1/users/:id` | Update user |
| GET | `/api/v1/offers` | Get offers |
| POST | `/api/v1/offers` | Create offer |
| GET | `/api/v1/chats?userId=:id` | Get user's chats |
| GET | `/api/v1/chats/:id/messages` | Get chat messages |
| POST | `/api/v1/chats/:id/messages` | Send message |
| GET | `/api/v1/trades/history?userId=:id` | Get trade history |
| POST | `/api/v1/trades/history` | Create trade history |

## 🚨 Troubleshooting

### API not responding
1. Check Railway logs: Project → Deployments → View Logs
2. Verify environment variables are set
3. Test MongoDB connection string

### Android build errors
1. Check BASE_URL is correct
2. Verify API endpoints match your interface
3. Check network permissions in AndroidManifest.xml

### Database connection issues
1. Verify MongoDB Atlas cluster is running
2. Check IP whitelist includes 0.0.0.0/0
3. Verify username/password are correct

## 🎯 Next Steps

1. **Test thoroughly** - Use the test endpoints above
2. **Monitor usage** - Check Railway metrics
3. **Add authentication** - Implement JWT tokens
4. **Add real-time features** - WebSocket for chat
5. **Scale up** - Upgrade Railway plan if needed

## 💰 Costs

- **MongoDB Atlas**: Free (M0 cluster)
- **Railway**: Free (500 hours/month)
- **Total**: $0/month for development

## 🔒 Security Notes

- Change default CORS settings for production
- Add authentication/authorization
- Use HTTPS only
- Validate all inputs
- Rate limiting is already implemented

## 📞 Support

If you encounter issues:
1. Check Railway logs first
2. Verify MongoDB Atlas connection
3. Test API endpoints manually
4. Check Android network permissions

Your API should be live at: `https://your-url.railway.app`

