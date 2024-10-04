import React, { useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Upload, Clock, CheckCircle, XCircle, List, ChevronRight, LogOut, Settings, HelpCircle, Info, Moon, Sun, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BlockchainLoader from './BlockchainLoader';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { storage, db } from './firebase';
import { doc, collection, addDoc, onSnapshot } from 'firebase/firestore';

const Dashboard = () => {
  const [showOptions, setShowOptions] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0); // State for upload progress
  const [darkMode, setDarkMode] = React.useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  
  const [user, setUser] = React.useState(null); // State to store user info
  const navigate = useNavigate();
  const [dragging, setDragging] = React.useState(false);
  
  const [popupMessage, setPopupMessage] = useState(null);
  

  const [documentStatuses, setDocumentStatuses] = React.useState([
    { title: 'Uploaded Documents', icon: <Upload size={32} />, count: 0 }, // Start with 0
    { title: 'In Progress', icon: <Clock size={32} />, count: 0 },
    { title: 'Verified Documents', icon: <CheckCircle size={32} />, count: 0 },
    { title: 'Rejected Documents', icon: <XCircle size={32} />, count: 0 },
]);

useEffect(() => {
  const auth = getAuth();
  const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
          setUser(currentUser); // Set user if logged in

          // Firestore listener for uploaded files
          const userDocRef = doc(db, "users", currentUser.uid);
          const userFilesCollection = collection(userDocRef, "uploadedFiles");

          // Set up the onSnapshot listener
          const unsubscribeFiles = onSnapshot(userFilesCollection, (snapshot) => {
              const uploaded = snapshot.docs.filter(doc => doc.exists()).length; // Count of uploaded documents
              const inProgress = 0; // Replace with your logic for 'in progress'
              const verified = 0; // Replace with your logic for 'verified'
              const rejected = 0; // Replace with your logic for 'rejected'

              // Update document statuses with the count of uploaded documents
              setDocumentStatuses((prevStatuses) =>
                  prevStatuses.map((status) => {
                      if (status.title === 'Uploaded Documents') return { ...status, count: uploaded };
                      if (status.title === 'In Progress') return { ...status, count: inProgress };
                      if (status.title === 'Verified Documents') return { ...status, count: verified };
                      if (status.title === 'Rejected Documents') return { ...status, count: rejected };
                      return status;
                  })
              );
          });

          // Return cleanup functions
          return () => {
              unsubscribeFiles(); // Clean up Firestore listener
          };
      } else {
          navigate('/login'); // Redirect to login if not authenticated
      }
  });

  return () => unsubscribeAuth(); // Clean up auth listener
}, [navigate]);




  const handleSignOut = async () => {
    const auth = getAuth();
    try {
        await signOut(auth); // Sign out from Firebase
        navigate('/', { replace: true }); // Navigate to the homepage
    } catch (error) {
        console.error("Sign-out error:", error);
    }
};




  const sidebarItems = [
    { title: 'Sign Out', icon: <LogOut size={24} />, action: handleSignOut },
    { title: 'Account Settings', icon: <Settings size={24} />, action: () => navigate('/account-settings') },
    { title: 'About Us', icon: <Info size={24} />, action: () => navigate('/about') },
    { title: 'Help Center', icon: <HelpCircle size={24} />, action: () => navigate('/help') },
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

  const showPopupMessage = (message, duration = 3000) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(null), duration);
  };

  const handleFileUpload = (selectedFile) => {
    setLoading(true);
    setProgress(0);

    const storageRef = ref(storage, `uploads/${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
        'state_changed',
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progress);
        },
        (error) => {
            console.error("Upload failed:", error);
            setLoading(false);
            showPopupMessage("Upload failed. Please try again.");
        },
        async () => {
            try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log("File available at", downloadURL);

                // Set file metadata
                const fileMetadata = {
                    name: selectedFile.name,
                    size: selectedFile.size,
                    type: selectedFile.type,
                    downloadURL,
                    uploadTime: new Date(),
                };

                // Assuming user is logged in and user ID is available in `user` state
                if (user) {
                    const userDocRef = doc(db, "users", user.uid); // Reference to the user document
                    const userFilesCollection = collection(userDocRef, "uploadedFiles"); // Sub-collection for user's files

                    // Add file metadata to Firestore
                    await addDoc(userFilesCollection, fileMetadata);
                    console.log("File metadata successfully added to Firestore.");
                }

                setFile(selectedFile);
                setLoading(false);
                alert(`File uploaded successfully: ${selectedFile.name}`);
            } catch (error) {
                console.error("Error storing file metadata in Firestore:", error);
                setLoading(false);
                showPopupMessage("Error storing file metadata. Please try again.");
            }
        }
    );
};
 
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };
 

  const handleGoToHomepage = () => {
    navigate('/'); // Assuming '/' is the route for EnhancedHomepage
  };

  const hoverVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 } // Faster transition
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 } // Even faster for tap
    }
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
              onClick={item.action}
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
            <motion.div 
              className="mt-8 flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {loading ? (
                <div className="w-full max-w-md flex flex-col items-center">
                  <BlockchainLoader /> {/* Show the blockchain loader */}
                  <span className="text-center text-sm font-semibold">{progress}%</span>
                </div>
              ) : (
                <motion.div 
                  className={`border-2 ${
                    dragging 
                      ? 'border-blue-500' 
                      : darkMode 
                        ? 'border-gray-600' 
                        : 'border-gray-400'
                  } border-dashed rounded-lg p-8 w-full max-w-md text-center`}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  variants={hoverVariants}
                  onClick={() => document.querySelector('input[type="file"]').click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragEnter={() => setDragging(true)}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  <Upload className={`mx-auto mb-2 ${darkMode ? 'text-white' : 'text-gray-600'}`} size={32} />
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Drag and drop a file here, or click to select a file
                  </p>
                  <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".pdf, .doc, .docx, .txt"
                  />
                </motion.div>
              )}
              <motion.div
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                variants={hoverVariants}
              >
                <Link 
                  to="/history"
                  className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full flex items-center"
                >
                  View Upload History <List className="ml-2" size={16} />
                </Link>
              </motion.div>
            </motion.div>

            {/* Recent Activities */}
            <motion.div 
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
              <ul className="space-y-2">
                {recentActivities.map((activity, index) => (
                  <motion.li 
                    key={index} 
                    className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    variants={hoverVariants}
                  >
                    <div className="flex justify-between">
                      {/* Title on the left */}
                      <span>{activity.title}</span>
                      
                      {/* Date and Status on the right */}
                      <div className="flex flex-col items-end">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">{activity.time}</span>
                        <span 
                          className={`mt-1 text-sm font-semibold ${
                            activity.status === 'Uploaded' ? 'text-blue-500' : 
                            activity.status === 'Approved' ? 'text-green-500' : 
                            'text-gray-500'
                          }`}
                        >
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.main>
        </div>
      </div>

      <AnimatePresence>
        {popupMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
          >
            {popupMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
