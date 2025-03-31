// models/Metric.js
const mongoose = require('mongoose');

const MetricSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: true,
    index: true
  },
  method: {
    type: String,
    required: true
  },
  responseTime: {
    type: Number,
    required: true
  },
  statusCode: {
    type: Number,
    required: true
  },
  cpuUsage: {
    type: Number
  },
  memoryUsage: {
    type: Number
  },
  dbQueryTime: {
    type: Number
  },
  externalApiCalls: [{
    api: String,
    responseTime: Number,
    statusCode: Number
  }],
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Add compound index for efficient querying
MetricSchema.index({ endpoint: 1, method: 1, timestamp: 1 });

module.exports = mongoose.model('Metric', MetricSchema);