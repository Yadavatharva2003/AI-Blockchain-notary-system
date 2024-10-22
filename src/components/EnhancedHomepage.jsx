'use client';
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sun, Moon, ArrowRight, Upload, CheckCircle, Database, Key, ChevronUp } from 'lucide-react';

// Import the video
import introVideo from '../assets/videos/intro-video.mp4'; // Adjust the path as necessary

const staticText = "DocuVerify is a cutting-edge document verification platform that leverages blockchain technology to ensure the authenticity and integrity of your important documents. With our state-of-the-art system, you can securely upload, verify, and manage your documents with ease and confidence.";

const features = [
  { title: 'Blockchain Security', description: 'Utilize the power of blockchain for tamper-proof verification', icon: <Database className="w-12 h-12" /> },
  { title: 'Instant Verification', description: 'Get your documents verified in seconds, not days', icon: <CheckCircle className="w-12 h-12" /> },
  { title: 'Global Acceptance', description: 'Our verified documents are accepted worldwide', icon: <Upload className="w-12 h-12" /> },
];

const steps = [
  { icon: <Upload className="w-8 h-8" />, title: 'Upload', description: 'Securely upload your document to our platform' },
  { icon: <CheckCircle className="w-8 h-8" />, title: 'Verify', description: 'Our AI-powered system verifies the document\'s authenticity' },
  { icon: <Database className="w-8 h-8" />, title: 'Store', description: 'The verified document is securely stored on the blockchain' },
  { icon: <Key className="w-8 h-8" />, title: 'Access', description: 'Access and share your verified documents anytime, anywhere' },
];


const SquareWave = () => (
  <div className="absolute inset-0 overflow-hidden">
    {[1, 2, 3].map((index) => (
      <motion.div
        key={index}
        className="absolute bottom-0 left-0 right-0 h-64 bg-teal-300 dark:bg-teal-700 opacity-30"
        style={{
          originY: 1,
        }}
        animate={{
          scaleY: [1, 1.5, 1],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.5,
        }}
      />
    ))}
  </div>
);

