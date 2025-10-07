const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swoptrader';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
});

// Database schemas
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profileImageUrl: String,
  tradeScore: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  carbonSaved: { type: Number, default: 0 },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const itemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  condition: { type: String, required: true },
  images: [String],
  ownerId: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const offerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fromUserId: { type: String, required: true },
  toUserId: { type: String, required: true },
  requestedItemId: { type: String, required: true },
  offeredItemIds: [String],
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'EXPIRED', 'CANCELLED'], default: 'PENDING' },
  message: String,
  cashAmount: Number,
  meetup: {
    id: String,
    location: {
      name: String,
      address: String,
      latitude: Number,
      longitude: Number,
      type: String
    },
    scheduledAt: Number,
    meetupType: String,
    status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
    notes: String,
    completedAt: Number
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  participantIds: [String],
  offerId: String,
  itemId: String,
  itemName: String,
  lastMessageAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const chatMessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  chatId: { type: String, required: true },
  tradeId: String,
  senderId: { type: String, required: true },
  receiverId: String,
  message: { type: String, required: true },
  type: { type: String, enum: ['TEXT', 'IMAGE', 'OFFER', 'MEETUP'], default: 'TEXT' },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const tradeHistorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  offerId: { type: String, required: true },
  participantIds: [String],
  itemsTraded: [{
    itemId: String,
    userId: String,
    itemName: String,
    itemImage: String
  }],
  completedAt: { type: Date, required: true },
  meetupId: String,
  carbonSaved: { type: Number, default: 0 },
  tradeScoreEarned: { type: Number, default: 0 },
  rating: {
    rating: Number,
    comment: String,
    ratedBy: String,
    ratedAt: Date
  }
});

// Create models
const User = mongoose.model('User', userSchema);
const Item = mongoose.model('Item', itemSchema);
const Offer = mongoose.model('Offer', offerSchema);
const Chat = mongoose.model('Chat', chatSchema);
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
const TradeHistory = mongoose.model('TradeHistory', tradeHistorySchema);

// Create database indexes for better performance
const createIndexes = async () => {
  try {
    // User indexes
    await User.collection.createIndex({ "id": 1 }, { unique: true });
    await User.collection.createIndex({ "email": 1 }, { unique: true });
    await User.collection.createIndex({ "tradeScore": -1 }); // For leaderboards
    await User.collection.createIndex({ "level": -1 }); // For level-based queries
    await User.collection.createIndex({ "carbonSaved": -1 }); // For environmental leaderboards
    await User.collection.createIndex({ "createdAt": -1 }); // For recent users
    
    // Item indexes
    await Item.collection.createIndex({ "id": 1 }, { unique: true });
    await Item.collection.createIndex({ "ownerId": 1 }); // For user's items
    await Item.collection.createIndex({ "category": 1 }); // For category filtering
    await Item.collection.createIndex({ "isAvailable": 1 }); // For available items
    await Item.collection.createIndex({ "createdAt": -1 }); // For recent items
    await Item.collection.createIndex({ "name": "text", "description": "text" }); // For text search
    await Item.collection.createIndex({ "ownerId": 1, "isAvailable": 1 }); // Compound index
    
    // Offer indexes
    await Offer.collection.createIndex({ "id": 1 }, { unique: true });
    await Offer.collection.createIndex({ "fromUserId": 1 }); // For user's sent offers
    await Offer.collection.createIndex({ "toUserId": 1 }); // For user's received offers
    await Offer.collection.createIndex({ "status": 1 }); // For status filtering
    await Offer.collection.createIndex({ "requestedItemId": 1 }); // For item-based queries
    await Offer.collection.createIndex({ "createdAt": -1 }); // For recent offers
    await Offer.collection.createIndex({ "fromUserId": 1, "status": 1 }); // Compound index
    await Offer.collection.createIndex({ "toUserId": 1, "status": 1 }); // Compound index
    
    // Chat indexes
    await Chat.collection.createIndex({ "id": 1 }, { unique: true });
    await Chat.collection.createIndex({ "participantIds": 1 }); // For user's chats
    await Chat.collection.createIndex({ "lastMessageAt": -1 }); // For chat ordering
    await Chat.collection.createIndex({ "createdAt": -1 }); // For recent chats
    
    // ChatMessage indexes
    await ChatMessage.collection.createIndex({ "id": 1 }, { unique: true });
    await ChatMessage.collection.createIndex({ "chatId": 1 }); // For chat messages
    await ChatMessage.collection.createIndex({ "senderId": 1 }); // For user's messages
    await ChatMessage.collection.createIndex({ "timestamp": -1 }); // For message ordering
    await ChatMessage.collection.createIndex({ "chatId": 1, "timestamp": -1 }); // Compound index
    
    // TradeHistory indexes
    await TradeHistory.collection.createIndex({ "id": 1 }, { unique: true });
    await TradeHistory.collection.createIndex({ "participantIds": 1 }); // For user's trades
    await TradeHistory.collection.createIndex({ "completedAt": -1 }); // For recent trades
    await TradeHistory.collection.createIndex({ "offerId": 1 }); // For offer-based queries
    await TradeHistory.collection.createIndex({ "carbonSaved": -1 }); // For environmental stats
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
  }
};

