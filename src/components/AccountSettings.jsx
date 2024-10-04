'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Edit2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AccountSettings = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  // Dark mode state initialized from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // User state: mock user data
  const [userData, setUserData] = useState({
    username: 'johndoe',
    email: 'john.doe@example.com',
    password: '********',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '',
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    privacy: {
      profileVisible: true,
      searchEngineIndex: false,
    },
  });

  const [editedData, setEditedData] = useState(userData); // To store the changes
  const [isEditing, setIsEditing] = useState(false); // To track if editing is in progress
  const [activeSection, setActiveSection] = useState('userDetails'); // Active section in sidebar

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
    const { name, value, type, checked } = e.target;

    if (name.startsWith('notifications') || name.startsWith('privacy')) {
      setEditedData({
        ...editedData,
        [name.split('.')[0]]: {
          ...editedData[name.split('.')[0]],
          [name.split('.')[1]]: type === 'checkbox' ? checked : value,
        },
      });
    } else {
      setEditedData({
        ...editedData,
        [name]: value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setUserData(editedData); // Save changes to the user data
    setIsEditing(false); // Exit edit mode
    // Add API call here to save the changes to a backend
  };

  // Sidebar section change
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setIsEditing(false); // Reset editing mode when changing sections
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
      <div className="relative z-10 flex">
        {/* Sidebar */}
        <motion.aside
          className={`w-64 p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sections</h2>
          <ul>
            <li className={`cursor-pointer p-2 rounded-md hover:bg-gray-200 ${activeSection === 'userDetails' ? 'bg-gray-200' : ''}`} onClick={() => handleSectionChange('userDetails')}>User Details</li>
            <li className={`cursor-pointer p-2 rounded-md hover:bg-gray-200 ${activeSection === 'profileSettings' ? 'bg-gray-200' : ''}`} onClick={() => handleSectionChange('profileSettings')}>Profile Settings</li>
            <li className={`cursor-pointer p-2 rounded-md hover:bg-gray-200 ${activeSection === 'notificationPreferences' ? 'bg-gray-200' : ''}`} onClick={() => handleSectionChange('notificationPreferences')}>Notification Preferences</li>
            <li className={`cursor-pointer p-2 rounded-md hover:bg-gray-200 ${activeSection === 'privacySettings' ? 'bg-gray-200' : ''}`} onClick={() => handleSectionChange('privacySettings')}>Privacy Settings</li>
          </ul>
        </motion.aside>

        {/* Main Content */}
        <motion.main
          className="flex-1 p-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Header */}
          <motion.header 
            className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`} 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back Button */}
            <button 
              onClick={() => navigate('/dashboard')} // Navigate to dashboard
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} mr-4`}
            >
              <ArrowLeft size={20} className={`${darkMode ? 'text-white' : 'text-gray-900'}`} />
            </button>
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

          {/* Dynamic Section Rendering */}
          {activeSection === 'userDetails' && (
            <div className={`p-4 mt-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
              <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>User Details</h2>
              <form onSubmit={handleSubmit}>
                {/* Username Field */}
                <div className="mb-4 relative">
                  <label htmlFor="username" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Username</label>
                  <input 
                    type="text" 
                    name="username" 
                    id="username" 
                    value={editedData.username} 
                    onChange={handleChange} 
                    className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring focus:ring-blue-500`} 
                    disabled={!isEditing} // Disable if not editing
                  />
                </div>
                {/* Email Field */}
                <div className="mb-4 relative">
                  <label htmlFor="email" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    id="email" 
                    value={editedData.email} 
                    onChange={handleChange} 
                    className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring focus:ring-blue-500`} 
                    disabled={!isEditing} // Disable if not editing
                  />
                </div>
                {/* Password Field */}
                <div className="mb-4 relative">
                  <label htmlFor="password" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                  <input 
                    type="password" 
                    name="password" 
                    id="password" 
                    value={editedData.password} 
                    onChange={handleChange} 
                    className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring focus:ring-blue-500`} 
                    disabled={!isEditing} // Disable if not editing
                  />
                </div>
                {/* Name Fields */}
                <div className="mb-4 flex space-x-4">
                  <div className="flex-1">
                    <label htmlFor="firstName" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>First Name</label>
                    <input 
                      type="text" 
                      name="firstName" 
                      id="firstName" 
                      value={editedData.firstName} 
                      onChange={handleChange} 
                      className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring focus:ring-blue-500`} 
                      disabled={!isEditing} // Disable if not editing
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="lastName" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Last Name</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      id="lastName" 
                      value={editedData.lastName} 
                      onChange={handleChange} 
                      className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring focus:ring-blue-500`} 
                      disabled={!isEditing} // Disable if not editing
                    />
                  </div>
                </div>
                {/* Phone Number Field */}
                <div className="mb-4 relative">
                  <label htmlFor="phoneNumber" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
                  <input 
                    type="text" 
                    name="phoneNumber" 
                    id="phoneNumber" 
                    value={editedData.phoneNumber} 
                    onChange={handleChange} 
                    className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring focus:ring-blue-500`} 
                    disabled={!isEditing} // Disable if not editing
                  />
                </div>
                {/* Edit Button */}
                <div className="mt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(!isEditing)} 
                    className={`px-4 py-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                  {isEditing && (
                    <button 
                      type="submit" 
                      className={`px-4 py-2 ml-2 rounded-md ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                    >
                      Save
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Profile Settings Section */}
          {activeSection === 'profileSettings' && (
            <div className={`p-4 mt-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
              <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Profile Settings</h2>
              <form onSubmit={handleSubmit}>
                {/* Profile Picture */}
                <div className="mb-4">
                  <label htmlFor="profilePicture" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Profile Picture</label>
                  <input 
                    type="file" 
                    name="profilePicture" 
                    id="profilePicture" 
                    onChange={handleChange} 
                    className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring focus:ring-blue-500`} 
                    disabled={!isEditing}
                  />
                </div>
                {/* Bio Field */}
                <div className="mb-4 relative">
                  <label htmlFor="bio" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bio</label>
                  <textarea 
                    name="bio" 
                    id="bio" 
                    value={editedData.bio || ''} 
                    onChange={handleChange} 
                    className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring focus:ring-blue-500`} 
                    disabled={!isEditing} 
                    rows={4}
                  />
                </div>
                {/* Edit Button */}
                <div className="mt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(!isEditing)} 
                    className={`px-4 py-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                  {isEditing && (
                    <button 
                      type="submit" 
                      className={`px-4 py-2 ml-2 rounded-md ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                    >
                      Save
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Notification Preferences Section */}
          {activeSection === 'notificationPreferences' && (
            <div className={`p-4 mt-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
              <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Notification Preferences</h2>
              <form onSubmit={handleSubmit}>
                {/* Email Notifications */}
                <div className="mb-4 flex items-center">
                  <input 
                    type="checkbox" 
                    name="notifications.email" 
                    id="emailNotifications" 
                    checked={editedData.notifications.email} 
                    onChange={handleChange} 
                    className="mr-2"
                    disabled={!isEditing}
                  />
                  <label htmlFor="emailNotifications" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Notifications</label>
                </div>
                {/* SMS Notifications */}
                <div className="mb-4 flex items-center">
                  <input 
                    type="checkbox" 
                    name="notifications.sms" 
                    id="smsNotifications" 
                    checked={editedData.notifications.sms} 
                    onChange={handleChange} 
                    className="mr-2"
                    disabled={!isEditing}
                  />
                  <label htmlFor="smsNotifications" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>SMS Notifications</label>
                </div>
                {/* Push Notifications */}
                <div className="mb-4 flex items-center">
                  <input 
                    type="checkbox" 
                    name="notifications.push" 
                    id="pushNotifications" 
                    checked={editedData.notifications.push} 
                    onChange={handleChange} 
                    className="mr-2"
                    disabled={!isEditing}
                  />
                  <label htmlFor="pushNotifications" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Push Notifications</label>
                </div>
                {/* Edit Button */}
                <div className="mt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(!isEditing)} 
                    className={`px-4 py-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                  {isEditing && (
                    <button 
                      type="submit" 
                      className={`px-4 py-2 ml-2 rounded-md ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                    >
                      Save
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Privacy Settings Section */}
          {activeSection === 'privacySettings' && (
            <div className={`p-4 mt-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
              <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Privacy Settings</h2>
              <form onSubmit={handleSubmit}>
                {/* Profile Visible */}
                <div className="mb-4 flex items-center">
                  <input 
                    type="checkbox" 
                    name="privacy.profileVisible" 
                    id="profileVisible" 
                    checked={editedData.privacy.profileVisible} 
                    onChange={handleChange} 
                    className="mr-2"
                    disabled={!isEditing}
                  />
                  <label htmlFor="profileVisible" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Profile Visible</label>
                </div>
                {/* Search Engine Index */}
                <div className="mb-4 flex items-center">
                  <input 
                    type="checkbox" 
                    name="privacy.searchEngineIndex" 
                    id="searchEngineIndex" 
                    checked={editedData.privacy.searchEngineIndex} 
                    onChange={handleChange} 
                    className="mr-2"
                    disabled={!isEditing}
                  />
                  <label htmlFor="searchEngineIndex" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Allow Search Engines to Index My Profile</label>
                </div>
                {/* Edit Button */}
                <div className="mt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(!isEditing)} 
                    className={`px-4 py-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                  {isEditing && (
                    <button 
                      type="submit" 
                      className={`px-4 py-2 ml-2 rounded-md ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                    >
                      Save
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </motion.main>
      </div>
    </div>
  );
};

export default AccountSettings;
