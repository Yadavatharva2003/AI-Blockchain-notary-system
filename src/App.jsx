import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EnhancedHomepage from './components/EnhancedHomepage';
import Dashboard from './components/Dashboard';
import DashboardHistory from './components/DashboardHistory';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EnhancedHomepage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<DashboardHistory />} />
      </Routes>
    </Router>
  );
};

export default App;
