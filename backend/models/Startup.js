const mongoose = require('mongoose');

const StartupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
    required: true,
    trim: true,
  },
  targetAudience: {
    type: String,
    required: true,
    trim: true,
  },
  servingAs: [{
    type: String
  }],
  links: {
    type: Map,
    of: String
  },
  referralSource: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Startup', StartupSchema);
