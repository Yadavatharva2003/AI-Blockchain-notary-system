"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Home, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "./firebase"; // Import Firebase auth instance

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");
  const [showResetField, setShowResetField] = useState(false); // State for showing/hiding reset field

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("darkMode");
      return savedMode ? JSON.parse(savedMode) : false;
    }
    return false;
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", JSON.stringify(newMode));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message
    setSuccess(""); // Reset success message

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Reload the user to get updated user information, including email verification status
      await user.reload(); // Ensure the latest user information is fetched
      const updatedUser = auth.currentUser; // Get the latest user info after reload

      // Check if the user's email is verified
      if (updatedUser.emailVerified) {
        setSuccess("Login successful. Redirecting...");
        setTimeout(() => navigate("/dashboard", { replace: true }), 2000); // Redirect after successful login
      } else {
        setError("Please verify your email before logging in.");
        await sendEmailVerification(updatedUser); // Resend verification email if needed
      }
    } catch (error) {
      setError("Invalid credentials. Please try again.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");

    try {
      const user = await auth.getUserByEmail(email); // Fetch user by email to check verification status

      // Check if the user's email is verified
      if (user.emailVerified) {
        await sendPasswordResetEmail(auth, email); // Use the email already provided for login
        setResetSuccess("Password reset email sent. Please check your inbox.");
        setShowResetField(false); // Hide the reset field
      } else {
        setResetError(
          "Email not verified. Please verify your email before resetting your password."
        );
      }
    } catch (error) {
      setResetError(
        "Failed to send reset email. Please check the email address and try again or check email is verified or not."
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
            {/* Home button */}
            <button
              onClick={() => navigate("/", { replace: true })}
              className={`p-2 rounded-full shadow-md transition-all duration-300 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              <Home
                size={24}
                className={`${darkMode ? "text-yellow-400" : "text-gray-700"}`}
              />
            </button>
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full shadow-md transition-all duration-300 ${
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
            <div>
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
            </div>
            <div>
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
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm ${
                darkMode
                  ? "text-white bg-blue-600 hover:bg-blue-700"
                  : "text-gray-700 bg-white hover:bg-gray-50"
              } transition-all duration-300`}
            >
              <LogIn className="mr-2" size={20} />
              Login
            </motion.button>
          </form>

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

          {/* Forgot Password */}
          <p className="mt-4 text-sm">
            Forgot your password?{" "}
            <button
              onClick={() => setShowResetField(true)}
              className="text-blue-600 hover:underline"
            >
              Reset Password
            </button>
          </p>

          {/* Reset password form */}
          {showResetField && (
            <motion.div className="space-y-4 mt-4">
              <p className="text-gray-500">
                A password reset email will be sent to {email}.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetPassword}
                className={`w-full px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm ${
                  darkMode
                    ? "text-white bg-green-600 hover:bg-green-700"
                    : "text-gray-700 bg-white hover:bg-gray-50"
                } transition-all duration-300`}
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
