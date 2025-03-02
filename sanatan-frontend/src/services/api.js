
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Dynamic Base URL for different platforms
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001/api';  // Android emulator
  }
  if (Platform.OS === 'ios') {
    return 'http://localhost:5001/api';  // iOS simulator
  }
  return 'http://127.0.0.1:5001/api';  // Fallback
};

const BASE_URL = getBaseUrl();

console.log('🌐 API Base URL:', BASE_URL, 'Platform:', Platform.OS);  // Enhanced logging

/**
 * Get the authentication token from storage
 */
export const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

/**
 * Save the authentication token to storage
 */
export const saveToken = async (token) => {
  return await AsyncStorage.setItem('token', token);
};

/**
 * Remove the authentication token from storage (logout)
 */
export const removeToken = async () => {
  return await AsyncStorage.removeItem('token');
};

/**
 * Basic error handling for API responses
 */
// In src/services/api.js update the handleResponse function:
const handleResponse = async (response) => {
  try {
    if (response.status === 404) {
      throw new Error('Resource not found');
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response received:', await response.text());
      throw new Error('Server returned non-JSON response');
    }
    
    const result = await response.json();
    
    console.log('API Response:', {
      status: response.status,
      ok: response.ok,
      result
    });
    
    if (!response.ok) {
      const error = new Error(result.message || 'An error occurred');
      error.status = response.status;
      error.data = result;
      throw error;
    }
    
    return result;
  } catch (parseError) {
    console.error('Response Parsing Error:', parseError);
    throw parseError;
  }
};


/**
 * Make an API request with authentication
 */
export const apiRequest = async (endpoint, method = 'GET', data = null, isFormData = false) => {
  const url = BASE_URL.endsWith('/api') 
  ? `${BASE_URL}${endpoint}` 
  : `${BASE_URL}/api${endpoint}`;

console.log(`Full Request URL: ${url}`);
  
  // Get the token from storage
  const token = await getToken();
  
  const headers = {
    'Authorization': token ? `Bearer ${token}` : '',
  };
  
  // Only add Content-Type for non-FormData requests
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  console.log(`API Request: ${method} ${endpoint}`);
  if (token) {
    console.log(`Adding auth token to request: ${token.substring(0, 15)}...`);
  }
  console.log(`Full Request URL: ${url}`);
  
  const options = {
    method,
    headers,
    body: data ? (isFormData ? data : JSON.stringify(data)) : null,
  };
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      console.error('API Error Response:', JSON.stringify(result));
      throw new Error(result.message || 'Something went wrong');
    }
    
    return result;
  } catch (error) {
    console.error('API Request Failed:', {
      endpoint,
      method,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// -----------------------
// Auth API Endpoints
// -----------------------

/**
 * Register a new user
 */
export const register = async (userData) => {
  try {
    console.log('Registering User:', userData);
    return await apiRequest('/auth/register', 'POST', userData);
  } catch (error) {
    console.error('Registration API Error:', error);
    throw error;
  }
};

/**
 * Login a user
 */
export const login = async (credentials) => {
  const response = await apiRequest('/auth/login', 'POST', credentials);
  
  if (response.token) {
    await saveToken(response.token);
  }
  
  return response;
};

/**
 * Verify OTP
 */
export const verifyOTP = async (data) => {
  const response = await apiRequest('/auth/verify-otp', 'POST', data);
  
  if (response.token) {
    await saveToken(response.token);
  }
  
  return response;
};

/**
 * Logout
 */
export const logout = async () => {
  await removeToken();
  return { success: true };
};

// -----------------------
// User API Endpoints
// -----------------------

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  return apiRequest('/users/me');
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userData) => {
  return apiRequest('/users/me', 'PUT', userData);
};

/**
 * Update user profile picture (using form data)
 */
export const updateProfilePicture = async (formData) => {
  return apiRequest('/users/me/profile-picture', 'POST', formData, true);
};

// -----------------------
// Pandit API Endpoints
// -----------------------

/**
 * Get all pandits with optional filtering
 */
export const getPandits = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/pandits?${queryString}`);
};

/**
 * Get nearby pandits based on coordinates
 */
export const getNearbyPandits = async (latitude, longitude, distance = 10) => {
  return apiRequest(`/pandits/nearby?latitude=${latitude}&longitude=${longitude}&distance=${distance}`);
};

/**
 * Get a single pandit by ID
 */
export const getPanditById = async (id) => {
  return apiRequest(`/pandits/${id}`);
};

/**
 * Create a new pandit profile (using form data)
 */
export const createPanditProfile = async (formData) => {
  return apiRequest('/pandits', 'POST', formData, true);
};

/**
 * Update a pandit profile (using form data)
 */
export const updatePanditProfile = async (id, formData) => {
  return apiRequest(`/pandits/${id}`, 'PUT', formData, true);
};

/**
 * Rate a pandit
 */
export const ratePandit = async (id, rating) => {
  return apiRequest(`/pandits/${id}/rate`, 'POST', { rating });
};

// -----------------------
// Booking API Endpoints
// -----------------------

/**
 * Create a new booking
 */
export const createBooking = async (bookingData) => {
  return apiRequest('/bookings', 'POST', bookingData);
};

/**
 * Get user's bookings
 */
export const getUserBookings = async () => {
  return apiRequest('/bookings/my-bookings');
};

/**
 * Get pandit's bookings (for pandit owners)
 */
export const getPanditBookings = async (panditId) => {
  return apiRequest(`/bookings/pandit/${panditId}`);
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (bookingId, status) => {
  return apiRequest(`/bookings/${bookingId}/status`, 'PUT', { status });
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId) => {
  return apiRequest(`/bookings/${bookingId}/cancel`, 'PUT');
};

// Add more API functions as your app grows