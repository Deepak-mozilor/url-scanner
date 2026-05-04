import { getCookie } from "../utils/cookie.js";

const BASE_URL = "https://prolonged-swagger-ramp.ngrok-free.dev";

export const apiFetch = async (endpoint, options = {}) => {
  const token = getCookie("access_token"); 
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: headers,
  });

  if (response.status === 401) {
    if (redirectOn401) {
      window.location.href = "/login";  
    }
    throw new Error("Session expired. Redirecting to login...");
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};