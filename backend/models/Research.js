const mongoose = require('mongoose');

const ResearchSchema = new mongoose.Schema({
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
  tam: {
    type: Number, // in USD
    required: true,
  },
  sam: {
    type: Number, // in USD
    required: true,
  },
  som: {
    type: Number, // in USD
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  trends: [String],
  painPoints: [String],
  growthOpportunities: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Research', ResearchSchema);
