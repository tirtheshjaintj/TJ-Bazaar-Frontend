// src/config/axiosConfig.ts
import axios from 'axios';
import axiosRetry from 'axios-retry';
import Cookie from "universal-cookie";

// Create an Axios instance
const axiosInstanceSeller = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Set your base URL
  withCredentials: true, // Set withCredentials to true for all requests
});

// Set up axios-retry on the Axios instance
axiosRetry(axiosInstanceSeller, {
  retries: 3, // Number of retries
  retryDelay: (retryCount) => {
    // Exponential backoff: 1s, 2s, 4s
    return Math.pow(2, retryCount) * 1000; 
  },
  shouldResetTimeout: true, // Reset timeout on retry
});

// Add a request interceptor to set the Authorization header
axiosInstanceSeller.interceptors.request.use(config => {
  const cookie = new Cookie();
  const token = cookie.get('seller_token'); // Retrieve the seller token
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // Set token in headers
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Export the configured Axios instance
export default axiosInstanceSeller;
