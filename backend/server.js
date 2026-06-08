require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { rateLimiter } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const startupRoutes = require('./routes/startups');
const aiRoutes = require('./routes/ai');
const taskRoutes = require('./routes/tasks');
const adminRoutes = require('./routes/admin');

// Initialize app
const app = express();

// Middleware
app.use(cors({
  origin: '*', // For demo / local workspace connections
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Global Rate Limiter: max 200 requests per 15 mins for security
app.use(rateLimiter(200, 15 * 60 * 1000));

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || process.env.MONDO_URI || 'mongodb://127.0.0.1:27017/foundrai';
console.log('Connecting to database...');
mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch((err) => {
    console.error('Critical Database connection error on primary URI:', err.message);
    const fallbackUri = 'mongodb://127.0.0.1:27017/foundrai';
    if (mongoUri !== fallbackUri) {
      console.log(`Attempting fallback to local MongoDB: ${fallbackUri}`);
      mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 5000 })
        .then(() => console.log('Successfully connected to local MongoDB fallback.'))
        .catch((fallbackErr) => {
          console.error('Failed to connect to local MongoDB fallback:', fallbackErr.message);
        });
    }
  });

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);

// Base Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'FoundrAI Enterprise SaaS API is online.',
    time: new Date(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Exception:', err.stack);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal error occurred on the server.',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FoundrAI Server running on port ${PORT}`);
});
