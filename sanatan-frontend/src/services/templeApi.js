// src/services/templeApi.js
import { apiRequest } from './api';

/**
 * Get all temples
 */
export const getAllTemples = async () => {
  return apiRequest('/temples');
};

/**
 * Get a specific temple by ID
 */
export const getTempleById = async (id) => {
  return apiRequest(`/temples/${id}`);
};

/**
 * Get nearby temples based on coordinates
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {number} distance - Search radius in kilometers (default: 10)
 */

/**
 * Get nearby temples based on coordinates
 */
export const getNearbyTemples = async (latitude, longitude, distance = 10) => {
  return apiRequest(`/temples/nearby?latitude=${latitude}&longitude=${longitude}&distance=${distance}`);
};


/**
 * Search temples by name or location
 * @param {string} query - Search query
 * @param {number} latitude - Optional user's latitude for distance calculation
 * @param {number} longitude - Optional user's longitude for distance calculation
 */
/**
 * Search temples by name or location
 */
export const searchTemples = async (query, latitude = null, longitude = null) => {
  let endpoint = `/temples/search?query=${encodeURIComponent(query)}`;
  
  if (latitude && longitude) {
    endpoint += `&latitude=${latitude}&longitude=${longitude}`;
  }
  
  return apiRequest(endpoint);
};

/**
 * Create a new temple (with optional images)
 * @param {Object} data - Temple data
 * @param {Array} images - Array of image objects
 */
export const createTemple = async (data, images = []) => {
  // Create FormData for multipart/form-data request
  const formData = new FormData();
  
  // Add temple data
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  
  // Add images
  if (images.length > 0) {
    images.forEach((image, index) => {
      formData.append('images', {
        uri: image.uri,
        type: 'image/jpeg',
        name: `temple_${index}.jpg`
      });
    });
  }
  
  return apiRequest('/temples', 'POST', formData, true);
};

/**
 * Update a temple
 * @param {string} id - Temple ID
 * @param {Object} data - Updated temple data
 * @param {Array} images - New images (optional)
 */
export const updateTemple = async (id, data, images = []) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  
  if (images.length > 0) {
    images.forEach((image, index) => {
      formData.append('images', {
        uri: image.uri,
        type: 'image/jpeg',
        name: `temple_${index}.jpg`
      });
    });
  }
  
  return apiRequest(`/temples/${id}`, 'PUT', formData, true);
};

/**
 * Delete a temple
 * @param {string} id - Temple ID
 */
export const deleteTemple = async (id) => {
  return apiRequest(`/temples/${id}`, 'DELETE');
};

/**
 * Rate a temple
 * @param {string} id - Temple ID
 * @param {number} rating - Rating (1-5)
 */
export const rateTemple = async (id, rating) => {
  return apiRequest(`/temples/${id}/rate`, 'POST', { rating });
};