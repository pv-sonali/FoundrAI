const mongoose = require('mongoose');

const CompetitorSchema = new mongoose.Schema({
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
  competitors: [
    {
      name: { type: String, required: true },
      strengths: [String],
      weaknesses: [String],
      pricing: String,
      marketGaps: [String],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Competitor', CompetitorSchema);
