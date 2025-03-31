// models/LogEntry.js
const mongoose = require('mongoose');

const LogEntrySchema = new mongoose.Schema({
  endpoint: {
    type: String,
    index: true
  },
  requestId: {
    type: String,
    index: true
  },
  level: {
    type: String,
    enum: ['error', 'warn', 'info', 'debug'],
    default: 'info'
  },
  message: {
    type: String,
    required: true
  },
  context: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('LogEntry', LogEntrySchema);