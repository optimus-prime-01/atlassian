// middleware/logger.js
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

// Create a Winston logger instance
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

// Middleware to add request ID and logging
const requestLogger = (req, res, next) => {
  // Add a unique request ID
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  
  // Add startTime to measure duration
  req.startTime = Date.now();
  
  // Log incoming request
  logger.info({
    requestId: req.requestId,
    type: 'request',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Log outgoing response
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    
    logger.info({
      requestId: req.requestId,
      type: 'response',
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0
    });
  });
  
  next();
};

module.exports = {
  logger,
  requestLogger
};