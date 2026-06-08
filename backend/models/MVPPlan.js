const mongoose = require('mongoose');

const MVPPlanSchema = new mongoose.Schema({
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
  features: {
    mustHave: [String],
    niceToHave: [String],
    future: [String],
  },
  milestones: [
    {
      title: { type: String, required: true },
      date: String,
      status: { type: String, enum: ['upcoming', 'completed'], default: 'upcoming' },
    },
  ],
  sprintPlan: [
    {
      title: { type: String, required: true },
      column: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
      priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MVPPlan', MVPPlanSchema);