// Create indexes when database connection is established
mongoose.connection.once('open', createIndexes);

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    message: 'SwopTrader API is running!'
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Users routes
app.get('/api/v1/users/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.userId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/v1/users/:userId', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { id: req.params.userId }, 
      { ...req.body, updatedAt: new Date() }, 
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Items routes
app.get('/api/v1/items', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, ownerId } = req.query;
    const query = { isAvailable: true };
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (ownerId) query.ownerId = ownerId;
    
    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Item.countDocuments(query);
    
    res.json({ 
      success: true, 
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/items/:itemId', async (req, res) => {
  try {
    const item = await Item.findOne({ id: req.params.itemId });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/items', async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/v1/items/:itemId', async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate(
      { id: req.params.itemId }, 
      { ...req.body, updatedAt: new Date() }, 
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/v1/items/:itemId', async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate(
      { id: req.params.itemId }, 
      { isAvailable: false, updatedAt: new Date() }, 
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Offers routes
app.get('/api/v1/offers', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (userId) {
      query.$or = [
        { fromUserId: userId },
        { toUserId: userId }
      ];
    }
    
    const offers = await Offer.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Offer.countDocuments(query);
    
    res.json({ 
      success: true, 
      data: offers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/offers/:offerId', async (req, res) => {
  try {
    const offer = await Offer.findOne({ id: req.params.offerId });
    if (!offer) {
      return res.status(404).json({ success: false, error: 'Offer not found' });
    }
    res.json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/offers', async (req, res) => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/v1/offers/:offerId', async (req, res) => {
  try {
    const offer = await Offer.findOneAndUpdate(
      { id: req.params.offerId }, 
      { ...req.body, updatedAt: new Date() }, 
      { new: true }
    );
    if (!offer) {
      return res.status(404).json({ success: false, error: 'Offer not found' });
    }
    res.json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chat routes
app.get('/api/v1/chats', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }
    
    const chats = await Chat.find({ 
      participantIds: userId,
      isActive: true 
    }).sort({ lastMessageAt: -1 });
    
    res.json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/chats/:chatId/messages', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const messages = await ChatMessage.find({ chatId: req.params.chatId })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/chats/:chatId/messages', async (req, res) => {
  try {
    const message = new ChatMessage({
      ...req.body,
      chatId: req.params.chatId
    });
    await message.save();
    
    // Update chat's lastMessageAt
    await Chat.findOneAndUpdate(
      { id: req.params.chatId },
      { lastMessageAt: new Date() }
    );
    
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trade History routes
app.get('/api/v1/trades/history', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }
    
    const trades = await TradeHistory.find({ 
      participantIds: userId 
    }).sort({ completedAt: -1 });
    
    res.json({ success: true, data: trades });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/trades/history', async (req, res) => {
  try {
    const trade = new TradeHistory(req.body);
    await trade.save();
    res.status(201).json({ success: true, data: trade });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin endpoint to clean up items not attributed to users
app.delete('/api/v1/admin/cleanup-orphaned-items', async (req, res) => {
  try {
    // Get all unique ownerIds from items
    const itemsWithOwners = await Item.distinct('ownerId');
    
    // Get all user IDs
    const allUsers = await User.distinct('id');
    
    // Find ownerIds that don't exist in users collection
    const orphanedOwnerIds = itemsWithOwners.filter(ownerId => !allUsers.includes(ownerId));
    
    if (orphanedOwnerIds.length === 0) {
      return res.json({
        success: true,
        message: 'No orphaned items found',
        deletedCount: 0
      });
    }
    
    // Delete items with orphaned ownerIds
    const deleteResult = await Item.deleteMany({
      ownerId: { $in: orphanedOwnerIds }
    });
    
    res.json({
      success: true,
      message: `Cleaned up ${deleteResult.deletedCount} orphaned items`,
      deletedCount: deleteResult.deletedCount,
      orphanedOwnerIds: orphanedOwnerIds
    });
    
  } catch (error) {
    console.error('Error cleaning up orphaned items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clean up orphaned items'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SwopTrader API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api/v1`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});


