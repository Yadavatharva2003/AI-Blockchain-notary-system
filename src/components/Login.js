"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Home, Moon, Sun, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInAnonymously,
} from "firebase/auth";
import { auth } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { BrowserProvider } from "ethers";

const db = getFirestore();

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");
  const [showResetField, setShowResetField] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("darkMode");
      return savedMode ? JSON.parse(savedMode) : false;
    }
    return false;
  });

  const connectMetaMaskAndGenerateDID = async () => {
    if (!window.ethereum) throw new Error("MetaMask is not installed");
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const signature = await signer.signMessage(
      "Log in to DocuVerify on " + new Date().toISOString()
    );
    const did = `did:ethr:${address}`;
    return { address, signature, did };
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", JSON.stringify(newMode));
    }
  };

  // Separate handleLogin for email login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      await user.reload();

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        setError("Please verify your email before logging in.");
        return;
      }

      const { address, signature, did } = await connectMetaMaskAndGenerateDID();
      const didDocRef = doc(db, "dids", user.uid);
      const didSnap = await getDoc(didDocRef);

      if (!didSnap.exists()) {
        await setDoc(
          doc(db, "users", user.uid),
          {
            email: user.email,
            uid: user.uid,
            did,
            ethAddress: address,
            signature,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
        setSuccess("DID created and login successful.");
      } else {
        setSuccess("Login successful.");
      }
      console.log("Redirecting to Dashboard"); // Debugging line
      setTimeout(() => navigate("/dashboard", { replace: true }), 2000);
    } catch (err) {
      console.error(err);
      setError("Login failed: " + (err.message || "Unknown error"));
    }
  };

  // Separate handleLogin for DID login

  const handleLoginWithDID = async () => {
    setError("");
    setSuccess("");
    try {
      const { address, signature, did } = await connectMetaMaskAndGenerateDID();
      const usersRef = doc(db, "users", address.toLowerCase());
      const userSnap = await getDoc(usersRef);

      if (!userSnap.exists()) {
        await setDoc(usersRef, {
          did,
          ethAddress: address,
          signature,
          createdAt: serverTimestamp(),
        });
        setSuccess("DID-based account created successfully.");
      } else {
        setSuccess("DID-based login successful.");
      }

      // Sign in anonymously to Firebase Auth to set user state
      await signInAnonymously(auth);

      console.log("Navigating to Dashboard now"); // Added log before navigate
      navigate("/dashboard", { replace: true }); // Removed setTimeout for immediate navigation
    } catch (err) {
      console.error(err);
      setError("DID Login failed: " + err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");

    try {
      await sendPasswordResetEmail(auth, email);
      setResetSuccess("Password reset email sent. Please check your inbox.");
      setShowResetField(false);
    } catch (error) {
      setResetError(
        "Failed to send reset email. Make sure the email is correct and verified."
      );
    }
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">DocuVerify</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/", { replace: true })}
              className={`p-2 rounded-full shadow-md ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              <Home
                size={24}
                className={darkMode ? "text-yellow-400" : "text-gray-700"}
              />
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full shadow-md ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {darkMode ? (
                <Sun size={24} className="text-yellow-400" />
              ) : (
                <Moon size={24} className="text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-4xl font-extrabold mb-8">Login to DocuVerify</h2>
          <form className="space-y-6" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              }`}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              }`}
              required
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className={`w-full flex items-center justify-center px-6 py-3 rounded-md shadow-sm ${
                darkMode
                  ? "text-white bg-blue-600 hover:bg-blue-700"
                  : "text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <LogIn className="mr-2" size={20} />
              Login
            </motion.button>
          </form>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLoginWithDID}
            className={`w-full mt-4 flex items-center justify-center px-6 py-3 rounded-md shadow-sm ${
              darkMode
                ? "text-white bg-purple-600 hover:bg-purple-700"
                : "text-white bg-gray-800 hover:bg-black"
            }`}
          >
            <KeyRound className="mr-2" size={20} />
            Login with DID (MetaMask)
          </motion.button>

          {error && <p className="mt-4 text-red-600">{error}</p>}
          {success && <p className="mt-4 text-green-600">{success}</p>}

          <p className="mt-6 text-sm">
            Don’t have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-600 hover:underline"
            >
              Sign Up
            </button>
          </p>

          <p className="mt-4 text-sm">
            Forgot your password?{" "}
            <button
              onClick={() => setShowResetField(true)}
              className="text-blue-600 hover:underline"
            >
              Reset Password
            </button>
          </p>

          {showResetField && (
            <motion.div className="space-y-4 mt-4">
              <p className="text-gray-500">
                A password reset email will be sent to {email}.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetPassword}
                className={`w-full px-6 py-3 rounded-md shadow-sm ${
                  darkMode
                    ? "text-white bg-green-600 hover:bg-green-700"
                    : "text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                Send Reset Email
              </motion.button>
              {resetError && <p className="text-red-600">{resetError}</p>}
              {resetSuccess && <p className="text-green-600">{resetSuccess}</p>}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Login;
