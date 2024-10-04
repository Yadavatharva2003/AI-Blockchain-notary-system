'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Github, Linkedin, Mail, User, Users, School, Calendar, Target, Cpu, BookOpen, Award, ArrowLeft } from 'lucide-react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

const teamMembers = [
  { name: "Siddhesh Waghmare", role: "A-65", image: "/placeholder.svg?height=400&width=400" },
  { name: "Atharva Yadav", role: "A-66", image: "/placeholder.svg?height=400&width=400" },
  { name: "Meghraj Thaware", role: "A-59", image: "/placeholder.svg?height=400&width=400" },
 { name: "Subhash Hingmire", role: "A-18", image: "/placeholder.svg?height=400&width=400" },
];

const technologies = [
  "AI", "Blockchain", "React",  "Node.js", "Firebase"
];

const projectGoals = [
  "Enhance the security and authenticity of notarized documents",
  "Streamline the notarization process using AI technologies",
  "Provide a transparent and immutable record-keeping system through blockchain",
  "Reduce fraud and errors in document verification"
];

function AnimatedSphere() {
  const mesh = useRef();
  useFrame((state, delta) => {
    mesh.current.rotation.x = mesh.current.rotation.y += 0.01;
  });
  return (
    <Sphere visible args={[1, 100, 200]} ref={mesh}>
      <MeshDistortMaterial
        color="#8ECAE6"
        attach="material"
        distort={0.3}
        speed={1.5}
        roughness={0}
      />
    </Sphere>
  );
}

