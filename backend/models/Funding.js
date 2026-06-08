const mongoose = require('mongoose');

const FundingSchema = new mongoose.Schema({
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
  grants: [
    {
      name: String,
      amount: String,
      description: String,
      link: String,
    },
  ],
  incubators: [
    {
      name: String,
      location: String,
      description: String,
      link: String,
    },
  ],
  angelInvestors: [
    {
      name: String,
      sector: String,
      ticketSize: String,
      location: String,
    },
  ],
  vcs: [
    {
      name: String,
      focus: String,
      averageTicket: String,
      link: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Funding', FundingSchema);
