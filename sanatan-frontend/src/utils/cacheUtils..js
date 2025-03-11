import FastImage from 'react-native-fast-image';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const CACHE_LAST_CLEARED_KEY = 'cache_last_cleared_timestamp';
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Prefetch important images to improve user experience
 * @param {Array} imageUris - Array of image URIs to prefetch
 */
export const prefetchImages = (imageUris = []) => {
  if (!imageUris.length) return;
  
  // Convert URIs to FastImage source objects
  const sources = imageUris.map(uri => ({
    uri,
    priority: FastImage.priority.normal
  }));
  
  // Prefetch images
  FastImage.preload(sources);
};

/**
 * Check and clear cache if necessary
 */
export const manageCacheSize = async () => {
  try {
    // Get last cleared timestamp
    const lastClearedStr = await AsyncStorage.getItem(CACHE_LAST_CLEARED_KEY);
    const lastCleared = lastClearedStr ? parseInt(lastClearedStr, 10) : 0;
    const now = Date.now();
    
    // If cache hasn't been cleared in the specified time
    if (now - lastCleared > MAX_CACHE_AGE) {
      // Clear FastImage cache
      await FastImage.clearDiskCache();
      console.log('Image cache cleared');
      
      // Update last cleared timestamp
      await AsyncStorage.setItem(CACHE_LAST_CLEARED_KEY, now.toString());
    }
  } catch (error) {
    console.error('Error managing cache:', error);
  }
};

/**
 * Get optimized image URL (with resize parameters for CloudFront)
 * @param {string} url - Original image URL
 * @param {object} options - Resize options
 * @returns {string} - Optimized URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return url;
  
  // Default options
  const { width = 600, quality = 80, format = 'auto' } = options;
  
  // Check if this is a CloudFront URL
  if (url.includes('cloudfront.net')) {
    // Add query parameters for Lambda@Edge image processing
    // Note: This requires setting up Lambda@Edge for image processing
    return `${url}?width=${width}&quality=${quality}&format=${format}`;
  }
  
  // Return original URL if not from CloudFront
  return url;
};