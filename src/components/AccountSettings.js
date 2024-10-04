'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown, ChevronUp, Moon, Sun, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = 'default', className = '', ...props }) => {
  const baseStyle = 'px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    default: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700',
    destructive: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700',
    outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600',
    link: 'bg-transparent text-blue-500 hover:underline focus:ring-blue-500 dark:text-blue-400',
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = React.forwardRef(({ className = '', ...props }, ref) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${className}`}
    ref={ref}
    {...props}
  />
));

const Label = ({ children, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}>
    {children}
  </label>
);

const Switch = ({ checked, onChange }) => (
  <div 
    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer ${
      checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
    }`}
    onClick={() => onChange(!checked)}
  >
    <motion.div 
      className="bg-white w-4 h-4 rounded-full shadow-md"
      layout
      transition={spring}
      animate={{ x: checked ? 20 : 0 }}
    />
  </div>
);

const spring = {
  type: "spring",
  stiffness: 700,
  damping: 30
};

const AccountSettings = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [date, setDate] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    // Check if dark mode preference is stored in localStorage
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode !== null) {
      setDarkMode(JSON.parse(storedDarkMode));
    } else {
      // Check user's system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Store the preference in localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
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

      <div className="relative z-10">
        <div className="container mx-auto py-10 space-y-8">
          <motion.div 
            className="flex items-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button 
              onClick={handleBackToDashboard} 
              className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Account Settings
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <h2 className="text-2xl font-semibold mb-2">Your Profile</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">This is how others see you on the site.</p>
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-semibold">John Doe</h2>
                  <p className="text-gray-600 dark:text-gray-400">john.doe@example.com</p>
                  <p className="text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
                </div>
                <Button 
                  className="ml-auto" 
                  onClick={() => setEditingProfile(!editingProfile)}
                >
                  {editingProfile ? "Cancel Edit" : "Edit Profile"}
                </Button>
              </div>
            </Card>
          </motion.div>

          <AnimatePresence>
            {editingProfile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <h2 className="text-2xl font-semibold mb-2">Edit Profile</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Update your personal information here.</p>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="John Doe" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john.doe@example.com" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                    </div>
                    <div>
                      <Label>Date of Birth</Label>
                      <Button variant="outline" className="w-full justify-between">
                        {date ? format(date, "PPP") : "Pick a date"}
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor="profile-picture">Profile Picture</Label>
                      <Input id="profile-picture" type="file" accept="image/*" />
                    </div>
                    <Button>Save Changes</Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div className="space-y-4" layout>
            <motion.div layout>
              <Card>
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection("password")}
                >
                  <h2 className="text-xl font-semibold">Change Password</h2>
                  {expandedSection === "password" ? <ChevronUp /> : <ChevronDown />}
                </div>
                <AnimatePresence>
                  {expandedSection === "password" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mt-4 space-y-4">
                        <div>
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input id="current-password" type="password" />
                        </div>
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" />
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                        <div className="flex items-center">
                          <Button variant="link" className="px-0">Forgot password?</Button>
                          <div className="w-4"></div>
                          <Button>Update Password</Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            <motion.div layout>
              <Card>
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection("preferences")}
                >
                  <h2 className="text-xl font-semibold">Account Preferences</h2>
                  {expandedSection === "preferences" ? <ChevronUp /> : <ChevronDown />}
                </div>
                <AnimatePresence>
                  {expandedSection === "preferences" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="dark-mode" className="flex items-center">
                            <span className="mr-2">Dark Mode</span>
                            {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                          </Label>
                          <Switch
                            checked={darkMode}
                            onChange={handleDarkModeToggle}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            <motion.div layout>
              <Card>
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection("delete")}
                >
                  <h2 className="text-xl font-semibold">Delete Account</h2>
                  {expandedSection === "delete" ? <ChevronUp /> : <ChevronDown />}
                </div>
                <AnimatePresence>
                  {expandedSection === "delete" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button variant="destructive">Delete Account</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;