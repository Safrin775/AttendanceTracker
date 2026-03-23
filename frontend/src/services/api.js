import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

// Function to get CSRF token from cookies
const getCSRFToken = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add CSRF token to all requests
api.interceptors.request.use(
  (config) => {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fetch CSRF token on app start
export const fetchCSRFToken = async () => {
  try {
    const response = await axios.get(`${API_URL}csrf/`, {
      withCredentials: true,
    });
    return response.data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

// Auth API
export const authAPI = {
  login: async (username, password) => {
    try {
      // First, get CSRF token
      await fetchCSRFToken();
      
      const response = await api.post('login/', { username, password });
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  logout: async () => {
    await api.post('logout/');
    localStorage.removeItem('user');
  },
  
  register: (userData) => api.post('register/', userData),
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('me/');
      return response.data;
    } catch (error) {
      return null;
    }
  },
  
  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// Attendance API
export const attendanceAPI = {
  getMyAttendance: () => api.get('attendance/'),
  markAttendance: () => api.post('attendance/mark/'),
  getTodayAttendance: () => api.get('attendance/today/'),
};

// Requests API
export const requestsAPI = {
  getMyRequests: () => api.get('requests/'),
  createRequest: (data) => api.post('requests/', data),
  getPendingRequests: () => api.get('requests/pending/'),
};

// Initialize CSRF token on app load
fetchCSRFToken();

export default api;