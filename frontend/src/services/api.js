import { getCookie } from "../utils/cookie.js";

const BASE_URL = "http://localhost:8000"; 

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

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};