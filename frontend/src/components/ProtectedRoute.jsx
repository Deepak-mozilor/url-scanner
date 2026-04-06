// src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading session...</div>; // Wait for FastAPI to verify the cookie
  }

  if (!user) {
    return <Navigate to="/login" replace />; // Kick them back to the login screen
  }

  return children; // Let them see the Dashboard
};

export default ProtectedRoute;