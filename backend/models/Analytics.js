const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: {
    type: String,
    required: true, // e.g., 'LOGIN', 'VALIDATE_IDEA', 'GENERATE_PITCH_DECK', 'AI_MENTOR_CHAT'
  },
  details: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  creditsUsed: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
