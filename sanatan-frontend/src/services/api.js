// src/services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Hardcoded CloudFront domain - replace with your actual domain
export const CLOUDFRONT_DOMAIN='https://d1kuoh6u9b5lqc.cloudfront.net';

// Dynamic Base URL for different platforms
const getBaseUrl = () => {
  // Always use the Render backend URL
  return 'https://sanatan-backend-174c.onrender.com/api';
  
  // Development URLs - commented out since we're now using the cloud backend
  /*
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001/api';  // Android emulator
  }
  if (Platform.OS === 'ios') {
    return 'http://localhost:5001/api';  // iOS simulator
  }
  return 'http://127.0.0.1:5001/api';  // Fallback
  */
};

const BASE_URL = getBaseUrl();

console.log('🌐 API Base URL:', BASE_URL, 'Platform:', Platform.OS);  // Enhanced logging
console.log('☁️ CloudFront Domain:', CLOUDFRONT_DOMAIN);

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
 * Get optimized image URL for CloudFront (for applying image transformations)
 * @param {string} url - Original image URL
 * @param {object} options - Image options (width, quality, etc.)
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return url;
  
  // If not a CloudFront URL, return as is
  if (!url.includes(CLOUDFRONT_DOMAIN)) return url;
  
  // Default options
  const { width = 600, quality = 80 } = options;
  
  // Add query parameters for Lambda@Edge image transformations
  // Note: This assumes you have set up Lambda@Edge for image processing
  // If not, these parameters will be ignored but won't harm anything
  return `${url}?width=${width}&quality=${quality}`;
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
  
  // Add cache control headers for GET requests
  if (method === 'GET') {
    headers['Cache-Control'] = 'no-cache';
    headers['Pragma'] = 'no-cache';
  }
  
  console.log(`API Request: ${method} ${endpoint}`);
  if (token) {
    console.log(`Adding auth token to request: ${token.substring(0, 15)}...`);
  }
  
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
// Media Handling Utilities
// -----------------------

/**
 * Process image before upload (resize/compress client-side)
 * This helps reduce bandwidth and storage costs
 * @param {object} imageObject - Image object from image picker
 * @returns {object} - Processed image object
 */
export const processImageForUpload = async (imageObject) => {
  if (!imageObject) return null;
  
  // If we have a third-party image processor library, we could use it here
  // For now, we're just returning the original image
  // In a production app, consider using something like react-native-image-manipulator
  
  return {
    uri: imageObject.uri,
    type: imageObject.type || 'image/jpeg',
    name: imageObject.fileName || `image-${Date.now()}.jpg`,
  };
};

// -----------------------
// Cache Management Utilities
// -----------------------

/**
 * Clear image cache (for maintenance or troubleshooting)
 * Note: This relies on FastImage being used throughout the app
 */
export const clearImageCache = async () => {
  try {
    // If you're using FastImage
    const FastImage = require('react-native-fast-image').default;
    await FastImage.clearDiskCache();
    await FastImage.clearMemoryCache();
    return { success: true };
  } catch (error) {
    console.error('Failed to clear image cache:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Manage cache size based on age and size
 */
export const manageCacheSize = async () => {
  try {
    const CACHE_LAST_CLEARED_KEY = 'cache_last_cleared_timestamp';
    const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    // Get last cleared timestamp
    const lastClearedStr = await AsyncStorage.getItem(CACHE_LAST_CLEARED_KEY);
    const lastCleared = lastClearedStr ? parseInt(lastClearedStr, 10) : 0;
    const now = Date.now();
    
    // If cache hasn't been cleared in the specified time
    if (now - lastCleared > MAX_CACHE_AGE) {
      // Clear image cache
      await clearImageCache();
      console.log('Image cache cleared due to age');
      
      // Update last cleared timestamp
      await AsyncStorage.setItem(CACHE_LAST_CLEARED_KEY, now.toString());
    } else {
      console.log('Cache age check passed, no clearing needed');
    }
    
    return { success: true, cleared: now - lastCleared > MAX_CACHE_AGE };
  } catch (error) {
    console.error('Error managing cache:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Pre-populate the image cache with commonly used images
 */
export const prefetchCommonImages = async (urls = []) => {
  try {
    if (!urls.length) return { success: true };
    
    // If you're using FastImage
    const FastImage = require('react-native-fast-image').default;
    FastImage.preload(
      urls.map(uri => ({ uri }))
    );
    return { success: true };
  } catch (error) {
    console.error('Failed to prefetch images:', error);
    return { success: false, error: error.message };
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
 * Resend OTP
 */
export const resendOTP = async (data) => {
  return await apiRequest('/auth/resend-otp', 'POST', data);
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