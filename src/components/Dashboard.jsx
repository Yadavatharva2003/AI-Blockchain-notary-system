import React from 'react';
import { Upload, Clock, CheckCircle, XCircle, List, ChevronRight, LogOut, Settings, HelpCircle, Info, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [showOptions, setShowOptions] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [darkMode, setDarkMode] = React.useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const documentStatuses = [
    { title: 'Uploaded Documents', icon: <Upload size={32} />, count: 120 },
    { title: 'In Progress', icon: <Clock size={32} />, count: 15 },
    { title: 'Verified Documents', icon: <CheckCircle size={32} />, count: 100 },
    { title: 'Rejected Documents', icon: <XCircle size={32} />, count: 5 },
  ];

  const sidebarItems = [
    { title: 'Sign Out', icon: <LogOut size={24} /> },
    { title: 'Account Settings', icon: <Settings size={24} /> },
    { title: 'About Us', icon: <Info size={24} /> },
    { title: 'Help Center', icon: <HelpCircle size={24} /> },
  ];

  const recentActivities = [
    { title: 'Document Lease_Agreement.pdf was uploaded.', time: '2023-09-29 14:35', status: 'Uploaded' },
    { title: 'Document Service_Contract.pdf was approved.', time: '2023-09-25 10:20', status: 'Approved' },
    { title: 'Document Contract_Agreement.pdf was downloaded.', time: '2023-09-30 09:15', status: 'Downloaded' },
  ];

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      alert(`File selected: ${selectedFile.name}`);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };

  return (
    <div className={`h-screen flex ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Sidebar Container */}
      <div className={`transition-all duration-150 ease-in-out ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} ${showOptions ? 'w-48' : 'w-16'} h-full`}>
        <div className="flex items-center justify-center h-16">
          <button 
            className="p-2 bg-white rounded-md shadow-md transition-transform duration-150 ease-in-out"
            aria-label="Toggle menu options"
            onClick={toggleOptions}
          >
            <ChevronRight 
              size={24} 
              className={`transform ${showOptions ? 'rotate-90' : ''} transition-transform duration-150 ease-in-out ${darkMode ? 'text-gray-400' : 'text-black'}`} 
            />
          </button>
        </div>
        {/* Sidebar content */}
        {showOptions && (
          <div className="flex flex-col mt-2">
            {sidebarItems.map((item, index) => (
              <a 
                href="#" 
                key={index} 
                className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 transition-transform duration-150 hover:scale-105"
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-grow pt-12 pb-6 px-4 sm:px-6 lg:px-8">
        <header className={`shadow rounded-lg mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode} 
              className={`p-2 rounded-full shadow-md transition-transform duration-150 ease-in-out transform hover:scale-105 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
              {darkMode ? <Sun size={24} className="text-white" /> : <Moon size={24} />}
            </button>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto">
          {/* Document Status Display */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {documentStatuses.map((status, index) => (
              <div 
                key={index} 
                className={`overflow-hidden shadow rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-transform duration-150 hover:scale-105`}
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">{status.icon}</div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium truncate">{status.title}</dt>
                        <dd className="text-3xl font-semibold">{status.count}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <label className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full flex items-center cursor-pointer transition duration-150 ease-in-out transform hover:scale-105">
              <Upload className="mr-2" />
              Upload New Document
              <input 
                type="file" 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf, .doc, .docx, .txt"
              />
            </label>
            <Link 
              to="/history"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full flex items-center transition-transform duration-150 hover:scale-105"
            >
              <List className="mr-2" />
              View Past Documents
            </Link>
          </div>

          {/* Recent Activity Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-1 lg:grid-cols-1">
              {recentActivities.map((activity, index) => (
                <div 
                  key={index} 
                  className={`overflow-hidden shadow rounded-lg p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} transition-transform duration-150 hover:scale-105`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white">{activity.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
