const mongoose = require('mongoose');

const PitchDeckSchema = new mongoose.Schema({
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
  slides: [
    {
      slideNumber: { type: Number, required: true },
      title: { type: String, required: true },
      content: String,
      bulletPoints: [String],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PitchDeck', PitchDeckSchema);
