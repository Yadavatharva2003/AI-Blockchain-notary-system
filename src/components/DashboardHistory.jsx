'use client'

import React, { useState, useEffect,Fragment} from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Download, Trash, Moon, Sun, Info, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { doc, collection, query, onSnapshot,updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';

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
  const [showRevokeConfirmation, setShowRevokeConfirmation] = useState(false);
const [documentToRevoke, setDocumentToRevoke] = useState(null);
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
      // Ensure sorting by uploadTime in descending order
      return b.uploadTime.seconds - a.uploadTime.seconds; // Most recent first
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

  const initiateRevoke = (documentId) => {
    setDocumentToRevoke(documentId);
    setShowRevokeConfirmation(true);
  };
  
  const handleRevokeNotarization = async (documentId) => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        throw new Error('User not authenticated');
      }
  
      // Update the document status in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const documentRef = doc(userDocRef, "uploadedFiles", documentId);
  
      await updateDoc(documentRef, {
        verificationStatus: 'Revoked',
        revokedAt: new Date(),
        revokedBy: user.email,
      });
  
      // Update the documents state
      setDocuments(prevDocs =>
        prevDocs.map(doc =>
          doc.id === documentId
            ? { ...doc, status: 'Revoked' }
            : doc
        )
      );
  
      toast.success('Document notarization has been successfully revoked');
      setShowRevokeConfirmation(false);
      setDocumentToRevoke(null);
  
    } catch (error) {
      console.error('Error revoking document:', error);
      toast.error('Failed to revoke document notarization');
    } finally {
      setLoading(false);
    }
  };
  
  const cancelRevoke = () => {
    setShowRevokeConfirmation(false);
    setDocumentToRevoke(null);
  };

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
                      {doc.status === 'Verified' && (
                        <button 
                          title="Revoke" 
                          onClick={() => initiateRevoke(doc.id)}
                          className={`text-red-600 hover:text-red-800 ${darkMode ? 'text-red-300' : 'text-red-600'} transition-transform duration-300`}
                        >
                          <X size={20} />
                        </button>
                      )}
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
                      <h3 className="font-bold mb-2">Verification Details:</h3>
                      {doc.details && (
                        <div className="space-y-2">
                          {/* Show notary status for both verified and rejected documents */}
                          {doc.details.notaryStatus && (
                            <div className={doc.details.notaryStatus.isValid ? "text-green-500" : "text-red-500"}>
                              <p className="font-semibold">Notary Status:</p>
                              <ul className="list-disc ml-4">
                                {Object.entries(doc.details.notaryStatus.checks).map(([key, value]) => (
                                  <li key={key}>
                                    {key.replace(/([A-Z])/g, ' $1').trim()}: {value ? '✓' : '✗'}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Show AI Analysis for both verified and rejected documents */}
                          {doc.details.aiAnalysis && (
                            <div className="text-gray-600 dark:text-gray-300">
                              <p className="font-semibold">AI Analysis:</p>
                              <p className="whitespace-pre-line">{doc.details.aiAnalysis}</p>
                            </div>
                          )}

                          {/* Show errors only if they exist */}
                          {doc.details.criticalErrors && doc.details.criticalErrors.length > 0 && (
                            <div className="text-red-500">
                              <p className="font-semibold">Critical Errors:</p>
                              <ul className="list-disc ml-4">
                                {doc.details.criticalErrors.map((error, i) => (
                                  <li key={i}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {doc.details.spellingErrors && doc.details.spellingErrors.length > 0 && (
                            <div className="text-yellow-500">
                              <p className="font-semibold">Spelling Issues:</p>
                              <ul className="list-disc ml-4">
                                {doc.details.spellingErrors.map((error, i) => (
                                  <li key={i}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {doc.details.formatErrors && doc.details.formatErrors.length > 0 && (
                            <div className="text-orange-500">
                              <p className="font-semibold">Format Issues:</p>
                              <ul className="list-disc ml-4">
                                {doc.details.formatErrors.map((error, i) => (
                                  <li key={i}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Add verification success message for verified documents */}
                          {doc.status === 'Verified' && !doc.details.criticalErrors && (
                            <div className="text-green-500">
                              <p className="font-semibold">Verification Status:</p>
                              <p className="ml-4">✓ Document successfully verified</p>
                              {doc.details.verificationTime && (
                                <p className="ml-4">Verified at: {new Date(doc.details.verificationTime).toLocaleString()}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}



                    </div>
                  )}
               </motion.div>
              ))}
            </div>
          </motion.main>
        </div>
      </div>
      {/* Revoke Confirmation Dialog */}
<Transition appear show={showRevokeConfirmation} as={Fragment}>
  <Dialog 
    as="div" 
    className="relative z-50" 
    onClose={cancelRevoke}
  >
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
              Revoke Document Notarization
            </Dialog.Title>
            <div className="mt-2">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Are you sure you want to revoke this document's notarization? This action cannot be undone.
              </p>
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                className={`inline-flex justify-center rounded-md border border-transparent ${
                  darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-100 hover:bg-red-200'
                } px-4 py-2 text-sm font-medium ${
                  darkMode ? 'text-white' : 'text-red-900'
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2`}
                onClick={() => handleRevokeNotarization(documentToRevoke)}
              >
                Revoke
              </button>
              <button
                type="button"
                className={`inline-flex justify-center rounded-md border border-transparent ${
                  darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                } px-4 py-2 text-sm font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2`}
                onClick={cancelRevoke}
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
}