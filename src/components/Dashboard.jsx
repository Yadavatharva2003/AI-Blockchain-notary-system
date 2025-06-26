import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  List,
  ChevronRight,
  LogOut,
  Settings,
  HelpCircle,
  AlertTriangle,
  Info,
  Moon,
  Sun,
  Home,
  User,
} from "lucide-react";
import NotaryChatbot from "./chatbot";
import { Link, useNavigate } from "react-router-dom";
import BlockchainLoader from "./BlockchainLoader";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { storage, db } from "./firebase";
import {
  doc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDoc,
} from "firebase/firestore";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Fragment } from "react";
import {
  getCurrentAccount,
  searchDocumentsByNotary,
  getDocumentDetails,
  isDocumentExpired,
  isDocumentNotarized,
  listenToNotarizedEvents,
  listenToRevokedEvents,
  removeEventListeners,
  notarizeDocument,
  checkAndSwitchNetwork,
  hashDocument,
  setCurrentNetwork,
} from "./blockchain";
import { generateCertificate } from "./NotarizationCertificate";
import CryptoJS from "crypto-js";
import DocumentIcon from "@mui/icons-material/Description";
const Dashboard = () => {
  const [isIconClicked, setIsIconClicked] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showOptions, setShowOptions] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  // or however you're managing dark mode
  const handleIconClick = () => {
    setIsIconClicked(true);
    setIsChatbotOpen(!isChatbotOpen); // Toggle the chatbot
    setTimeout(() => setIsIconClicked(false), 200);
  };

  const [darkMode, setDarkMode] = React.useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [blockchainStatus, setBlockchainStatus] = useState({
    isProcessing: false,
    currentTransaction: null,
    error: null,
  });

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentStatus, setDocumentStatus] = useState({
    isNotarized: false,
    notary: null,
    notarizationTime: null,
    expirationTime: null,
    revoked: false,
  });

  const [user, setUser] = React.useState(null); // State to store user info
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Function to fetch user profile data from Firestore
  const fetchUserProfileData = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setProfileData(userDocSnap.data());
      } else {
        setProfileData(null);
      }
    } catch (error) {
      console.error("Error fetching user profile data:", error);
      setProfileData(null);
    }
  };
  const navigate = useNavigate();
  const [dragging, setDragging] = React.useState(false);

  const [popupMessage, setPopupMessage] = useState(null); // Will now store {text: string, type: string}
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0); // State for upload progress

  const [documentStatuses, setDocumentStatuses] = React.useState([
    { title: "Uploaded Documents", icon: <Upload size={32} />, count: 0 },
    { title: "In Progress", icon: <Clock size={32} />, count: 0 },
    { title: "Verified Documents", icon: <CheckCircle size={32} />, count: 0 },
    { title: "Rejected Documents", icon: <XCircle size={32} />, count: 0 },
  ]);
  const [selectedNetwork, setSelectedNetwork] = React.useState("ganache1");

  const [recentActivities, setRecentActivities] = React.useState([]); // Initialize as empty
  const [showRevokeConfirmation, setShowRevokeConfirmation] = useState(false);
  const [documentToRevoke, setDocumentToRevoke] = useState(null);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set user if logged in

        // Firestore listener for uploaded files
        const userDocRef = doc(db, "users", currentUser.uid);
        const userFilesCollection = collection(userDocRef, "uploadedFiles");

        // Set up the onSnapshot listener
        const recentActivitiesQuery = query(
          userFilesCollection,
          orderBy("uploadTime", "desc"),
          limit(3)
        );
        const unsubscribeRecentActivities = onSnapshot(
          recentActivitiesQuery,
          (snapshot) => {
            const recentFiles = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              time: doc.data().uploadTime.toDate().toISOString(),
            }));
            setRecentActivities(recentFiles);
          }
        );
        // Modify handleIconClick

        // Query for all files (for counting)
        const allFilesQuery = query(userFilesCollection);
        const unsubscribeAllFiles = onSnapshot(allFilesQuery, (snapshot) => {
          const allFiles = snapshot.docs;
          const uploaded = allFiles.length;
          const inProgress = allFiles.filter(
            (doc) => doc.data().verificationStatus === "In Progress"
          ).length;
          const verified = allFiles.filter(
            (doc) => doc.data().verificationStatus === "Verified"
          ).length;
          const rejected = allFiles.filter(
            (doc) => doc.data().verificationStatus === "Rejected"
          ).length;

          // Update document statuses with the count of uploaded documents
          setDocumentStatuses((prevStatuses) =>
            prevStatuses.map((status) => {
              if (status.title === "Uploaded Documents")
                return { ...status, count: uploaded };
              if (status.title === "In Progress")
                return { ...status, count: inProgress };
              if (status.title === "Verified Documents")
                return { ...status, count: verified };
              if (status.title === "Rejected Documents")
                return { ...status, count: rejected };
              return status;
            })
          );
        });

        // Return cleanup functions
        return () => {
          unsubscribeRecentActivities(); // Clean up recent activities listener
          unsubscribeAllFiles(); // Clean up all files listener
        };
      } else {
        navigate("/login"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribeAuth(); // Clean up auth listener
  }, [navigate]);

  // Add these functions inside your Dashboard component
  const connectWallet = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === "undefined") {
        showPopupMessage(
          "Please install MetaMask to use this feature",
          "warning"
        );
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
      showPopupMessage("Wallet connected successfully!", "success");

      // Add listeners for account changes
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", () => window.location.reload());
    } catch (error) {
      console.error("Error connecting wallet:", error);
      showPopupMessage("Failed to connect wallet", "error");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setAccount(null);
      showPopupMessage("Wallet disconnected", "info");
    } else {
      // Account changed
      setAccount(accounts[0]);
      showPopupMessage("Account changed", "info");
    }
  };
  // Add this useEffect after your existing useEffect hooks
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length > 0) {
            setAccount(accounts[0]);
            showPopupMessage("Wallet connected", "success");
          } else {
            // Automatically prompt connection
            connectWallet();
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkWalletConnection();

    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  const handleBlockchainError = (error) => {
    console.error("Blockchain error:", error);
    if (error.message.includes("Connection already in progress")) {
      showPopupMessage(
        "A connection is already in progress. Please wait.",
        "warning"
      );
    } else {
      showPopupMessage(
        "An error occurred with the blockchain connection",
        "error"
      );
    }
  };
  const initiateRevoke = (documentId) => {
    setDocumentToRevoke(documentId);
    setShowRevokeConfirmation(true);
  };

  const cancelRevoke = () => {
    setShowRevokeConfirmation(false);
    setDocumentToRevoke(null);
  };

  const handleRevokeNotarization = async (documentId) => {
    try {
      setLoading(true);

      // Make API call to your backend
      const response = await fetch(`/api/documents/${documentId}/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to revoke document");
      }

      // Update the UI
      setRecentActivities((prevActivities) =>
        prevActivities.map((activity) =>
          activity.id === documentId
            ? { ...activity, verificationStatus: "Revoked" }
            : activity
        )
      );

      toast.success("Document notarization has been successfully revoked");
      setShowRevokeConfirmation(false);
      setDocumentToRevoke(null);
    } catch (error) {
      console.error("Error revoking document:", error);
      toast.error("Failed to revoke document notarization");
    } finally {
      setLoading(false);
    }
  };

  const handleNotarizeDocument = async (documentContent) => {
    try {
      // Default expiration duration (e.g., 30 days)
      const expirationDuration = 30;
      await notarizeDocument(documentContent, expirationDuration);
      // Refresh the document list or update UI as needed
      fetchDocuments();
    } catch (error) {
      console.error("Error notarizing document:", error);
      // Handle error appropriately
    }
  };
  const BlockchainStatusIndicator = () => {
    if (!blockchainStatus.isProcessing && !blockchainStatus.error) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-4 right-4 p-4 rounded-md shadow-lg ${
          blockchainStatus.error ? "bg-red-500" : "bg-blue-500"
        } text-white`}
      >
        {blockchainStatus.error || blockchainStatus.currentTransaction}
      </motion.div>
    );
  };

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth); // Sign out from Firebase
      navigate("/", { replace: true }); // Navigate to the homepage
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  const sidebarItems = [
    { title: "Sign Out", icon: <LogOut size={24} />, action: handleSignOut },
    {
      title: "Account Settings",
      icon: <Settings size={24} />,
      action: () => navigate("/account-settings"),
    },
    {
      title: "About Us",
      icon: <Info size={24} />,
      action: () => navigate("/about"),
    },
    {
      title: "Help Center",
      icon: <HelpCircle size={24} />,
      action: () => navigate("/help"),
    },
  ];

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const [showUploadConfirmation, setShowUploadConfirmation] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setShowUploadConfirmation(true);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setShowUploadConfirmation(true);
    }
  };

  const confirmUpload = async () => {
    setShowUploadConfirmation(false);
    if (selectedFile) {
      await handleFileUpload(selectedFile);
    }
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

  const showPopupMessage = (message, type = "info", duration = 3000) => {
    setPopupMessage({ text: message, type });
    setTimeout(() => setPopupMessage(null), duration);
  };

  // In your Dashboard component
  const createFileHash = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
          const hash = CryptoJS.SHA256(wordArray).toString();
          resolve(hash);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // Replace isDocumentFullyNotarized checks with:
  const checkDocumentStatus = async (content) => {
    try {
      const isNotarized = await isDocumentNotarized(content);
      const details = await getDocumentDetails(content);
      return {
        isNotarized,
        notary: details.notary,
        notarizationTime: details.notarizationTime,
        expirationTime: details.expirationTime,
        revoked: details.revoked,
      };
    } catch (error) {
      console.error("Error checking document status:", error);
      return null;
    }
  };

  const fetchDocuments = async () => {
    try {
      // Get the current account
      const currentAccount = await getCurrentAccount();

      // Search for documents associated with the current account
      const documentHashesProxy = await searchDocumentsByNotary(currentAccount);
      console.log("Documents found:", documentHashesProxy);

      // Convert Proxy result to array
      const documentHashes = Array.from(documentHashesProxy).map((hash) =>
        typeof hash === "string" ? hash : hash.toString()
      );

      // Create an array to store the processed documents
      const processedDocuments = [];

      // Process each document hash
      for (const hash of documentHashes) {
        try {
          // Remove '0x' prefix if present for consistency
          const cleanHash = hash.startsWith("0x") ? hash.slice(2) : hash;

          // Get details for each document
          const details = await getDocumentDetails(cleanHash);

          // Create a document object with all relevant information
          const document = {
            hash: cleanHash,
            notary: details.notary,
            notarizationTime: new Date(
              details.notarizationTime * 1000
            ).toLocaleString(),
            expirationTime: new Date(
              details.expirationTime * 1000
            ).toLocaleString(),
            isExpired: await isDocumentExpired(cleanHash),
            isNotarized: await isDocumentNotarized(cleanHash),
            revoked: details.revoked,
            status: details.revoked
              ? "Revoked"
              : (await isDocumentExpired(cleanHash))
              ? "Expired"
              : "Active",
          };

          processedDocuments.push(document);
        } catch (error) {
          console.error(`Error processing document ${hash}:`, error);
          // Continue with next document even if one fails
          continue;
        }
      }

      // Sort documents by notarization time (most recent first)
      const sortedDocuments = processedDocuments.sort((a, b) => {
        const dateA = new Date(a.notarizationTime);
        const dateB = new Date(b.notarizationTime);
        return dateB - dateA;
      });

      return sortedDocuments;
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  };
  // You might want to call this function in useEffect
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      setError(null);
      await fetchDocuments();
    };

    loadDocuments();

    // Set up event listeners for blockchain events
    const setupEventListeners = async () => {
      try {
        await listenToNotarizedEvents((hash, notary, time) => {
          // Refresh documents when a new document is notarized
          fetchDocuments();
        });

        await listenToRevokedEvents((hash, notary, time) => {
          // Refresh documents when a document is revoked
          fetchDocuments();
        });
      } catch (error) {
        console.error("Error setting up event listeners:", error);
      }
    };

    setupEventListeners();

    // Cleanup function
    return () => {
      removeEventListeners();
    };
  }, []);

  const handleFileUpload = async (selectedFile) => {
    if (!selectedFile || !(selectedFile instanceof Blob)) {
      showPopupMessage("No valid file selected", "error");
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      // Check MetaMask and network
      if (typeof window.ethereum === "undefined") {
        throw new Error("Please install MetaMask to use this feature");
      }

      await checkAndSwitchNetwork();
      const currentAddress = await getCurrentAccount();
      if (!currentAddress) {
        throw new Error("Please connect your wallet first");
      }

      // 1. Upload to Firebase Storage
      const storageRef = ref(storage, `uploads/${selectedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      // Create a promise for the storage upload
      const uploadResult = await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setProgress(progress);
          },
          (error) => {
            console.error("Storage upload error:", error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });

      // 2. Create document hash for blockchain
      let documentHash;
      try {
        documentHash = await hashDocument(selectedFile); // Use selectedFile here
        console.log("Document hash:", documentHash);
      } catch (hashError) {
        console.error("Error creating document hash:", hashError);
        throw new Error("Failed to create document hash");
      }

      // 3. Check if document is already notarized
      const isAlreadyNotarized = await isDocumentNotarized(documentHash);
      if (isAlreadyNotarized) {
        showPopupMessage(
          "This document is already notarized on the blockchain.",
          "info"
        );
        setLoading(false);
        return;
      }

      // 4. Prepare file for verification
      const formData = new FormData();
      formData.append("file", selectedFile);

      // 5. Send to verification server
      let verificationResult;
      try {
        const verificationResponse = await fetch(
          "http://localhost:3001/api/verify",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!verificationResponse.ok) {
          verificationResult = {
            status: "In Progress",
            details: "Document verification in progress",
          };
          showPopupMessage("Document verification in progress", "info");
        } else {
          verificationResult = await verificationResponse.json();

          switch (verificationResult.status) {
            case "Verified":
              showPopupMessage("Document verified successfully!", "success");
              break;
            case "Rejected":
              showPopupMessage("Document verification Rejected", "error");
              break;
            case "In Progress":
              showPopupMessage("Document verification in progress", "info");
              break;
            default:
              showPopupMessage("Unknown verification status", "warning");
          }
          console.log("Verification status:", verificationResult.status);
        }
      } catch (verifyError) {
        console.warn("Verification error:", verifyError);
        verificationResult = {
          status: "In Progress",
          details: "Document verification in progress",
        };
        showPopupMessage("Document verification in progress", "info");
      }

      // 6. Notarize document if verification is successful
      let blockchainReceipt = null;
      if (verificationResult.status === "Verified") {
        try {
          setBlockchainStatus({
            isProcessing: true,
            currentTransaction: "Notarizing document on blockchain",
          });

          // Default expiration duration (30 days)
          const expirationDuration = 30;
          blockchainReceipt = await notarizeDocument(
            documentHash,
            expirationDuration
          );
          console.log("Blockchain transaction receipt:", blockchainReceipt);

          // After successful notarization, get document details for certificate
          const details = await getDocumentDetails(documentHash);

          // Generate and download notarization certificate
          generateCertificate(
            documentHash,
            details.notary,
            details.notarizationTime,
            details.expirationTime
          );

          showPopupMessage(
            "Document successfully notarized on blockchain!",
            "success"
          );
        } catch (blockchainError) {
          console.error("Blockchain notarization error:", blockchainError);
          showPopupMessage("Failed to notarize on blockchain", "error");
          throw blockchainError;
        } finally {
          setBlockchainStatus({
            isProcessing: false,
            currentTransaction: null,
          });
        }
      }

      // 7. Save to Firestore
      if (user) {
        const fileMetadata = {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          downloadURL: uploadResult,
          uploadTime: new Date(),
          verificationStatus: verificationResult.status,
          verificationDetails: verificationResult.details,
          documentHash: documentHash,
          notarizationStatus: blockchainReceipt ? "Notarized" : "Pending",
          blockchainTxHash: blockchainReceipt?.hash || null,
          notaryAddress: currentAddress,
          lastModified: new Date(),
          expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          isRevoked: false,
        };

        try {
          const userDocRef = doc(db, "users", user.uid);
          const userFilesCollection = collection(userDocRef, "uploadedFiles");
          const docRef = await addDoc(userFilesCollection, fileMetadata);

          // Add verification record
          const verificationRecord = {
            documentId: docRef.id,
            timestamp: new Date(),
            type: "DOCUMENT_VERIFICATION",
            result: verificationResult.status,
            details: verificationResult.details,
            blockchainTxHash: blockchainReceipt?.hash || null,
          };

          await addDoc(collection(docRef, "verifications"), verificationRecord);

          setFile(selectedFile);
          setProgress(100);
        } catch (firestoreError) {
          console.error("Firestore error:", firestoreError);
          showPopupMessage("Error saving document metadata", "error");
          throw new Error("Failed to save file metadata");
        }
      } else {
        throw new Error("User not authenticated");
      }
    } catch (error) {
      console.error("Error in upload process:", error);
      showPopupMessage("Error processing document: " + error.message, "error");

      // Cleanup if needed
      try {
        const storageRef = ref(storage, `uploads/${selectedFile.name}`);
        await deleteObject(storageRef);
        console.log("Cleaned up storage after error");
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  const handleGoToHomepage = () => {
    navigate("/"); // Assuming '/' is the route for EnhancedHomepage
  };

  const hoverVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }, // Faster transition
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }, // Even faster for tap
    },
  };

  // Add this function to your component
  const checkMetaMaskInstallation = () => {
    if (typeof window.ethereum === "undefined") {
      showPopupMessage(
        "MetaMask is not installed. Please install MetaMask to use all features.",
        "warning",
        7000
      );
      return false;
    }
    return true;
  };

  // Call this in your useEffect
  useEffect(() => {
    checkMetaMaskInstallation();
  }, []);

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      } transition-colors duration-500`}
    >
      <BlockchainStatusIndicator />
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            darkMode
              ? "from-blue-900 to-purple-900"
              : "from-blue-500 to-purple-700"
          } opacity-20 animate-gradient-x`}
        />
        <div
          className={`absolute inset-0 bg-[url('/placeholder.svg?height=200&width=200')] bg-repeat ${
            darkMode ? "opacity-3" : "opacity-5"
          } animate-pan-background`}
        />
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill={
              darkMode ? "rgba(30, 41, 59, 0.7)" : "rgba(229, 231, 235, 0.7)"
            }
            fillOpacity="1"
            d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,128C672,128,768,160,864,181.3C960,203,1056,213,1152,202.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className="animate-wave"
          ></path>
        </svg>
      </div>
      {/* Popup Message */}
      <AnimatePresence>
        {popupMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-md shadow-lg ${
              popupMessage.type === "success"
                ? "bg-green-500 text-white"
                : popupMessage.type === "error"
                ? "bg-red-500 text-white"
                : popupMessage.type === "warning"
                ? "bg-yellow-500 text-white"
                : darkMode
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-900"
            } flex items-center space-x-2 z-50`}
          >
            {popupMessage.type === "success" && <CheckCircle size={20} />}
            {popupMessage.type === "error" && <XCircle size={20} />}
            {popupMessage.type === "warning" && <AlertTriangle size={20} />}
            {popupMessage.type === "info" && <Info size={20} />}
            <span>{popupMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative z-10 flex h-screen">
        {/* Sidebar Container */}
        <div
          className={`transition-all duration-150 ease-in-out ${
            darkMode ? "bg-gray-800" : "bg-gray-200"
          } ${showOptions ? "w-48" : "w-16"} h-full`}
        >
          <div className="flex items-center justify-center h-16">
            <button
              className="p-2 bg-white rounded-md shadow-md transition-transform duration-150 ease-in-out"
              aria-label="Toggle menu options"
              onClick={toggleOptions}
            >
              <ChevronRight
                size={24}
                className={`transform ${
                  showOptions ? "rotate-90" : ""
                } transition-transform duration-150 ease-in-out ${
                  darkMode ? "text-gray-400" : "text-black"
                }`}
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
            className={`shadow rounded-lg mb-6 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Enhanced Doodle Robot Animation */}
            <svg
              className="absolute top-2 left-2 w-24 h-24"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <motion.g
                animate={{
                  x: [0, 30, 0],
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.1 }}
                filter="url(#glow)"
              >
                {/* Doodle Robot Body */}
                <motion.path
                  d="M20 40 Q30 40 40 40 Q40 30 40 20 Q40 10 30 10 Q20 10 20 20 Q20 30 20 40"
                  fill="none"
                  stroke={darkMode ? "#9ca3af" : "#4b5563"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="2,3"
                  animate={{
                    d: [
                      "M20 40 Q30 40 40 40 Q40 30 40 20 Q40 10 30 10 Q20 10 20 20 Q20 30 20 40",
                      "M20 40 Q30 42 40 40 Q40 30 40 20 Q40 8 30 10 Q20 12 20 20 Q20 30 20 40",
                      "M20 40 Q30 40 40 40 Q40 30 40 20 Q40 10 30 10 Q20 10 20 20 Q20 30 20 40",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Expressive Eyes */}
                <motion.g
                  animate={{
                    y: [-2, 2, -2],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <circle
                    cx="26"
                    cy="24"
                    r="3"
                    fill={darkMode ? "#22d3ee" : "#06b6d4"}
                  />
                  <circle
                    cx="34"
                    cy="24"
                    r="3"
                    fill={darkMode ? "#22d3ee" : "#06b6d4"}
                  />
                  <motion.path
                    d="M26 28 Q30 30 34 28"
                    stroke={darkMode ? "#22d3ee" : "#06b6d4"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    animate={{
                      d: [
                        "M26 28 Q30 30 34 28",
                        "M26 28 Q30 31 34 28",
                        "M26 28 Q30 30 34 28",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.g>

                {/* Squiggly Antenna */}
                <motion.path
                  d="M30 10 Q28 6 30 2 Q32 0 30 -4"
                  stroke={darkMode ? "#9ca3af" : "#4b5563"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  animate={{
                    d: [
                      "M30 10 Q28 6 30 2 Q32 0 30 -4",
                      "M30 10 Q32 6 30 2 Q28 0 30 -4",
                      "M30 10 Q28 6 30 2 Q32 0 30 -4",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Wiggly Arms */}
                <motion.path
                  d="M16 30 Q12 30 8 32"
                  stroke={darkMode ? "#9ca3af" : "#4b5563"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  animate={{
                    d: [
                      "M16 30 Q12 30 8 32",
                      "M16 30 Q12 28 8 30",
                      "M16 30 Q12 30 8 32",
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.path
                  d="M44 30 Q48 30 52 32"
                  stroke={darkMode ? "#9ca3af" : "#4b5563"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  animate={{
                    d: [
                      "M44 30 Q48 30 52 32",
                      "M44 30 Q48 28 52 30",
                      "M44 30 Q48 30 52 32",
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.75,
                  }}
                />

                {/* Animated Blockchain Block */}
                <motion.g
                  animate={{
                    rotate: [-8, 8, -8],
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <motion.path
                    d="M24 44 L36 44 L36 56 L24 56 Z"
                    fill="none"
                    stroke={darkMode ? "#22d3ee" : "#06b6d4"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="4,4"
                    animate={{
                      strokeDashoffset: [0, 16],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <motion.text
                    x="30"
                    y="52"
                    fontSize="8"
                    fill={darkMode ? "#22d3ee" : "#06b6d4"}
                    textAnchor="middle"
                    animate={{
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    BLOCK
                  </motion.text>
                </motion.g>
              </motion.g>
            </svg>

            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <div className="flex items-center space-x-4">
                {/* Wallet Status */}
                <div
                  className={`px-4 py-2 rounded-full ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  {isConnecting ? (
                    <span>Connecting...</span>
                  ) : account ? (
                    <span className="text-sm">
                      {`${account.substring(0, 6)}...${account.substring(
                        account.length - 4
                      )}`}
                    </span>
                  ) : (
                    <button
                      onClick={connectWallet}
                      className="text-sm font-medium hover:opacity-80"
                    >
                      Connect Wallet
                    </button>
                  )}
                </div>

                {/* Home Button */}
                <button
                  onClick={handleGoToHomepage}
                  className={`p-2 rounded-full shadow-md transition-transform duration-150 ease-in-out transform hover:scale-105 ${
                    darkMode ? "bg-gray-700" : "bg-gray-300"
                  }`}
                >
                  <Home
                    size={24}
                    className={darkMode ? "text-white" : "text-gray-800"}
                  />
                </button>
                {/* Profile Icon Button near Home Button */}
                <button
                  onClick={() => {
                    setShowProfileCard((prev) => !prev);
                    if (!showProfileCard && user && !user.isAnonymous) {
                      fetchUserProfileData(user.uid);
                    } else if (!showProfileCard && user && user.isAnonymous) {
                      // For anonymous users, clear profileData or set minimal info
                      setProfileData(null);
                    }
                  }}
                  className={`ml-2 p-2 rounded-full shadow-md transition-transform duration-150 ease-in-out transform hover:scale-105 ${
                    darkMode ? "bg-gray-700" : "bg-gray-300"
                  }`}
                  aria-label="Profile"
                  title="Profile"
                >
                  <User
                    size={24}
                    className={darkMode ? "text-white" : "text-gray-800"}
                  />
                </button>
                {/* Profile Card Modal */}
                <Transition appear show={showProfileCard} as={Fragment}>
                  <Dialog
                    as="div"
                    className="relative z-50"
                    onClose={() => setShowProfileCard(false)}
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
                          <Dialog.Panel
                            className={`w-full max-w-md transform overflow-hidden rounded-2xl ${
                              darkMode
                                ? "bg-gray-900 text-white"
                                : "bg-white text-gray-900"
                            } p-6 text-left align-middle shadow-xl transition-all`}
                            style={{ backdropFilter: "blur(10px)" }}
                          >
                            <Dialog.Title
                              as="h3"
                              className="text-xl font-semibold mb-4 border-b pb-2"
                            >
                              User Profile
                            </Dialog.Title>
                            <div className="space-y-2">
                              <p className="text-sm">
                                <strong>Email:</strong>{" "}
                                {user && user.email
                                  ? user.email
                                  : "No email available"}
                              </p>
                              <p className="text-sm">
                                <strong>Anonymous:</strong>{" "}
                                {user && user.isAnonymous ? "Yes" : "No"}
                              </p>
                              {!user?.isAnonymous && profileData && (
                                <>
                                  {profileData.displayName && (
                                    <p className="text-sm">
                                      <strong>Display Name:</strong>{" "}
                                      {profileData.displayName}
                                    </p>
                                  )}
                                  {profileData.createdAt && (
                                    <p className="text-sm">
                                      <strong>Member Since:</strong>{" "}
                                      {profileData.createdAt.toDate
                                        ? profileData.createdAt
                                            .toDate()
                                            .toLocaleDateString()
                                        : new Date(
                                            profileData.createdAt
                                          ).toLocaleDateString()}
                                    </p>
                                  )}
                                </>
                              )}
                              {user?.isAnonymous && (
                                <p className="text-sm italic text-yellow-400">
                                  You are logged in anonymously.
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setShowProfileCard(false);
                                navigate("/account-settings");
                              }}
                              className={`mt-6 w-full py-2 rounded-md text-center font-semibold transition-colors duration-200 ${
                                darkMode
                                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                                  : "bg-blue-500 hover:bg-blue-600 text-white"
                              }`}
                            >
                              Edit Profile
                            </button>
                          </Dialog.Panel>
                        </Transition.Child>
                      </div>
                    </div>
                  </Dialog>
                </Transition>
                {/* Multi-Chain Network Selector near Home Button */}
                <select
                  className={`ml-2 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900"
                  }`}
                  value={selectedNetwork}
                  aria-label="Select blockchain network"
                  onChange={async (e) => {
                    const newNetwork = e.target.value;
                    try {
                      await checkAndSwitchNetwork(newNetwork);
                      setCurrentNetwork(newNetwork);
                      setSelectedNetwork(newNetwork);
                      showPopupMessage(`Switched to ${newNetwork}`, "success");
                    } catch (error) {
                      showPopupMessage(
                        `Failed to switch network: ${error.message}`,
                        "error"
                      );
                    }
                  }}
                >
                  <option value="ganache1">Ethereum</option>
                  <option value="ganache2">Polygon</option>
                  <option value="ganache3">Binance</option>
                </select>
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-full shadow-md transition-transform duration-150 ease-in-out transform hover:scale-105 ${
                    darkMode ? "bg-gray-700" : "bg-gray-300"
                  }`}
                >
                  {darkMode ? (
                    <Sun size={24} className="text-white" />
                  ) : (
                    <Moon size={24} />
                  )}
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
                  className={`overflow-hidden shadow rounded-lg ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  }`}
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
                          <dt className="text-sm font-medium truncate">
                            {status.title}
                          </dt>
                          <dd className="text-3xl font-semibold">
                            {status.count}
                          </dd>
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
                  <span className="text-center text-sm font-semibold">
                    {progress}%
                  </span>
                </div>
              ) : (
                <motion.div
                  className={`border-2 ${
                    dragging
                      ? "border-blue-500"
                      : darkMode
                      ? "border-gray-600"
                      : "border-gray-400"
                  } border-dashed rounded-lg p-8 w-full max-w-md text-center`}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  variants={hoverVariants}
                  onClick={() =>
                    document.querySelector('input[type="file"]').click()
                  }
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragEnter={() => setDragging(true)}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  <Upload
                    className={`mx-auto mb-2 ${
                      darkMode ? "text-white" : "text-gray-600"
                    }`}
                    size={32}
                  />
                  <p
                    className={`${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
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
                  {
                    <Link
                      to="/history"
                      className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full flex items-center"
                    >
                      View Upload History <List className="ml-2" size={16} />
                    </Link>
                  }
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
                      className={`p-4 rounded-lg shadow ${
                        darkMode ? "bg-gray-800" : "bg-white"
                      }`}
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
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              file.verificationStatus === "Verified"
                                ? "bg-green-100 text-green-800"
                                : file.verificationStatus === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : file.verificationStatus === "Revoked"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {file.verificationStatus}
                          </span>
                          {file.blockchainHash &&
                            file.verificationStatus !== "Revoked" && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    handleNotarizeDocument(file.content)
                                  }
                                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                  Notarize
                                </button>
                                <button
                                  onClick={() => initiateRevoke(file.id)}
                                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                >
                                  Revoke
                                </button>
                              </div>
                            )}
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
                <Dialog.Panel
                  className={`w-full max-w-md transform overflow-hidden rounded-2xl ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } p-6 text-left align-middle shadow-xl transition-all`}
                >
                  <Dialog.Title
                    as="h3"
                    className={`text-lg font-medium leading-6 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Upload File to Blockchain
                  </Dialog.Title>
                  <div className="mt-2">
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Are you sure you want to verify and upload "
                      {selectedFile?.name}" to the blockchain?
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className={`inline-flex justify-center rounded-md border border-transparent ${
                        darkMode
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-blue-100 hover:bg-blue-200"
                      } px-4 py-2 text-sm font-medium ${
                        darkMode ? "text-white" : "text-blue-900"
                      } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
                      onClick={confirmUpload}
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      className={`inline-flex justify-center rounded-md border border-transparent ${
                        darkMode
                          ? "bg-gray-600 hover:bg-gray-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      } px-4 py-2 text-sm font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      } focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2`}
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
      {/* Revoke Confirmation Dialog */}
      <Transition appear show={showRevokeConfirmation} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={cancelRevoke}>
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
                <Dialog.Panel
                  className={`w-full max-w-md transform overflow-hidden rounded-2xl ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } p-6 text-left align-middle shadow-xl transition-all`}
                >
                  <Dialog.Title
                    as="h3"
                    className={`text-lg font-medium leading-6 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Revoke Document Notarization
                  </Dialog.Title>
                  <div className="mt-2">
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Are you sure you want to revoke this document's
                      notarization? This action cannot be undone.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className={`inline-flex justify-center rounded-md border border-transparent ${
                        darkMode
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-red-100 hover:bg-red-200"
                      } px-4 py-2 text-sm font-medium ${
                        darkMode ? "text-white" : "text-red-900"
                      } focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2`}
                      onClick={() => handleRevokeNotarization(documentToRevoke)}
                    >
                      Revoke
                    </button>
                    <button
                      type="button"
                      className={`inline-flex justify-center rounded-md border border-transparent ${
                        darkMode
                          ? "bg-gray-600 hover:bg-gray-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      } px-4 py-2 text-sm font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
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
      <div className="relative">
        <motion.div
          className="fixed bottom-4 right-4 z-50 p-2 bg-opacity-50 bg-gray-100 dark:bg-gray-800 rounded-full cursor-pointer"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleIconClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          transition={{ duration: 0.2 }}
        >
          <DocumentIcon
            size={48}
            className={`${
              darkMode ? "text-white" : "text-gray-600"
            } transition-colors duration-200`}
          />
        </motion.div>

        {/* Tooltip */}
        <Transition
          show={showTooltip}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed bottom-20 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
            Click to open AI Assistant
          </div>
        </Transition>

        {/* Chatbot Modal */}
        {isChatbotOpen && (
          <div className="fixed bottom-24 right-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex justify-between items-center p-3 border-b dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white">
                AI Assistant
              </h3>
              <button
                onClick={() => setIsChatbotOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                ✕
              </button>
            </div>
            <NotaryChatbot />
          </div>
        )}
      </div>
    </div>
  );
};
export default Dashboard;
