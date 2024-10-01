import React from 'react';
import { Upload, Clock, CheckCircle, XCircle, List, ChevronRight, LogOut, Settings, HelpCircle, Info, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import BlockchainLoader from './BlockchainLoader'; // Import the BlockchainLoader

const Dashboard = () => {
  const [showOptions, setShowOptions] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [darkMode, setDarkMode] = React.useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [dragging, setDragging] = React.useState(false);

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
      handleFileUpload(selectedFile);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles[0]);
    }
  };

  const handleFileUpload = (selectedFile) => {
    setLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(interval);
          setLoading(false);
          setFile(selectedFile);
          alert(`File selected: ${selectedFile.name}`);
          return 100;
        }
        return Math.min(oldProgress + 10, 100);
      });
    }, 100);

    setTimeout(() => {
      setLoading(false);
    }, 2000);
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
          <div className="mt-8 flex flex-col items-center">
            {loading ? (
              <div className="w-full max-w-md flex flex-col items-center">
                <BlockchainLoader /> {/* Show the blockchain loader */}
                <span className="text-center text-sm font-semibold">{progress}%</span>
              </div>
            ) : (
              <div 
                className={`border-2 ${dragging ? 'border-blue-500' : 'border-gray-300'} border-dashed rounded-lg p-8 w-full max-w-md text-center transition-all duration-150`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  document.querySelector('input[type="file"]').click(); // Trigger file input on click
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragEnter={() => setDragging(true)}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto mb-2" size={32} />
                <p className="text-gray-600">Drag and drop a file here, or click to select a file</p>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf, .doc, .docx, .txt"
                />
              </div>
            )}
           
            {!loading && ( // Render link only if not loading
              <Link 
                to="/history"
                className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full flex items-center transition-transform duration-150 hover:scale-105"
              >
                View Upload History <List className="ml-2" size={16} />
              </Link>
            )}
          </div>
          
          {/* Recent Activity Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold">Recent Activities</h2>
            <ul className="mt-4 space-y-2">
              {recentActivities.map((activity, index) => (
                <li key={index} className={`p-4 border rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-transform duration-150 hover:scale-105`}>
                  <p className="font-semibold">{activity.title}</p>
                  <p className="text-gray-600 text-sm">{activity.time}</p>
                  <p className={`text-sm ${activity.status === 'Rejected' ? 'text-red-600' : 'text-green-600'}`}>{activity.status}</p>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
