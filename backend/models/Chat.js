const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup',
  },
  title: {
    type: String,
    required: true,
    default: 'New Mentorship Session',
  },
  messages: [
    {
      role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  saved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Chat', ChatSchema);
