import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard'; // Update the path to point to the components folder
import DashboardHistory from './components/DashboardHistory'; // Update the path to point to the components folder

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/history" element={<DashboardHistory />} />
      </Routes>
    </Router>
  );
};

export default App;
