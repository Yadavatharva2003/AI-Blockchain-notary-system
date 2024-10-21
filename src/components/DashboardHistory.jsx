'use client'

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Download, Trash, Moon, Sun, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('fileName');
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [expandedIndex, setExpandedIndex] = useState(null);

  const documentHistory = [
    { 
      fileName: 'Document1.pdf', 
      status: 'Verified', 
      uploadDate: '2023-05-01', 
      uploadTime: '10:00 AM',
      details: "Document verified successfully. All criteria met."
    },
    { 
      fileName: 'Document2.pdf', 
      status: 'In Progress', 
      uploadDate: '2023-05-02', 
      uploadTime: '2:30 PM',
      details: "Document is currently under review."
    },
    { 
      fileName: 'Document3.pdf', 
      status: 'Rejected', 
      uploadDate: '2023-05-03', 
      uploadTime: '4:15 PM',
      details: "Document rejected due to missing witness signatures."
    },
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

  const handleInfoClick = (index) => {
    // If the clicked index is already expanded, collapse it; otherwise, expand the clicked one
    setExpandedIndex(expandedIndex === index ? null : index);
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

            {/* Header Row */}
            <div className={`grid grid-cols-5 gap-4 font-bold ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'} border-b-2 border-gray-300`}>
              <div className="py-2 pl-4 border-l-4 border-blue-500">File Name</div> {/* Added border and padding */}
              <div className="py-2">Status</div>
              <div className="py-2">Upload Date</div>
              <div className="py-2">Upload Time</div>
              <div className="py-2">Action</div>
            </div>

            {/* Document Cards */}
            <div className="flex flex-col space-y-4 mt-4">
              {filteredDocuments.map((doc, index) => (
                <motion.div 
                  key={index} 
                  className={`border rounded-lg p-4 transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'} cursor-pointer w-full`}
                >
                  <div className="grid grid-cols-5 items-center">
                    <div className="text-lg">{doc.fileName}</div>
                    <div>{doc.status}</div>
                    <div>{doc.uploadDate}</div>
                    <div>{doc.uploadTime}</div>
                    <div className="flex space-x-2">
                      <button title="View" className={`text-blue-600 hover:text-blue-800 ${darkMode ? 'text-blue-300' : 'text-blue-600'} transition-transform duration-300`}>
                        <Eye size={20} />
                      </button>
                      <button title="Download" className={`text-green-600 hover:text-green-800 ${darkMode ? 'text-green-300' : 'text-green-600'} transition-transform duration-300`}>
                        <Download size={20} />
                      </button>
                      <button title="Delete" className={`text-red-600 hover:text-red-800 ${darkMode ? 'text-red-300' : 'text-red-600'} transition-transform duration-300`}>
                        <Trash size={20} />
                      </button>
                      <button title="Info" onClick={() => handleInfoClick(index)} className={`text-gray-600 hover:text-gray-800 ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-transform duration-300`}>
                        <Info size={20} />
                      </button>
                    </div>
                  </div>
                  {expandedIndex === index && (
                    <div className="mt-4">
                      <h3 className="font-bold">Details:</h3>
                      <p>{doc.details}</p>
                      <h4 className="font-semibold mt-2">Verification Criteria:</h4>
                      <ul className="list-disc list-inside">
                        <li><strong>Legal Document Type:</strong> Check if the document type is correct.</li>
                        <li><strong>Consideration Mentioned:</strong> Ensure consideration is stated.</li>
                        <li><strong>Complete Legal Property Description:</strong> Verify property descriptions.</li>
                        <li><strong>Correct Use of Terminology:</strong> Ensure terms are used consistently.</li>
                        <li><strong>Witness Requirements:</strong> Check for necessary witness signatures.</li>
                        <li><strong>Notary Section Completeness:</strong> Ensure notary details are complete.</li>
                        <li><strong>Effective Date of Transfer:</strong> Verify the effective date is clear.</li>
                        <li><strong>Jurat or Acknowledgment Statement:</strong> Ensure the correct statement is used.</li>
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default DashboardHistory;
