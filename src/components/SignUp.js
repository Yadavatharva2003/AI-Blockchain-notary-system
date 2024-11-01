"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Home, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase"; // Import Firebase auth
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const db = getFirestore();

const SignUp = () => {
  const navigate = useNavigate();
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [message, setMessage] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages

    try {
      // Check if the email already exists
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        // Email already exists
        setMessage(
          "An account with this email already exists. Please login instead."
        );
        return;
      }

      // Create a new user using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Send verification email
      await sendEmailVerification(user);
      setMessage(
        "Verification email sent! Please verify your email before logging in."
      );

      // Save user info to Firestore with different field names
      await setDoc(doc(db, "users", user.uid), {
        name: fullName, // 'name' instead of 'fullName'
        email: email, // 'emailAddress' instead of 'email'
        dob: dateOfBirth, // 'dob' instead of 'dateOfBirth'
        phone: phoneNumber, // 'phone' instead of 'phoneNumber'
      });

      // Optionally, save user info to your database, then redirect to another page
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    } catch (error) {
      // Handle signup errors
      setMessage(error.message);
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
          <h2 className="text-4xl font-extrabold mb-8">
            Sign Up for DocuVerify
          </h2>
          <form className="space-y-6" onSubmit={handleSignUp}>
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md ${
                  darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                }`}
                required
              />
            </div>
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
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => {
                  // Ensure that only digits are entered and limit length
                  const value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-digit characters
                  if (value.length <= 10) {
                    // Limit to 10 digits
                    setPhoneNumber(value);
                  }
                }}
                className={`w-full px-4 py-2 border rounded-md ${
                  darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                }`}
                required
              />
            </div>
            <div>
              <input
                type="date"
                placeholder="Date of Birth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
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
                  ? "text-white bg-purple-600 hover:bg-purple-700"
                  : "text-gray-700 bg-white hover:bg-gray-50"
              } transition-all duration-300`}
            >
              <UserPlus className="mr-2" size={20} />
              Sign Up
            </motion.button>
          </form>
          <p className="mt-6 text-sm">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline"
            >
              Login
            </button>
          </p>
          {message && <p className="mt-6 text-red-500">{message}</p>}
        </motion.div>
      </main>
    </div>
  );
};

export default SignUp;
