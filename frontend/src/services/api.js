// import axios from 'axios';

// // Base URL can be configured via environment variables
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// const api = {
//   // Get overall API metrics summary
//   getMetricsSummary: async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/metrics/summary`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching metrics summary:', error);
//       throw error;
//     }
//   },

//   // Get error rates for specific endpoints or overall
//   getErrorRates: async (endpoint, timeRange) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/metrics/errors`, {
//         params: { endpoint, timeRange }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching error rates:', error);
//       throw error;
//     }
//   },

//   // Get response times for specific endpoints or overall
//   getResponseTimes: async (endpoint, timeRange) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/metrics/response-times`, {
//         params: { endpoint, timeRange }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching response times:', error);
//       throw error;
//     }
//   },

//   // Get logs with optional filters
//   getLogs: async (filters) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/logs`, {
//         params: filters
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching logs:', error);
//       throw error;
//     }
//   },
  
//   // Get list of all available API endpoints being monitored
//   getEndpoints: async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/endpoints`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching endpoints:', error);
//       throw error;
//     }
//   }
// };

// export default api;


//i had hardcode for the api response for now

import axios from 'axios';

// Base URL can be configured via environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Mock data for when API calls fail
const mockData = {
  metricsSummary: {
    successRate: 98.2,
    totalRequests: 15423,
    successCount: 15145,
    errorCount: 218,
    timeoutCount: 60,
    avgResponseTime: 187.5,
    peakResponseTime: 2340
  },
  errorRates: {
    timestamps: ['12am', '2am', '4am', '6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'],
    client_errors: [1.2, 0.8, 0.5, 0.7, 1.5, 2.1, 1.8, 1.5, 1.0, 0.8, 0.5, 0.7],
    server_errors: [0.5, 0.3, 0.1, 0.2, 0.4, 0.8, 1.2, 0.9, 0.6, 0.4, 0.2, 0.1],
    top_errors: [
      { type: 'ValidationError', count: 82, percentage: 37.6 },
      { type: 'AuthenticationError', count: 45, percentage: 20.6 },
      { type: 'DatabaseTimeout', count: 36, percentage: 16.5 },
      { type: 'RateLimitExceeded', count: 30, percentage: 13.8 },
      { type: 'InternalServerError', count: 25, percentage: 11.5 }
    ]
  },
  responseTimes: {
    timestamps: ['12am', '2am', '4am', '6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'],
    average: [150, 145, 155, 170, 220, 270, 290, 260, 240, 210, 180, 160],
    percentile95: [320, 300, 310, 330, 420, 520, 580, 510, 480, 420, 380, 340],
    bottlenecks: [
      { component: 'Database Queries', average_time: 95, percentage: 41.3 },
      { component: 'External API Calls', average_time: 65, percentage: 28.3 },
      { component: 'Data Processing', average_time: 45, percentage: 19.6 },
      { component: 'Authentication', average_time: 25, percentage: 10.8 }
    ]
  },
  logs: [
    { timestamp: '2025-03-31T10:15:32.000Z', level: 'error', endpoint: '/api/users', message: 'Failed to connect to database - connection timeout', context: { attempt: 3, maxRetries: 5 } },
    { timestamp: '2025-03-31T10:15:30.000Z', level: 'warn', endpoint: '/api/products', message: 'Slow query detected (>500ms)', context: { query: 'SELECT * FROM products WHERE category IN (...)', time: 782 } },
    { timestamp: '2025-03-31T10:15:25.000Z', level: 'info', endpoint: '/api/auth', message: 'User logged in successfully', context: { userId: 'user_12345' } },
    { timestamp: '2025-03-31T10:15:20.000Z', level: 'debug', endpoint: '/api/search', message: 'Search query parameters', context: { term: 'smartphone', filters: { price: { min: 300, max: 1000 } } } },
    { timestamp: '2025-03-31T10:15:15.000Z', level: 'info', endpoint: '/api/metrics', message: 'Metrics collected successfully' },
    { timestamp: '2025-03-31T10:15:10.000Z', level: 'warn', endpoint: '/api/uploads', message: 'File size exceeds recommended limit', context: { size: '15MB', recommended: '10MB' } },
    { timestamp: '2025-03-31T10:15:05.000Z', level: 'error', endpoint: '/api/payments', message: 'Payment gateway connection failed', context: { gateway: 'stripe', errorCode: 'CONNECTION_ERROR' } },
    { timestamp: '2025-03-31T10:15:00.000Z', level: 'info', endpoint: '/api/notifications', message: 'Push notifications sent to 152 users' }
  ],
  endpoints: [
    { id: 1, path: '/api/users', description: 'User management' },
    { id: 2, path: '/api/products', description: 'Product catalog' },
    { id: 3, path: '/api/orders', description: 'Order processing' },
    { id: 4, path: '/api/payments', description: 'Payment processing' },
    { id: 5, path: '/api/auth', description: 'Authentication' }
  ]
};

// Helper to simulate network delay for mock data
const getMockDataWithDelay = (data, delay = 500) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
};

const api = {
  // Get overall API metrics summary
  getMetricsSummary: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/metrics/summary`);
      return response.data;
    } catch (error) {
      console.warn('Using mock data for metrics summary:', error);
      return getMockDataWithDelay(mockData.metricsSummary);
    }
  },

  // Get error rates for specific endpoints or overall
  getErrorRates: async (endpoint, timeRange) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/metrics/errors`, {
        params: { endpoint, timeRange }
      });
      return response.data;
    } catch (error) {
      console.warn('Using mock data for error rates:', error);
      return getMockDataWithDelay(mockData.errorRates);
    }
  },

  // Get response times for specific endpoints or overall
  getResponseTimes: async (endpoint, timeRange) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/metrics/response-times`, {
        params: { endpoint, timeRange }
      });
      return response.data;
    } catch (error) {
      console.warn('Using mock data for response times:', error);
      return getMockDataWithDelay(mockData.responseTimes);
    }
  },

  // Get logs with optional filters
  getLogs: async (filters) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/logs`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.warn('Using mock data for logs:', error);
      return getMockDataWithDelay(mockData.logs);
    }
  },
  
  // Get list of all available API endpoints being monitored
  getEndpoints: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/endpoints`);
      return response.data;
    } catch (error) {
      console.warn('Using mock data for endpoints:', error);
      return getMockDataWithDelay(mockData.endpoints);
    }
  }
};

export default api;