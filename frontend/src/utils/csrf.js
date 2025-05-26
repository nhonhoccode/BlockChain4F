/**
 * CSRF token handling utility
 * Helps with Django CSRF protection
 */
import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

// Function to get CSRF token from cookies
export const getCSRFToken = () => {
  const name = 'csrftoken';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

// Function to fetch CSRF token from Django
export const fetchCSRFToken = async () => {
  try {
    // Make a GET request to any Django endpoint to get the CSRF cookie
    const response = await axios.get(`${API_BASE_URL}/api/v1/auth/token/verify/`, {
      withCredentials: true
    });
    
    return getCSRFToken();
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
};

// Function to add CSRF token to request headers
export const addCSRFToken = (headers = {}) => {
  const csrfToken = getCSRFToken();
  
  if (csrfToken) {
    return {
      ...headers,
      'X-CSRFToken': csrfToken
    };
  }
  
  return headers;
};

export default {
  getCSRFToken,
  fetchCSRFToken,
  addCSRFToken
}; 