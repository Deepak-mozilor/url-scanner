// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { apiFetch } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await apiFetch("/verify-session"); 
        setUser(data.user || { id: "Authenticated" });
      } catch (error) {
        setUser(null); 
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 2. The login function (used by Login.jsx)
  const login = async (username, password) => {
    const data = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setUser(data.user || { username }); // Set user based on FastAPI response
  };

  // 3. The logout function (used by Dashboard.jsx)
  const logout = async () => {
    // You will eventually want to make a FastAPI /logout endpoint to delete the cookie
    // await apiFetch("/logout", { method: "POST" }); 
    setUser(null);
  };

  const signup = async (email, username, password) => {
    const data = await apiFetch("/signup", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    });
    return data; // Return the success message so the Signup page knows it worked
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};