/**
 * API Configuration
 * 
 * Set the backend server URL here.
 * For production, you can use environment variables or update this file.
 */
export const API_CONFIG = {
  // Backend server base URL
  // Change this to point to your backend server
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://203.192.253.34:8000',
  
  // API endpoints
  get QUERY_URL() {
    return `${this.BASE_URL}/api/query-agentic`;
  },
  
  get TRACES_URL() {
    return `${this.BASE_URL}/api/traces`;
  },
};
