import React, { useState, useEffect } from "react";
import "./NotaryChatbot.css";

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
