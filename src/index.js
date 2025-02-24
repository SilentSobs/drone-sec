import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';

import SecurityDashboard from './SecurityDashboard';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SecurityDashboard/>
  </React.StrictMode>
);