const Button = ({ children, variant = 'primary', size = 'md', className = '', href, onClick, ...props }) => {
  const baseStyle = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700',
    secondary: 'bg-teal-100 text-teal-900 hover:bg-teal-200',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };
  
  const sizes = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 py-2 px-4',
    lg: 'h-11 px-8 text-lg',
    icon: 'h-10 w-10',
  };
  
  const classes = `${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`;
  
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }
  
  return (
    <button className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default function EnhancedHomepage() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);
  const [isVideoOpen, setIsVideoOpen] = useState(false); // State to manage video modal

  useEffect(() => {
    // Check for saved dark mode preference
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedMode !== null ? JSON.parse(savedMode) : prefersDark;
    setDarkMode(initialDarkMode);
    
    // Apply dark mode class to body
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    const handleScroll = () => {
      const sections = ['home', 'features', 'how-it-works', 'showcase']; // Removed 'cta' from here
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if the section is in view
          return rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2; // Adjust this threshold as needed
        }
        return false;
      });
      if (currentSection) {
        console.log("Current Section:", currentSection); // Debugging line
        setActiveSection(currentSection);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const openVideo = () => {
    setIsVideoOpen(true);
  };

  const closeVideo = () => {
    setIsVideoOpen(false);
  };

  const scrollToNextSection = () => {
    const sections = ['home', 'features', 'how-it-works', 'showcase', 'cta']; // Add all section IDs here
    const currentIndex = sections.indexOf(activeSection);
    const nextSection = sections[currentIndex + 1];

    if (nextSection) {
      const element = document.getElementById(nextSection);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300`}>
      {/* Sticky Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-lg font-bold text-gray-800 dark:text-gray-100">DocuVerify</div>
          <ul className="flex space-x-4">
            <li>
              <a href="#home" className={`text-gray-600 dark:text-gray-300 ${activeSection === 'home' ? 'text-[rgb(13,148,136)]' : 'hover:text-teal-600'}`}>Home</a>
            </li>
            <li>
              <a href="#features" className={`text-gray-600 dark:text-gray-300 ${activeSection === 'features' ? 'text-[rgb(13,148,136)]' : 'hover:text-teal-600'}`}>Features</a>
            </li>
            <li>
              <a href="#how-it-works" className={`text-gray-600 dark:text-gray-300 ${activeSection === 'how-it-works' ? 'text-[rgb(13,148,136)]' : 'hover:text-teal-600'}`}>How It Works</a>
            </li>
            <li>
              <a href="#showcase" className={`text-gray-600 dark:text-gray-300 ${activeSection === 'showcase' ? 'text-[rgb(13,148,136)]' : 'hover:text-teal-600'}`}>Showcase</a>
            </li>
            {/* CTA link removed */}
          </ul>
        </div>
      </nav>

      <div className={`bg-gradient-to-br from-teal-50 to-indigo-100 dark:from-teal-900 dark:to-indigo-900 min-h-screen transition-colors duration-300`}>
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
          <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
            <motion.h1 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold text-teal-600 dark:text-teal-300"
            >
              DocuVerify
            </motion.h1>
            <ul className="flex space-x-4">
              {['home', 'features', 'how-it-works', 'showcase'].map((section) => ( // Removed 'cta' from here
                <motion.li key={section}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <a 
                    href={`#${section}`}
                    className={`text-sm font-medium ${activeSection === section ? 'text-teal-600 dark:text-teal-300' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="flex items-center space-x-4">
              <Button variant="primary" href="/login">Login</Button>
              <Button href="/signup">Sign Up</Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </nav>
        </header>
        
        <main className="pt-20">
          <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <SquareWave />
            <div className="container mx-auto px-4 text-center relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl font-bold mb-6 text-gray-800 dark:text-gray-100"
              >
                Welcome to DocuVerify
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl mb-8 max-w-2xl mx-auto text-gray-600 dark:text-gray-300"
              >
                {staticText}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button size="lg" href="/dashboard">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </section>
          
          <section id="features" className="py-20 bg-white dark:bg-gray-800">
            <div className="container mx-auto px-4">
              <h3 className="text-3xl font-bold mb-12 text-center text-gray-800 dark:text-gray-100">Our Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-teal-50 dark:bg-teal-900 rounded-lg shadow-lg p-6 flex flex-col items-center text-center"
                  >
                    <div className="text-teal-600 dark:text-teal-300 mb-4">
                      {feature.icon}
                    </div>
                    <h4 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{feature.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
          
          <section id="how-it-works" className="py-20">
            <div className="container mx-auto px-4">
              <h3 className="text-3xl font-bold mb-12 text-center text-gray-800 dark:text-gray-100">How It Works</h3>
              <div className="relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-teal-600 dark:bg-teal-400 transform -translate-x-1/2" />
                {steps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="flex items-center mb-16"
                  >
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <h4 className="text-2xl font-semibold mb-2 text-teal-600 dark:text-teal-300">{step.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-teal-600 dark:bg-teal-400 flex items-center justify-center z-10">
                      {step.icon}
                    </div>
                    <div className="w-1/2" />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Showcase Section */}
          <section id="showcase" className="py-20 bg-teal-100 dark:bg-teal-800">
            <div className="container mx-auto px-4 text-center">
              <div className="p-6">
                <h3 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Showcase</h3>
                <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">Watch our video to see how DocuVerify works in action.</p>
                <Button size="lg" onClick={openVideo}>
                  Watch Video
                </Button>
              </div>
            </div>
          </section>
          
          <section id="cta" className="py-20 bg-teal-600 dark:bg-teal-800">
            <div className="container mx-auto px-4 text-center">
              <h3 className="text-3xl font-bold mb-6 text-white">Ready to Secure Your Documents?</h3>
              <p className="text-xl mb-8 text-teal-100">Join DocuVerify today and experience the future of document verification.</p>
              <Button size="lg" variant="secondary" href="/signup">
                Create Your Account <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </section>
        </main>
        
        <footer className="bg-gray-100 dark:bg-gray-800 py-8">
          <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
            <p>&copy; {new Date().getFullYear()} DocuVerify. All rights reserved.</p>
          </div>
        </footer>
        
        {/* Downward Arrow Button */}
        <motion.div 
          className="fixed bottom-4 right-4"
          style={{ opacity }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={scrollToNextSection} // Scroll to the next section
            aria-label="Scroll down"
          >
            <ChevronUp className="h-8 w-8 transform rotate-180" /> {/* Increased size */}
          </Button>
        </motion.div>
        
        {/* Video Modal */}
        {isVideoOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
            <div className="bg-white rounded-lg p-4 relative w-full max-w-6xl">
              <button 
                onClick={closeVideo} 
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-4xl p-2 rounded-full"
                style={{ zIndex: 10 }}
              >
                &times;
              </button>
              <video 
                className="w-full h-[600px] rounded-lg"
                controls 
                autoPlay 
              >
                <source src={introVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
