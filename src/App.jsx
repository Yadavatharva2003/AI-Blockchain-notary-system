import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EnhancedHomepage from './components/EnhancedHomepage';
import Dashboard from './components/Dashboard';
import DashboardHistory from './components/DashboardHistory';
import Login from './components/Login';
import SignUp from './components/SignUp';
import AboutUs from './components/AboutUs'; // Add this import
import AccountSettings from './components/AccountSettings'; // Add this import


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EnhancedHomepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<DashboardHistory />} />
        <Route path="/about" element={<AboutUs />} /> // Add this new route
        <Route path="/account-settings" element={<AccountSettings />} /> // Add this new route
      </Routes>
    </Router>
  );
};

export default App;
