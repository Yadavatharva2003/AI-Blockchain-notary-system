'use client'

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Download, Trash, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('fileName');
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const documentHistory = [
    { fileName: 'Document1.pdf', status: 'Verified', uploadDate: '2023-05-01', uploadTime: '10:00 AM' },
    { fileName: 'Document2.pdf', status: 'In Progress', uploadDate: '2023-05-02', uploadTime: '2:30 PM' },
    { fileName: 'Document3.pdf', status: 'Rejected', uploadDate: '2023-05-03', uploadTime: '4:15 PM' },
  ];

  // Filter and sort documents
  const filteredDocuments = documentHistory
    .filter(doc => doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'fileName') {
        return a.fileName.localeCompare(b.fileName);
      }
      return new Date(a.uploadDate) - new Date(b.uploadDate);
    });

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');  // This ensures redirection to Dashboard.jsx
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

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

      <div className="relative z-10">
        <div className="pt-12 pb-6 px-4 sm:px-6 lg:px-8">
          <motion.header 
            className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center">
              <button 
                onClick={handleBackToDashboard} 
                className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard History</h1>
              <button 
                onClick={handleToggleDarkMode} 
                className={`ml-auto p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
              >
                {darkMode ? (
                  <Sun size={20} className="text-yellow-500" />
                ) : (
                  <Moon size={20} className="text-gray-800" />
                )}
              </button>
            </div>
          </motion.header>
          <motion.main 
            className="max-w-7xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Search and Filter Section */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search by file name..."
                  className={`border border-gray-300 rounded-lg px-4 py-2 transition-transform duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className={`ml-2 px-4 py-2 text-white bg-blue-500 rounded-lg transition-transform duration-300`}>
                  Search
                </button>
              </div>
              <select
                className={`border border-gray-300 rounded-lg px-4 py-2 transition-transform duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} hover:scale-105`}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="fileName" className="hover:bg-gray-200">Sort by Name</option>
                <option value="uploadDate" className="hover:bg-gray-200">Sort by Date Modified</option>
              </select>
            </div>
            <div className={`shadow overflow-hidden sm:rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={`bg-gray-50 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  {filteredDocuments.map((doc, index) => (
                    <tr key={index} className={`${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{doc.fileName}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{doc.status}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{doc.uploadDate}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{doc.uploadTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button title="View" className={`text-blue-600 hover:text-blue-800 ${darkMode ? 'text-blue-300' : 'text-blue-600'} transition-transform duration-300 hover:scale-110`}>
                            <Eye size={20} />
                          </button>
                          <button title="Download" className={`text-green-600 hover:text-green-800 ${darkMode ? 'text-green-300' : 'text-green-600'} transition-transform duration-300 hover:scale-110`}>
                            <Download size={20} />
                          </button>
                          <button title="Delete" className={`text-red-600 hover:text-red-800 ${darkMode ? 'text-red-300' : 'text-red-600'} transition-transform duration-300 hover:scale-110`}>
                            <Trash size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default DashboardHistory;
