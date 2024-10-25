'use client'

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Download, Trash, Moon, Sun, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { doc, collection, query, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export default function DashboardHistory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('fileName');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userFilesCollection = collection(userDocRef, "uploadedFiles");
      const q = query(userFilesCollection);
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fileName: doc.data().name,
          status: doc.data().verificationStatus,
          uploadDate: new Date(doc.data().uploadTime.toDate()).toLocaleDateString(),
          uploadTime: new Date(doc.data().uploadTime.toDate()).toLocaleTimeString(),
          details: doc.data().verificationDetails
        }));
        setDocuments(docs);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'fileName') {
        return a.fileName.localeCompare(b.fileName);
      }
      return new Date(b.uploadTime) - new Date(a.uploadTime);
    });

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleInfoClick = (index) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
            <div className="mb-4 flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-2 sm:mb-0">
                <input
                  type="text"
                  placeholder="Search by file name..."
                  className={`border border-gray-300 rounded-lg px-4 py-2 transition-transform duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="ml-2 px-4 py-2 text-white bg-blue-500 rounded-lg transition-transform duration-300">
                  Search
                </button>
              </div>
              <select
                className={`border border-gray-300 rounded-lg px-4 py-2 transition-transform duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} hover:scale-105`}
                onChange={(e) => setSortBy(e.target.value)}
                value={sortBy}
              >
                <option value="fileName">Sort by Name</option>
                <option value="uploadDate">Sort by Date Modified</option>
              </select>
            </div>

            {/* Header Row */}
            <div className={`grid grid-cols-1 sm:grid-cols-5 gap-6 font-bold ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'} border-b-2 border-gray-300`}>
              <div className="header-cell py-2 pl-4 border-l-4 border-blue-500" style={{ minWidth: '250px' }}>File Name</div> {/* Increased width */}
              <div className="header-cell py-2 text-center">Status</div> {/* Centered text */}
              <div className="header-cell py-2 text-center">Upload Date</div> {/* Centered text */}
              <div className="header-cell py-2 text-center">Upload Time</div> {/* Centered text */}
              <div className="header-cell py-2 text-center">Action</div> {/* Centered text */}
            </div>

            {/* Document Cards */}
            <div className="flex flex-col space-y-4 mt-4">
              {filteredDocuments.map((doc, index) => (
                <motion.div 
                  key={doc.id} 
                  className={`border rounded-lg p-4 transition-transform duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'} cursor-pointer w-full hover:scale-105`} // Added zoom effect
                  style={{ transitionDuration: '0.3s' }} // Slowed down the zoom effect
                >
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 items-center">
                    <div className="data-cell text-lg break-words" style={{ minWidth: '250px' }}>{doc.fileName}</div> {/* Increased width */}
                    <div className={`data-cell status text-center ${
                      doc.status === 'Verified' ? 'text-green-500' : 
                      doc.status === 'Rejected' ? 'text-red-500' : 
                      doc.status === 'In Progress' ? 'text-yellow-500' : ''
                    }`}>
                      {doc.status}
                    </div>
                    <div className="data-cell text-center">{doc.uploadDate}</div>
                    <div className="data-cell text-center">{doc.uploadTime}</div>
                    <div className="data-cell flex space-x-2 justify-center">
                      <button title="View" className={`text-blue-600 hover:text-blue-800 ${darkMode ? 'text-blue-300' : 'text-blue-600'} transition-transform duration-300`}>
                        <Eye size={20} />
                      </button>
                      <button title="Download" className={`text-green-600 hover:text-green-800 ${darkMode ? 'text-green-300' : 'text-green-600'} transition-transform duration-300`}>
                        <Download size={20} />
                      </button>
                      <button title="Delete" className={`text-red-600 hover:text-red-800 ${darkMode ? 'text-red-300' : 'text-red-600'} transition-transform duration-300`}>
                        <Trash size={20} />
                      </button>
                      <button 
                        title="Info" 
                        onClick={() => handleInfoClick(index)} 
                        className={`text-gray-600 hover:text-gray-800 ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-transform duration-300`}
                      >
                        <Info size={20} />
                      </button>
                    </div>
                  </div>
                  {expandedIndex === index && (
                    <div className="mt-4">
                      <h3 className="font-bold">Verification Details:</h3>
                      <p className="whitespace-pre-line">{doc.details}</p>
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
}
