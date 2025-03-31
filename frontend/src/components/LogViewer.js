import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const LogViewer = ({ endpoint, timeRange }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logLevel, setLogLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const logContainerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const filters = {
          endpoint,
          timeRange,
          level: logLevel !== 'all' ? logLevel : undefined,
          search: searchQuery || undefined
        };
        
        const data = await api.getLogs(filters);
        setLogs(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch logs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    
    // Set up polling every 5 seconds
    const intervalId = setInterval(fetchLogs, 5000);
    
    return () => clearInterval(intervalId);
  }, [endpoint, timeRange, logLevel, searchQuery]);

  // Auto-scroll to bottom when new logs come in
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleLogLevelChange = (e) => {
    setLogLevel(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAutoScrollChange = () => {
    setAutoScroll(!autoScroll);
  };

  const getLogLevelClass = (level) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'log-level-error';
      case 'warn':
        return 'log-level-warn';
      case 'info':
        return 'log-level-info';
      case 'debug':
        return 'log-level-debug';
      default:
        return '';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Log Viewer</h2>
        <div className="toggle">
          <input
            type="checkbox"
            id="autoScroll"
            checked={autoScroll}
            onChange={handleAutoScrollChange}
          />
          <label htmlFor="autoScroll">Auto-scroll</label>
        </div>
      </div>
      
      <div className="filter-controls">
        <select value={logLevel} onChange={handleLogLevelChange}>
          <option value="all">All Levels</option>
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
        
        <input
          type="text"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {loading && logs.length === 0 ? (
        <div className="loading-indicator">Loading logs...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : logs.length === 0 ? (
        <div className="empty-message">No logs found</div>
      ) : (
        <div className="log-viewer" ref={logContainerRef}>
          {logs.map((log, index) => (
            <div key={index} className={`log-entry ${getLogLevelClass(log.level)}`}>
              <span className="log-timestamp">[{formatTimestamp(log.timestamp)}]</span>
              <span className="log-level">[{log.level.toUpperCase()}]</span>
              {log.endpoint && <span className="log-endpoint">[{log.endpoint}]</span>}
              <span className="log-message">{log.message}</span>
              {log.context && (
                <pre className="log-context">{JSON.stringify(log.context, null, 2)}</pre>
              )}
            </div>
          ))}
          {loading && <div className="loading-more">Loading more logs...</div>}
        </div>
      )}
    </div>
  );
};

export default LogViewer;