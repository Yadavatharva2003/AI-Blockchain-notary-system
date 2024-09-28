import React from 'react';
import { Upload, Clock, CheckCircle, XCircle, List, ChevronRight, LogOut, Settings, HelpCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [showOptions, setShowOptions] = React.useState(false);
  const [file, setFile] = React.useState(null);

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

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Implement further processing of the file if needed
      alert(`File selected: ${selectedFile.name}`);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar Container */}
      <div className={`transition-all duration-300 ease-in-out bg-gray-200 ${showOptions ? 'w-48' : 'w-16'} h-full`}>
        <div className="flex items-center justify-center h-16">
          <button 
            className="p-2 bg-white rounded-md shadow-md transition-transform duration-300 ease-in-out"
            aria-label="Toggle menu options"
            onClick={toggleOptions}
          >
            <ChevronRight size={24} className={`transform ${showOptions ? 'rotate-90' : ''} transition-transform duration-300 ease-in-out`} />
          </button>
        </div>
        {/* Sidebar content */}
        {showOptions && (
          <div className="flex flex-col mt-2">
            {sidebarItems.map((item, index) => (
              <a 
                href="#" 
                key={index} 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
        <header className="bg-white shadow rounded-lg mb-6">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto">
          {/* Document Status Display */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {documentStatuses.map((status, index) => (
              <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">{status.icon}</div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{status.title}</dt>
                        <dd className="text-3xl font-semibold text-gray-900">{status.count}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Action Buttons */}
          <div className="mt-8 flex flex-col items-center">
            <label className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full flex items-center cursor-pointer transition duration-300 ease-in-out transform hover:scale-105">
              <Upload className="mr-2" />
              Upload New Document
              <input 
                type="file" 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf, .doc, .docx, .txt" // Specify file types
              />
            </label>
            <Link 
              to="/history"
              className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full flex items-center"
            >
              <List className="mr-2" />
              View Past Documents
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
