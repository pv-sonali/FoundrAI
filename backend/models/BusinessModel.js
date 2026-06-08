const mongoose = require('mongoose');

const BusinessModelSchema = new mongoose.Schema({
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
  keyPartners: [String],
  keyActivities: [String],
  keyResources: [String],
  valuePropositions: [String],
  customerRelationships: [String],
  channels: [String],
  customerSegments: [String],
  costStructure: [String],
  revenueStreams: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BusinessModel', BusinessModelSchema);
