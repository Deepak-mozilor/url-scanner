// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { apiFetch } from "../services/api";
import { setCookie, eraseCookie } from "../utils/cookie.js";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await apiFetch("/verify-session",{ redirectOn401: false }); 
        setUser(data.user || { id: "Authenticated" });
      } catch (error) {
        setUser(null); 
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  

  const signup = async (email, username, password) => {
    const data = await apiFetch("/signup", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    });
    return data; // Return the success message so the Signup page knows it worked
  };



  const login = async (username, password) => {
    const data = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    
    
    setCookie("access_token", data.access_token, 1); 
    setUser(data.user);
  };

  const logout = async () => {
    eraseCookie("access_token"); 
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};