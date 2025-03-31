# Atlan Observability Dashboard

This project provides a frontend dashboard for the Atlan Platform Internship Challenge 2025, focused on API observability.

## Project Structure

```
frontend/
  ├── public/
  ├── src/
  │   ├── components/
  │   │   ├── Dashboard.js
  │   │   ├── APIMetrics.js
  │   │   ├── ErrorRates.js
  │   │   ├── ResponseTimes.js
  │   │   └── LogViewer.js
  │   ├── services/
  │   │   └── api.js
  │   ├── App.js
  │   └── index.js
  └── package.json
```

## Setup and Run

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm start
   ```

The frontend will run on http://localhost:3000 and will attempt to connect to the backend at http://localhost:5000/api.


## Features

- Real-time API metrics visualization
- Error rate tracking and analysis
- Response time monitoring
- Interactive log viewer with filtering
- Endpoint-specific filtering
- Time range selection

![image](https://github.com/user-attachments/assets/34a462a2-0216-4078-bea6-58e8aae662c3

![image](https://github.com/user-attachments/assets/45a97fb6-cf60-4029-8f15-5563302b2e9c)

