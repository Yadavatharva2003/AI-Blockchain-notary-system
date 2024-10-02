'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, LogIn, UserPlus, Moon, Sun, Upload, CheckCircle, Database, Key } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function EnhancedHomepage() {
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode')
      return savedMode ? JSON.parse(savedMode) : false
    }
    return false
  })

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', JSON.stringify(newMode))
    }
  }

  const steps = [
    { number: 1, icon: <Upload size={32} />, title: 'Upload', description: 'Securely upload your document to our platform' },
    { number: 2, icon: <CheckCircle size={32} />, title: 'Verify', description: 'Our AI-powered system verifies the document\'s authenticity' },
    { number: 3, icon: <Database size={32} />, title: 'Store', description: 'The verified document is securely stored on the blockchain' },
    { number: 4, icon: <Key size={32} />, title: 'Access', description: 'Access and share your verified documents anytime, anywhere' },
  ]

  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prevStep) => {
        if (prevStep < steps.length) {
          return prevStep + 1
        } else if (prevStep === steps.length) {
          return -1 // All steps disappear
        }
        return 0 // Restart the sequence
      })
    }, 3000) // Change step every 3 seconds
    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-20" />
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                opacity: Math.random() * 0.5 + 0.1,
                animation: `float ${Math.random() * 10 + 5}s linear infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <header className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-bold">DocuVerify</h1>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-md ${darkMode ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
              >
                <LogIn className="inline-block mr-2" size={20} />
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-md ${darkMode ? 'bg-purple-600 text-white' : 'bg-white text-purple-600'}`}
              >
                <UserPlus className="inline-block mr-2" size={20} />
                Sign Up
              </motion.button>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full shadow-md transition-all duration-300 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {darkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-gray-700" />}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-4xl font-extrabold mb-8">Welcome to DocuVerify</h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto">
              DocuVerify is a cutting-edge document verification platform that leverages blockchain technology to ensure
              the authenticity and integrity of your important documents. With our state-of-the-art system, you can
              securely upload, verify, and manage your documents with ease and confidence.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <button
                onClick={() => navigate('/dashboard')}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm ${darkMode ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-700 bg-white hover:bg-gray-50'} transition-all duration-300`}
              >
                Get Started
                <ArrowRight className="ml-2" size={20} />
              </button>
            </motion.div>
          </motion.div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[ 
              { title: 'Blockchain Security', description: 'Utilize the power of blockchain for tamper-proof verification' },
              { title: 'Instant Verification', description: 'Get your documents verified in seconds, not days' },
              { title: 'Global Acceptance', description: 'Our verified documents are accepted worldwide' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-6 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-32">
            <h3 className="text-3xl font-bold mb-12 text-center">How It Works</h3>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-600" />
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={currentStep >= index ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center mb-16 relative"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold z-10 ${darkMode ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-2 border-blue-600'}`}>
                    {step.number}
                  </div>
                  <div className="ml-8">
                    <h4 className="text-2xl font-semibold mb-2">{step.title}</h4>
                    <p className="text-lg">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-blue-600" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <footer className={`py-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>© 2024 DocuVerify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
