// src/config/axiosConfig.ts
import axios from 'axios';
import axiosRetry from 'axios-retry';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Set your base URL
});

// Set up axios-retry on the Axios instance
axiosRetry(axiosInstance, {
  retries: 3, // Number of retries
  retryDelay: (retryCount) => {
    // Exponential backoff: 1s, 2s, 4s
    return Math.pow(2, retryCount) * 1000; 
  },
  shouldResetTimeout: true, // Reset timeout on retry
});

// Export the configured Axios instance
export default axiosInstance;
