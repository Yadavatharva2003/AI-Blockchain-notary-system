import React, { useState, useEffect } from "react";
import "./NotaryChatbot.css";
import { FaDownload, FaCopy } from "react-icons/fa";
const NotaryChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [theme, setTheme] = useState("light");
  const [isTyping, setIsTyping] = useState(false); // Track if the bot is typing

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const themeChangeHandler = (e) => {
      setTheme(e.matches ? "dark" : "light");
    };

    setTheme(darkModeMediaQuery.matches ? "dark" : "light");
    darkModeMediaQuery.addEventListener("change", themeChangeHandler);

    return () =>
      darkModeMediaQuery.removeEventListener("change", themeChangeHandler);
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    // Add user message to chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: input, isUser: true },
    ]);

    setInput(""); // Clear the input field
    setIsTyping(true); // Set bot as typing

    try {
      const response = await fetch("http://localhost:3001/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botResponse = data.response;

      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: botResponse, isUser: false },
        ]);
        setIsTyping(false); // Stop typing after the bot responds
      }, 1000); // Simulate delay of the bot typing
    } catch (error) {
      console.error("Error communicating with the server:", error);
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  // Function to download the text as a file
  const downloadTextFile = (text) => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "chatbot_response.txt"; // Default file name
    link.click();
  };

  return (
    <div className={`chatbot-container ${theme}`}>
      <div className="robot-doodle">
        <div className="robot-head">
          <div className="robot-eyes">
            <div className="eye"></div>
            <div className="eye"></div>
          </div>
          <div className="robot-mouth"></div>
        </div>
      </div>
      <div className="chat-messages">
        {messages.reverse().map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.isUser ? "user-message" : "bot-message"
            }`}
          >
            {message.text}
            {/* Add Copy and Download buttons */}
            {!message.isUser && (
              <div className="message-actions">
                <FaCopy
                  className="action-icon"
                  onClick={() => copyToClipboard(message.text)}
                />
                <FaDownload
                  className="action-icon"
                  onClick={() => downloadTextFile(message.text)}
                />
              </div>
            )}
          </div>
        ))}

        {/* Display typing indicator */}
        {isTyping && (
          <div className="typing-indicator">
            <span>Chatbot is typing</span>
            <div className="typing-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message here..."
          className="chat-input"
        />
        <button type="submit" className="chat-submit">
          Send
        </button>
      </form>
    </div>
  );
};

export default NotaryChatbot;
