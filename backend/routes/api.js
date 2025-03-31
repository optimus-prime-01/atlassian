// routes/api.js
const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');
const { requestLogger } = require('../middleware/logger');

// Add request logger middleware
router.use(requestLogger);

// Metrics routes
router.get('/metrics', metricsController.getMetrics);
router.get('/metrics/:endpoint/:method?', metricsController.getEndpointMetrics);

// Sample data generation (for testing)
router.post('/sample-data', metricsController.generateSampleData);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

module.exports = router;