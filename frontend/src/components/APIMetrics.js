import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const APIMetrics = ({ endpoint, timeRange }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const data = await api.getMetricsSummary();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch API metrics summary');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(intervalId);
  }, [endpoint, timeRange]);

  const getStatusClass = (successRate) => {
    if (successRate >= 99) return 'status-healthy';
    if (successRate >= 95) return 'status-warning';
    return 'status-critical';
  };

  const chartData = {
    labels: ['Success', 'Errors', 'Timeouts'],
    datasets: [
      {
        data: metrics ? [metrics.successCount, metrics.errorCount, metrics.timeoutCount] : [0, 0, 0],
        backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    cutout: '70%',
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">API Health Summary</h2>
        {!loading && !error && metrics && (
          <span className={`status ${getStatusClass(metrics.successRate)}`}>
            {metrics.successRate >= 99 ? 'Healthy' : metrics.successRate >= 95 ? 'Warning' : 'Critical'}
          </span>
        )}
      </div>

      {loading ? (
        <div className="loading-indicator">Loading metrics...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : metrics ? (
        <div className="metrics-summary">
          <div className="chart-container" style={{ height: '200px' }}>
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          
          <div className="metrics-grid">
            <div className="metric-item">
              <h3>Success Rate</h3>
              <p>{metrics.successRate.toFixed(2)}%</p>
            </div>
            <div className="metric-item">
              <h3>Total Requests</h3>
              <p>{metrics.totalRequests}</p>
            </div>
            <div className="metric-item">
              <h3>Avg. Response Time</h3>
              <p>{metrics.avgResponseTime.toFixed(2)} ms</p>
            </div>
            <div className="metric-item">
              <h3>Peak Response Time</h3>
              <p>{metrics.peakResponseTime} ms</p>
            </div>
          </div>
        </div>
      ) : (
        <div>No data available</div>
      )}
    </div>
  );
};

export default APIMetrics;