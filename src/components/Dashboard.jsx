import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Upload, Clock, CheckCircle, XCircle, List, ChevronRight, LogOut, Settings, HelpCircle, Info, Moon, Sun, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BlockchainLoader from './BlockchainLoader';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { storage, db } from './firebase';
import { doc, collection, addDoc, onSnapshot ,query,orderBy,limit} from 'firebase/firestore';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';


const Dashboard = () => {
  const [showOptions, setShowOptions] = React.useState(false);
  const  setFile= React.useState(null);
 
  const [darkMode, setDarkMode] = React.useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  

  const [user, setUser] = React.useState(null); // State to store user info
  const navigate = useNavigate();
  const [dragging, setDragging] = React.useState(false);
  
  const [popupMessage, setPopupMessage] = useState(null);
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0); // State for upload progress
 
  const [documentStatuses, setDocumentStatuses] = React.useState([
    { title: 'Uploaded Documents', icon: <Upload size={32} />, count: 0 }, // Start with 0
    { title: 'In Progress', icon: <Clock size={32} />, count: 0 },
    { title: 'Verified Documents', icon: <CheckCircle size={32} />, count: 0 },
    { title: 'Rejected Documents', icon: <XCircle size={32} />, count: 0 },
]);

const [recentActivities, setRecentActivities] = React.useState([]); // Initialize as empty

useEffect(() => {
  const auth = getAuth();
  
  const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
          setUser(currentUser); // Set user if logged in

          // Firestore listener for uploaded files
          const userDocRef = doc(db, "users", currentUser.uid);
          const userFilesCollection = collection(userDocRef, "uploadedFiles");
        
          // Set up the onSnapshot listener
          const unsubscribeFiles = onSnapshot(
            query(userFilesCollection, orderBy('uploadTime', 'desc'), limit(3)),
            (snapshot) => {
                // Update recent activities from files
                const recentFiles = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    time: doc.data().uploadTime.toDate().toISOString()
                }));
                setRecentActivities(recentFiles);
                const allFiles = snapshot.docs;
                const uploaded = allFiles.length;
                const inProgress = allFiles.filter(doc => doc.data().verificationStatus === 'In Progress').length;
                const verified = allFiles.filter(doc => doc.data().verificationStatus === 'Verified').length;
                const rejected = allFiles.filter(doc => doc.data().verificationStatus === 'Rejected').length;
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

  
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const [showUploadConfirmation, setShowUploadConfirmation] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
 
  const getRecentActivities = () => {
    return recentActivities
        .sort((a, b) => new Date(b.time) - new Date(a.time)) // Sort by time descending
        .slice(0, 3); // Get the latest 3 activities
};

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadConfirmation(true);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      setSelectedFile(droppedFiles[0]);
      setShowUploadConfirmation(true);
    }
  };

  const confirmUpload = () => {
    setShowUploadConfirmation(false);
    handleFileUpload(selectedFile);
  };

  const cancelUpload = () => {
    setShowUploadConfirmation(false);
    setSelectedFile(null);
    setFile(null); // Resetting file to allow a new upload
    setProgress(0); // Reset progress
    showPopupMessage("Upload canceled."); // Show a cancellation message
    setTimeout(() => {
      window.location.reload(); // This will refresh the page
  }, 1000);
    
};



  const showPopupMessage = (message, duration = 3000) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(null), duration);
  };

  const handleFileUpload = async (selectedFile) => {
    if (!selectedFile) return;
    setLoading(true);
    setProgress(0);

    try {
        // First upload to Firebase
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

                    // Create FormData for server upload
                    const formData = new FormData();
                    formData.append('file', selectedFile);

                    // Send to verification server
                    const verificationResponse = await fetch('http://localhost:3001/api/verify', {
                        method: 'POST',
                        body: formData
                    });

                    if (!verificationResponse.ok) {
                        throw new Error('Verification failed');
                    }

                    const verificationResult = await verificationResponse.json();

                    // Set file metadata including verification results
                    const fileMetadata = {
                        name: selectedFile.name,
                        size: selectedFile.size,
                        type: selectedFile.type,
                        downloadURL,
                        uploadTime: new Date(),
                        verificationStatus: verificationResult.status,
                        verificationDetails: verificationResult.details,
                        verifiedCount: verificationResult.status === 'Verified' ? 1 : 0, // Initialize count
                        rejectedCount: verificationResult.status === 'Rejected' ? 1 : 0 // Initialize count

                    };
                    
                  const verificationActivity = {
                    title: `Document ${selectedFile.name} was ${verificationResult.status}.`,
                    time: new Date().toISOString(),
                    status: verificationResult.status === 'Verified' ? 'Approved' : 'Rejected'
                };

                // Update recent activities with the verification result
                setRecentActivities((prevActivities) => [...prevActivities, verificationActivity]);

                    // Store in Firestore
                    if (user) {
                        const userDocRef = doc(db, "users", user.uid);
                        const userFilesCollection = collection(userDocRef, "uploadedFiles");
                        await addDoc(userFilesCollection, fileMetadata);
                    }

                    setFile(selectedFile);
                    setLoading(false);
                    showPopupMessage(`File uploaded and verified: ${verificationResult.status}`);
                   
                    

                } catch (error) {
                    console.error("Error in file processing:", error);
                    setLoading(false);
                    showPopupMessage("Error processing file. Please try again.");
                }
            }
        );
    } catch (error) {
        console.error("Error in upload:", error);
        setLoading(false);
        showPopupMessage("Upload failed. Please try again.");
    }
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

      <div className="relative z-10 flex h-screen">
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
                <button 
                  key={index}
                  onClick={item.action}
                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 transition-transform duration-150 hover:scale-105"
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-grow pt-12 pb-6 px-4 sm:px-6 lg:px-8 overflow-y-auto">
          <motion.header 
            className={`shadow rounded-lg mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <div className="flex items-center space-x-4"> {/* Space between buttons */}
                {/* Home Button */}
                <button 
                  onClick={handleGoToHomepage}
                  className={`p-2 rounded-full shadow-md transition-transform duration-150 ease-in-out transform hover:scale-105 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
                >
                  <Home size={24} className={darkMode ? 'text-white' : 'text-gray-800'} />
                </button>
                {/* Dark Mode Toggle */}
                <button 
                  onClick={toggleDarkMode} 
                  className={`p-2 rounded-full shadow-md transition-transform duration-150 ease-in-out transform hover:scale-105 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
                >
                  {darkMode ? <Sun size={24} className="text-white" /> : <Moon size={24} />}
                </button>
              </div>
            </div>
          </motion.header>
          
          <motion.main 
            className="max-w-7xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Document Status Display */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {documentStatuses.map((status, index) => (
                <motion.div 
                  key={index} 
                  className={`overflow-hidden shadow rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  variants={hoverVariants}
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
                </motion.div>
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
                  <BlockchainLoader />
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
              {/* Upload History Link */}
              {!loading && (
              <motion.div
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                variants={hoverVariants}
              >
                
                { <Link 
                  to="/history"
                  className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full flex items-center"
                >
                  View Upload History <List className="ml-2" size={16} />
                </Link> }
              </motion.div>
              )}
            </motion.div>

            {/* Recent Activities */}
            <motion.div 
    className="mt-10"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.6 }}
