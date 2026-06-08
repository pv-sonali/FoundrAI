const mongoose = require('mongoose');

const RiskCategorySchema = new mongoose.Schema({
  score: { type: Number, required: true, min: 0, max: 100 },
  factors: [String],
  mitigations: [String],
});

const RiskSchema = new mongoose.Schema({
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
  technical: RiskCategorySchema,
  market: RiskCategorySchema,
  financial: RiskCategorySchema,
  legal: RiskCategorySchema,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Risk', RiskSchema);
