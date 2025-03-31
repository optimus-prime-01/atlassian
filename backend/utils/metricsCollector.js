// utils/metricsCollector.js
const Metric = require('../models/Metric');
const mongoose = require('mongoose');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'metrics-collector' },
  transports: [
    new winston.transports.File({ filename: 'logs/metrics.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ],
});

// Record a metric in the database
const recordMetric = async (metricData) => {
  try {
    const metric = new Metric(metricData);
    await metric.save();
    logger.debug(`Recorded metric for ${metricData.method} ${metricData.endpoint}`);
  } catch (error) {
    logger.error('Failed to record metric', { error: error.message, data: metricData });
  }
};

// Get aggregated metrics for dashboard display
const getAggregatedMetrics = async (filter = {}, timeRange = '24h') => {
  try {
    // Calculate the time range
    const endDate = new Date();
    let startDate;
    
    switch(timeRange) {
      case '1h':
        startDate = new Date(endDate - 60 * 60 * 1000);
        break;
      case '6h':
        startDate = new Date(endDate - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(endDate - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(endDate - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(endDate - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate - 24 * 60 * 60 * 1000);
    }
    
    // Set up the query filter with timerange
    const queryFilter = {
      ...filter,
      timestamp: { $gte: startDate, $lte: endDate }
    };
    
    // Run the aggregation pipeline
    const results = await Metric.aggregate([
      { $match: queryFilter },
      { $group: {
          _id: { 
            endpoint: "$endpoint", 
            method: "$method", 
            hour: { $hour: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
            month: { $month: "$timestamp" },
            year: { $year: "$timestamp" }
          },
          avgResponseTime: { $avg: "$responseTime" },
          maxResponseTime: { $max: "$responseTime" },
          minResponseTime: { $min: "$responseTime" },
          count: { $sum: 1 },
          errorCount: { 
            $sum: { 
              $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] 
            } 
          }
        }
      },
      { $project: {
          _id: 0,
          endpoint: "$_id.endpoint",
          method: "$_id.method",
          timestamp: { 
            $dateFromParts: { 
              year: "$_id.year", 
              month: "$_id.month", 
              day: "$_id.day", 
              hour: "$_id.hour" 
            } 
          },
          avgResponseTime: 1,
          maxResponseTime: 1,
          minResponseTime: 1,
          count: 1,
          errorCount: 1,
          errorRate: { 
            $multiply: [
              { $divide: ["$errorCount", "$count"] },
              100
            ]
          }
        }
      },
      { $sort: { timestamp: 1 } }
    ]);
    
    return results;
  } catch (error) {
    logger.error('Failed to get aggregated metrics', { error: error.message });
    throw error;
  }
};

// Get detailed metrics for a specific endpoint
const getEndpointMetrics = async (endpoint, method, timeRange = '24h') => {
  try {
    // Calculate the time range
    const endDate = new Date();
    let startDate;
    
    switch(timeRange) {
      case '1h':
        startDate = new Date(endDate - 60 * 60 * 1000);
        break;
      case '6h':
        startDate = new Date(endDate - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(endDate - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(endDate - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(endDate - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate - 24 * 60 * 60 * 1000);
    }
    
    const results = await Metric.find({
      endpoint,
      method,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 });
    
    return results;
  } catch (error) {
    logger.error('Failed to get endpoint metrics', { 
      error: error.message, 
      endpoint, 
      method 
    });
    throw error;
  }
};

module.exports = {
  recordMetric,
  getAggregatedMetrics,
  getEndpointMetrics
};