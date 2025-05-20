import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [didUser, setDidUser] = useState(null);

  const loginWithDID = (user) => {
    setDidUser(user);
  };

  const logout = () => {
    setDidUser(null);
  };

  return (
    <AuthContext.Provider value={{ didUser, loginWithDID, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
