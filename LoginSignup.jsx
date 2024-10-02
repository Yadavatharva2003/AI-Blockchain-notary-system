import React, { useState } from 'react';
import './LoginSignup.css';
import user_icon from '../Assests/person.png';
import email_icon from '../Assests/email.png';
import password_icon from '../Assests/password.png';

export const LoginSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [action, setAction] = useState("Login");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [popUp, setPopUp] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const toggleMode = () => {
    setDarkMode(!darkMode);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate input in real-time
    if (name === 'email') {
      validateEmail(value);
    } else if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { email, password } = formData;

    setTimeout(() => {
      setLoading(false);
      if (action === "Login" && !validateLogin(email, password)) {
        setErrorMessage("Invalid login credentials!");
      } else if (action === "Sign Up" && !validateSignup(email, password)) {
        setErrorMessage("Please fill in all required fields correctly!");
      } else {
        alert(`${action} successful!`);
      }
    }, 2000);
  };

  const validateLogin = (email, password) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && password.length >= 6;
  };

  const validateSignup = (email, password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && passwordRegex.test(password);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setPopUp(emailRegex.test(email) ? "" : "Invalid email format.");
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    setPopUp(passwordRegex.test(password) ? "" : "Password must be 8+ chars, including upper, lower, number & special.");
  };

  const handleFocus = (field) => {
    switch (field) {
      case 'name':
        setPopUp("Enter your full name.");
        break;
      case 'email':
        if (!formData.email) setPopUp("Enter a valid email address.");
        break;
      case 'password':
        setPopUp("Password should meet complexity requirements.");
        break;
      default:
        setPopUp("");
    }
  };

  const handleBlur = () => {
    setPopUp("");
  };

  return (
    <div className={`container ${darkMode ? 'dark-mode' : ''}`}>
      <button 
        onClick={toggleMode} 
        style={{ position: 'absolute', top: '20px', right: '20px', padding: '10px', cursor: 'pointer' }}
      >
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>

      <form className="inputs" onSubmit={handleSubmit}>
        {action === "Sign Up" && (
          <div className="input">
            <label htmlFor="name">Name</label>
            <img src={user_icon} alt="User icon" />
            <input 
              type="text" 
              id="name" 
              name="name"
              value={formData.name}
              placeholder="Name" 
              required 
              onFocus={() => handleFocus('name')}
              onBlur={handleBlur}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="input">
          <label htmlFor="email">Email</label>
          <img src={email_icon} alt="Email icon" />
          <input 
            type="email" 
            id="email" 
            name="email"
            value={formData.email}
            placeholder="Email-id" 
            required 
            onFocus={() => handleFocus('email')}
            onBlur={handleBlur}
            onChange={handleChange}
          />
        </div>

        <div className="input">
          <label htmlFor="password">Password</label>
          <img src={password_icon} alt="Password icon" />
          <input 
            type={passwordVisible ? "text" : "password"} 
            id="password" 
            name="password"
            value={formData.password}
            placeholder="Enter Your Password" 
            required 
            onFocus={() => handleFocus('password')}
            onBlur={handleBlur}
            onChange={handleChange}
          />
          <button type="button" onClick={() => setPasswordVisible(!passwordVisible)}>
            {passwordVisible ? "Hide" : "Show"}
          </button>
        </div>

        {action === "Login" && (
          <div className="forgot-password">
            Lost Password? <span>Click Here!</span>
          </div>
        )}

        {errorMessage && <div className="error">{errorMessage}</div>}
        {loading && <div className="spinner"></div>}
        {popUp && <div className="popup">{popUp}</div>}

        <div className="submit-container">
          <div 
            className={action === "Sign Up" ? "submit active" : "submit gray"}
            onClick={() => setAction("Sign Up")}
          >
            Sign Up
          </div>
          <div 
            className={action === "Login" ? "submit active" : "submit gray"}
            onClick={() => setAction("Login")}
          >
            Login
          </div>        
        </div>
      </form>
    </div>
  );
};
