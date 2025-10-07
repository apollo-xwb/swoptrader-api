# Deployment Guide

## Quick Deployment to Railway

### 1. Prepare Your Code
- Make sure you have a `.env` file with your MongoDB connection string
- Test locally: `npm start`

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Initial API setup"
git remote add origin https://github.com/yourusername/swoptrader-api.git
git push -u origin main
```

### 3. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `swoptrader-api` repository
5. Railway will auto-detect Node.js and deploy

### 4. Set Environment Variables
In Railway dashboard:
- Go to your project → Variables tab
- Add these variables:
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/swoptrader?retryWrites=true&w=majority
  NODE_ENV=production
  ALLOWED_ORIGINS=*
  ```

### 5. Get Your API URL
- Railway will give you a URL like: `https://swoptrader-api-production.railway.app`
- Test it: `https://your-url.railway.app/health`

## Alternative: Render Deployment

### 1. Create Web Service
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Choose the `swoptrader-api` folder

### 2. Configure Build
- Build Command: `npm install`
- Start Command: `npm start`
- Environment: `Node`

### 3. Set Environment Variables
Same as Railway above.

## Testing Your Deployment

Once deployed, test these endpoints:
- Health: `GET https://your-url.railway.app/health`
- Items: `GET https://your-url.railway.app/api/v1/items`
- Users: `GET https://your-url.railway.app/api/v1/users/test-user-id`

## Update Android App

After deployment, update your Android app's `NetworkModule.kt`:
```kotlin
private const val BASE_URL = "https://your-url.railway.app/api/v1/"
```

