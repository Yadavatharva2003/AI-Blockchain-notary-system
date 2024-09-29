import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Download, Trash, Moon, Sun } from 'lucide-react';

const DashboardHistory = () => {
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
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(JSON.parse(savedMode));
    }
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <div className="pt-12 pb-6 px-4 sm:px-6 lg:px-8">
        <header className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg`}>
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center">
            <Link to="/" className="mr-4">
              <ArrowLeft size={24} />
            </Link>
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
        </header>
        <main className="max-w-7xl mx-auto">
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
        </main>
      </div>
    </div>
  );
};

export default DashboardHistory;