>
    <h2 className="text-xl font-bold mb-4">Recent Uploads</h2>
    {recentActivities.length === 0 ? (
        <p className="text-gray-500">No recent uploads available.</p>
    ) : (
        <ul className="space-y-2">
            {recentActivities.map((file, index) => (
                <motion.li 
                    key={file.id} 
                    className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    variants={hoverVariants}
                >
                    <div className="flex justify-between">
                        <div className="flex flex-col">
                            <span className="font-medium">{file.name}</span>
                            <span className="text-sm text-gray-500">
                                {new Date(file.time).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                file.verificationStatus === 'Verified' 
                                    ? 'bg-green-100 text-green-800' 
                                    : file.verificationStatus === 'Rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {file.verificationStatus}
                            </span>
                        </div>
                    </div>
                </motion.li>
            ))}
        </ul>
    )}
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

      {/* Upload Confirmation Dialog */}
      <Transition appear show={showUploadConfirmation} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={cancelUpload}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 text-left align-middle shadow-xl transition-all`}>
                  <Dialog.Title
                    as="h3"
                    className={`text-lg font-medium leading-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    Upload File to Blockchain
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Are you sure you want to verify and upload "{selectedFile?.name}" to the blockchain?
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className={`inline-flex justify-center rounded-md border border-transparent ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-100 hover:bg-blue-200'} px-4 py-2 text-sm font-medium ${darkMode ? 'text-white' : 'text-blue-900'} focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
                      onClick={confirmUpload}
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      className={`inline-flex justify-center rounded-md border border-transparent ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} px-4 py-2 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2`}
                      onClick={cancelUpload}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Dashboard;
