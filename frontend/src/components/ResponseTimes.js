import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ResponseTimes = ({ endpoint, timeRange }) => {
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResponseTimes = async () => {
      setLoading(true);
      try {
        const data = await api.getResponseTimes(endpoint, timeRange);
        setResponseData(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch response times');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResponseTimes();
    
    // Set up polling every 60 seconds
    const intervalId = setInterval(fetchResponseTimes, 60000);
    
    return () => clearInterval(intervalId);
  }, [endpoint, timeRange]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} ms`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Response Time (ms)',
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
          label: 'Average',
          data: [150, 180, 220, 280, 250, 190],
          borderColor: '#4caf50',
          tension: 0.4,
        },
        {
          label: '95th Percentile',
          data: [300, 350, 420, 520, 480, 380],
          borderColor: '#ff9800',
          borderDash: [5, 5],
          tension: 0.4,
        },
      ],
    };
  };

  const chartData = responseData
    ? {
        labels: responseData.timestamps,
        datasets: [
          {
            label: 'Average',
            data: responseData.average,
            borderColor: '#4caf50',
            tension: 0.4,
          },
          {
            label: '95th Percentile',
            data: responseData.percentile95,
            borderColor: '#ff9800',
            borderDash: [5, 5],
            tension: 0.4,
          },
        ],
      }
    : getDefaultChartData();

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Response Times</h2>
      </div>

      {loading ? (
        <div className="loading-indicator">Loading response time data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="chart-container" style={{ height: '300px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {!loading && !error && responseData && responseData.bottlenecks && (
        <div className="bottlenecks">
          <h3>Performance Bottlenecks</h3>
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Avg. Time</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {responseData.bottlenecks.map((bottleneck, index) => (
                <tr key={index}>
                  <td>{bottleneck.component}</td>
                  <td>{bottleneck.average_time} ms</td>
                  <td>{bottleneck.percentage.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResponseTimes;