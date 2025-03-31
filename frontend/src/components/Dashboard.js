import React, { useState, useEffect } from 'react';
import APIMetrics from './APIMetrics';
import ErrorRates from './ErrorRates';
import ResponseTimes from './ResponseTimes';
import LogViewer from './LogViewer';
import api from '../services/api';

const Dashboard = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [endpoints, setEndpoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEndpoints = async () => {
      try {
        const data = await api.getEndpoints();
        setEndpoints(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch available endpoints');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEndpoints();
  }, []);

  const handleEndpointChange = (e) => {
    setSelectedEndpoint(e.target.value);
  };

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-controls">
        <div className="filter-controls">
          <select value={selectedEndpoint} onChange={handleEndpointChange}>
            <option value="all">All Endpoints</option>
            {endpoints.map(endpoint => (
              <option key={endpoint.id} value={endpoint.path}>
                {endpoint.path}
              </option>
            ))}
          </select>
          
          <select value={timeRange} onChange={handleTimeRangeChange}>
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        {error && !isLoading && <div className="error-banner">
          Note: Using mock data for visualization. Backend connection failed.
        </div>}
      </div>

      <div className="dashboard-grid">
        <APIMetrics 
          endpoint={selectedEndpoint} 
          timeRange={timeRange} 
        />
        <ErrorRates 
          endpoint={selectedEndpoint} 
          timeRange={timeRange} 
        />
        <ResponseTimes 
          endpoint={selectedEndpoint} 
          timeRange={timeRange} 
        />
      </div>

      <LogViewer 
        endpoint={selectedEndpoint} 
        timeRange={timeRange} 
      />
    </div>
  );
};

export default Dashboard;