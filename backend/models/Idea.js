const mongoose = require('mongoose');

const IdeaSchema = new mongoose.Schema({
  startupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  marketOpportunity: {
    type: String,
    required: true,
  },
  swot: {
    strengths: [String],
    weaknesses: [String],
    opportunities: [String],
    threats: [String],
  },
  risks: [String],
  suggestions: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Idea', IdeaSchema);
