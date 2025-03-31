// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const winston = require('winston');

// Import routes
const apiRoutes = require('./routes/api');

// Initialize express app
const app = express();

// Setup middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json());

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ],
});

// Setup request logger middleware
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Performance monitoring middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  
  // Log request details
  logger.info({
    type: 'request',
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Capture response metrics when the request completes
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const status = res.statusCode;
    
    logger.info({
      type: 'response',
      method: req.method,
      path: req.path,
      status,
      duration,
      size: res.get('Content-Length') || 0
    });
    
    // Save metrics to database
    require('./utils/metricsCollector').recordMetric({
      endpoint: req.path,
      method: req.method,
      responseTime: duration,
      statusCode: status,
      timestamp: new Date()
    });
  });
  
  next();
});

// Routes
app.use('/api', apiRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => {
    logger.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;