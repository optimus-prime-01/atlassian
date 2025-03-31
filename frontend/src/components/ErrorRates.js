import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ErrorRates = ({ endpoint, timeRange }) => {
  const [errorData, setErrorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchErrorRates = async () => {
      setLoading(true);
      try {
        const data = await api.getErrorRates(endpoint, timeRange);
        setErrorData(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch error rates');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchErrorRates();
    
    // Set up polling every 60 seconds
    const intervalId = setInterval(fetchErrorRates, 60000);
    
    return () => clearInterval(intervalId);
  }, [endpoint, timeRange]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Error Rate (%)',
        },
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
  };

  // Simulated data if API call fails
  const getDefaultChartData = () => {
    return {
      labels: ['12am', '4am', '8am', '12pm', '4pm', '8pm'],
      datasets: [
        {
          label: 'HTTP 4xx Errors',
          data: [1.2, 0.8, 1.5, 2.1, 1.0, 0.5],
          borderColor: '#f44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'HTTP 5xx Errors',
          data: [0.5, 0.3, 0.2, 0.8, 1.2, 0.4],
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const chartData = errorData
    ? {
        labels: errorData.timestamps,
        datasets: [
          {
            label: 'HTTP 4xx Errors',
            data: errorData.client_errors,
            borderColor: '#f44336',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'HTTP 5xx Errors',
            data: errorData.server_errors,
            borderColor: '#ff9800',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      }
    : getDefaultChartData();

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Error Rates</h2>
      </div>

      {loading ? (
        <div className="loading-indicator">Loading error data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="chart-container" style={{ height: '300px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {!loading && !error && errorData && errorData.top_errors && (
        <div className="top-errors">
          <h3>Top Errors</h3>
          <table>
            <thead>
              <tr>
                <th>Error Type</th>
                <th>Count</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {errorData.top_errors.map((err, index) => (
                <tr key={index}>
                  <td>{err.type}</td>
                  <td>{err.count}</td>
                  <td>{err.percentage.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ErrorRates;