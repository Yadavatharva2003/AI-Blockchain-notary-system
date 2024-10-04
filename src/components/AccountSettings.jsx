'use client'

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AccountSettings = () => {
  // Dark mode state initialized from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // User state: mock user data, can be replaced by actual data from backend
  const [userData, setUserData] = useState({
    username: 'johndoe',
    email: 'john.doe@example.com',
    password: '********',
  });

  const [editedData, setEditedData] = useState(userData); // To store the changes
  const [editableField, setEditableField] = useState(null); // To track which field is editable

  // Toggle dark mode and store the preference in localStorage
  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Apply dark mode class to the document root based on the state
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Handle input change for form fields
  const handleChange = (e) => {
    setEditedData({
      ...editedData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setUserData(editedData); // Save changes to the user data
    setEditableField(null); // Exit edit mode
    // Add API call here to save the changes to a backend
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-500`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-br ${darkMode ? 'from-blue-900 to-purple-900' : 'from-blue-500 to-purple-700'} opacity-20 animate-gradient-x`} />
        <div className={`absolute inset-0 bg-[url('/placeholder.svg?height=200&width=200')] bg-repeat ${darkMode ? 'opacity-3' : 'opacity-5'} animate-pan-background`} />
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path 
            fill={darkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(229, 231, 235, 0.7)'} 
            fillOpacity="1" 
            d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,128C672,128,768,160,864,181.3C960,203,1056,213,1152,202.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className="animate-wave"
          ></path>
        </svg>
      </div>

      {/* Page Content */}
      <div className="relative z-10">
        {/* Account Settings Header */}
        <motion.header 
          className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`} 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account Settings</h1>
          <button 
            onClick={handleToggleDarkMode} 
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
          >
            {darkMode ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-gray-800" />
            )}
          </button>
        </motion.header>

        {/* Main Content */}
        <motion.main
          className="p-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className={`p-4 mt-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
            <div className="mb-4 flex items-center justify-between">
              <label htmlFor="username" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Username</label>
              <button 
                type="button" 
                className={`text-gray-500 ${editableField === 'username' ? 'hidden' : 'block'}`}
                onClick={() => setEditableField('username')}
              >
                <Edit2 size={20} />
              </button>
            </div>
            <input 
              type="text"
              id="username"
              name="username"
              className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-md`}
              value={editedData.username}
              onChange={handleChange}
              disabled={editableField !== 'username'}
            />

            <div className="mb-4 flex items-center justify-between">
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
              <button 
                type="button" 
                className={`text-gray-500 ${editableField === 'email' ? 'hidden' : 'block'}`}
                onClick={() => setEditableField('email')}
              >
                <Edit2 size={20} />
              </button>
            </div>
            <input 
              type="email"
              id="email"
              name="email"
              className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-md`}
              value={editedData.email}
              onChange={handleChange}
              disabled={editableField !== 'email'}
            />

            <div className="mb-4 flex items-center justify-between">
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
              <button 
                type="button" 
                className={`text-gray-500 ${editableField === 'password' ? 'hidden' : 'block'}`}
                onClick={() => setEditableField('password')}
              >
                <Edit2 size={20} />
              </button>
            </div>
            <input 
              type="password"
              id="password"
              name="password"
              className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-md`}
              value={editedData.password}
              onChange={handleChange}
              disabled={editableField !== 'password'}
            />

            <div className="flex justify-between items-center mt-4">
              {editableField ? (
                <>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditableField(null)} 
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  onClick={() => setEditableField('username')} 
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Edit Settings
                </button>
              )}
            </div>
          </form>
        </motion.main>
      </div>
    </div>
  );
};

export default AccountSettings;