const AboutUs = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 0, 0, 1]);

  const sections = ['hero', 'overview', 'team', 'guide', 'goals', 'technologies', 'contact', 'acknowledgments', 'thankyou'];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const newSection = Math.floor(scrollPosition / windowHeight);
      setCurrentSection(newSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div ref={containerRef} className="bg-gradient-to-b from-gray-900 to-black text-white">
      <motion.div
        className="fixed top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-blue-900 to-purple-900 opacity-50"
        style={{ opacity }}
      />

      {/* Back Arrow */}
      <motion.button
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-300"
        onClick={handleBackToDashboard}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ArrowLeft size={24} color="white" />
      </motion.button>

      {sections.map((section, index) => (
        <section key={section} className="h-screen snap-start flex flex-col justify-center items-center relative overflow-hidden p-8">
          <AnimatePresence>
            {currentSection === index && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={fadeInUp}
                className="text-center z-10 max-w-4xl"
              >
                {section === 'hero' && (
                  <>
                    <motion.h1 
                      className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300"
                      variants={fadeInUp}
                    >
                      AI & Blockchain Based Notary System
                    </motion.h1>
                    <motion.p 
                      className="text-xl mb-8 text-blue-200"
                      variants={fadeInUp}
                    >
                      Revolutionizing document verification
                    </motion.p>
                    <motion.div 
                      className="w-full h-64"
                      variants={fadeInUp}
                    >
                      <Canvas>
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} />
                        <AnimatedSphere />
                        <OrbitControls enableZoom={false} />
                      </Canvas>
                    </motion.div>
                  </>
                )}

                {section === 'overview' && (
                  <>
                    <motion.h2 
                      className="text-4xl font-bold mb-4 text-blue-300"
                      variants={fadeInUp}
                    >
                      Project Overview
                    </motion.h2>
                    <motion.p 
                      className="text-xl text-purple-200"
                      variants={fadeInUp}
                    >
                      We are a team of undergraduate students working on an innovative project
                      that aims to revolutionize the traditional notary process by integrating
                      cutting-edge technologies like artificial intelligence and blockchain.
                    </motion.p>
                  </>
                )}

                {section === 'team' && (
                  <>
                    <motion.h2 
                      className="text-4xl font-bold mb-8 text-blue-300"
                      variants={fadeInUp}
                    >
                      Our Team
                    </motion.h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      {teamMembers.map((member, i) => (
                        <motion.div
                          key={i}
                          className="bg-gradient-to-br from-blue-900 to-purple-900 p-4 rounded-lg shadow-lg"
                          variants={fadeInUp}
                          whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(147, 197, 253, 0.5)" }}
                        >
                          <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-blue-200">{member.name}</h3>
                          <p className="text-purple-300">{member.role}</p>
                        </motion.div>
                      ))}
                    </div>
                    <motion.p 
                      className="mt-8 text-purple-200"
                      variants={fadeInUp}
                    >
                      We are (final-year) B.Tech students in the Department of Computer Science & Engineering at N.K. Orchid College of Engineering & Technology, Solapur.
                    </motion.p>
                  </>
                )}

                {section === 'guide' && (
                  <>
                    <motion.h2 
                      className="text-4xl font-bold mb-4 text-blue-300"
                      variants={fadeInUp}
                    >
                      Project Guide
                    </motion.h2>
                    <motion.p 
                      className="text-xl text-purple-200"
                      variants={fadeInUp}
                    >
                      Our project is being developed under the expert guidance of Prof. R.U. Shinde from the Department of Computer Science & Engineering.
                    </motion.p>
                    <motion.p 
                      className="text-xl mt-4 text-blue-200"
                      variants={fadeInUp}
                    >
                      <Calendar className="inline mr-2" />
                      Academic Year: 2024-2025 (Seventh Semester)
                    </motion.p>
                  </>
                )}

                {section === 'goals' && (
                  <>
                    <motion.h2 
                      className="text-5xl font-bold mb-8 text-blue-300"
                      variants={fadeInUp}
                    >
                      Project Goals
                    </motion.h2>
                    <ul className="text-left">
                      {projectGoals.map((goal, i) => (
                        <motion.li
                          key={i}
                          className="mb-6 flex items-center text-purple-200 text-2xl"
                          variants={fadeInUp}
                          custom={i}
                          animate="visible"
                          initial="hidden"
                        >
                          <Target className="mr-4 text-blue-400 flex-shrink-0 w-8 h-8" />
                          {goal}
                        </motion.li>
                      ))}
                    </ul>
                  </>
                )}

                {section === 'technologies' && (
                  <>
                    <motion.h2 
                      className="text-5xl font-bold mb-8 text-blue-300"
                      variants={fadeInUp}
                    >
                      Technologies
                    </motion.h2>
                    <div className="flex flex-wrap justify-center gap-4">
                      {technologies.map((tech, i) => (
                        <motion.div
                          key={i}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 rounded-full text-white text-2xl font-semibold"
                          variants={fadeInUp}
                          custom={i}
                          whileHover={{ scale: 1.1, boxShadow: "0px 0px 8px rgba(147, 197, 253, 0.5)" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {tech}
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}

                {section === 'contact' && (
                  <>
                    <motion.h2 
                      className="text-4xl font-bold mb-8 text-blue-300"
                      variants={fadeInUp}
                    >
                      Contact Us
                    </motion.h2>
                    <div className="flex space-x-4">
                      {[
                        { icon: <Mail />, text: "Email" },
                        { icon: <Github />, text: "GitHub" },
                        { icon: <Linkedin />, text: "LinkedIn" },
                      ].map((item, i) => (
                        <motion.button
                          key={i}
                          className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-full text-white"
                          variants={fadeInUp}
                          custom={i}
                          whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(147, 197, 253, 0.5)" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {item.icon}
                          <span className="ml-2">{item.text}</span>
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}

                {section === 'acknowledgments' && (
                  <>
                    <motion.h2 
                      className="text-4xl font-bold mb-8 text-blue-300"
                      variants={fadeInUp}
                    >
                      Acknowledgments
                    </motion.h2>
                    <motion.p 
                      className="text-xl text-purple-200"
                      variants={fadeInUp}
                    >
                      We would like to express our gratitude to Prof. R.U. Shinde and the entire faculty of the Computer Science & Engineering department for their support and guidance throughout this project.
                    </motion.p>
                  </>
                )}

                {section === 'thankyou' && (
                  <>
                    <motion.h2 
                      className="text-6xl font-bold mb-8 text-blue-300"
                      variants={fadeInUp}
                    >
                      Thank You
                    </motion.h2>
                    <motion.p 
                      className="text-2xl text-purple-200"
                      variants={fadeInUp}
                    >
                      We appreciate your interest in our AI & Blockchain Based Notary System project.
                    </motion.p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      ))}

      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center bg-gradient-to-r from-blue-900 to-purple-900 bg-opacity-50 backdrop-filter backdrop-blur-lg">
        <p className="text-blue-200">© 2024 AI & Blockchain Based Notary System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AboutUs;