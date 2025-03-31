// controllers/metricsController.js
const metricsCollector = require('../utils/metricsCollector');
const { logger } = require('../middleware/logger');

// Get aggregated metrics
const getMetrics = async (req, res) => {
  try {
    const { endpoint, method, timeRange } = req.query;
    
    // Build filter object
    const filter = {};
    if (endpoint && endpoint !== 'all') {
      filter.endpoint = endpoint;
    }
    if (method) {
      filter.method = method;
    }
    
    const metrics = await metricsCollector.getAggregatedMetrics(filter, timeRange);
    
    res.json(metrics);
  } catch (error) {
    logger.error('Error in getMetrics', { error: error.message });
    res.status(500).json({ message: 'Error retrieving metrics', error: error.message });
  }
};

// Get detailed metrics for a specific endpoint
const getEndpointMetrics = async (req, res) => {
  try {
    const { endpoint, method, timeRange } = req.params;
    
    if (!endpoint) {
      return res.status(400).json({ message: 'Endpoint is required' });
    }
    
    const metrics = await metricsCollector.getEndpointMetrics(
      endpoint, 
      method || 'GET',
      timeRange || '24h'
    );
    
    res.json(metrics);
  } catch (error) {
    logger.error('Error in getEndpointMetrics', { error: error.message });
    res.status(500).json({ message: 'Error retrieving endpoint metrics', error: error.message });
  }
};

// Generate sample metrics data (for testing/demo)
const generateSampleData = async (req, res) => {
  try {
    const endpoints = [
      { path: '/api/users', method: 'GET' },
      { path: '/api/users', method: 'POST' },
      { path: '/api/products', method: 'GET' },
      { path: '/api/orders', method: 'POST' },
      { path: '/api/auth/login', method: 'POST' }
    ];
    
    const now = new Date();
    const data = [];
    
    // Generate 24 hours of data
    for (let i = 0; i < 24; i++) {
      const hourAgo = new Date(now);
      hourAgo.setHours(now.getHours() - i);
      
      // For each endpoint
      for (const endpoint of endpoints) {
        // Create 10-20 data points per hour per endpoint
        const count = 10 + Math.floor(Math.random() * 10);
        
        for (let j = 0; j < count; j++) {
          // Randomize timestamp within the hour
          const timestamp = new Date(hourAgo);
          timestamp.setMinutes(Math.floor(Math.random() * 60));
          
          // Base response time varies by endpoint
          let baseResponseTime;
          if (endpoint.path === '/api/products') {
            baseResponseTime = 250; // Slow endpoint
          } else if (endpoint.path === '/api/auth/login') {
            baseResponseTime = 100; // Medium endpoint
          } else {
            baseResponseTime = 50; // Fast endpoint
          }
          
          // Add random variation
          const responseTime = baseResponseTime + Math.floor(Math.random() * 100);
          
          // Most requests succeed, but some fail
          let statusCode;
          const r = Math.random();
          if (r > 0.95) {
            statusCode = 500; // Server error
          } else if (r > 0.9) {
            statusCode = 400; // Client error
          } else {
            statusCode = 200; // Success
          }
          
          // Create the metric
          const metric = {
            endpoint: endpoint.path,
            method: endpoint.method,
            responseTime,
            statusCode,
            timestamp
          };
          
          // Add to array
          data.push(metric);
        }
      }
    }
    
    // Save all metrics
    for (const metric of data) {
      await metricsCollector.recordMetric(metric);
    }
    
    res.json({ message: `Generated ${data.length} sample metrics` });
  } catch (error) {
    logger.error('Error generating sample data', { error: error.message });
    res.status(500).json({ message: 'Error generating sample data', error: error.message });
  }
};

module.exports = {
  getMetrics,
  getEndpointMetrics,
  generateSampleData
};