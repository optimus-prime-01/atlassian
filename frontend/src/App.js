import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Atlan Observability Dashboard</h1>
      </header>
      <main>
        {loading ? (
          <div className="loading">Loading dashboard...</div>
        ) : (
          <Dashboard />
        )}
      </main>
      <footer>
        <p>Atlan Platform Internship Challenge 2025</p>
      </footer>
    </div>
  );
}

export default App;