// src/services/postApi.js
import { apiRequest, processImageForUpload, getOptimizedImageUrl } from './api';

/**
 * Get feed posts with pagination
 * @param {number} page - Page number
 * @param {number} limit - Number of posts per page
 */
export const getFeedPosts = async (page = 1, limit = 10) => {
  return apiRequest(`/posts/feed?page=${page}&limit=${limit}`);
};

/**
 * Create a new post
 * @param {string} content - Post content
 * @param {string} visibility - Post visibility ('public' or 'private')
 * @param {object} image - Optional image object (from image picker)
 */
export const createPost = async (content, visibility = 'public', image = null) => {
  // Validate content
  if (!content || !content.trim()) {
    throw new Error('Post content is required');
  }

  // Create post data object first
  const postData = {
    content: content.trim(),
    visibility: visibility
  };

  // Create FormData for multipart/form-data (for image upload)
  const formData = new FormData();
  
  // Add all post data fields individually
  Object.keys(postData).forEach(key => {
    formData.append(key, postData[key]);
  });
  
  // Add image if provided
  if (image) {
    try {
      // Process image before upload (resize/compress if needed)
      const processedImage = await processImageForUpload(image);
      
      formData.append('image', {
        uri: processedImage.uri,
        type: processedImage.type || 'image/jpeg',
        name: processedImage.name || 'post_image.jpg',
      });
      
      console.log('Adding image to post:', {
        name: processedImage.name,
        type: processedImage.type,
        uri: processedImage.uri.substring(0, 50) + '...' // Log only part of the URI for brevity
      });
    } catch (error) {
      console.error('Error processing image:', error);
      // Continue without the image if processing fails
    }
  }
  
  console.log('Creating post with data:', postData);
  
  return apiRequest('/posts', 'POST', formData, true);
};

/**
 * Toggle like on a post
 * @param {string} postId - Post ID
 */
export const toggleLike = async (postId) => {
  return apiRequest(`/posts/${postId}/like`, 'POST');
};

/**
 * Add a comment to a post
 * @param {string} postId - Post ID
 * @param {string} text - Comment text
 */
export const addComment = async (postId, text) => {
  return apiRequest(`/posts/${postId}/comment`, 'POST', { text });
};

/**
 * Add a reply to a comment
 * @param {string} postId - Post ID
 * @param {string} commentId - Comment ID
 * @param {string} text - Reply text
 */
export const addReply = async (postId, commentId, text) => {
  return apiRequest(`/posts/${postId}/comments/${commentId}/replies`, 'POST', { text });
};

/**
 * Delete a post
 * @param {string} postId - Post ID
 */
export const deletePost = async (postId) => {
  return apiRequest(`/posts/${postId}`, 'DELETE');
};

/**
 * Get a single post by ID
 * @param {string} postId - Post ID
 */
export const getPostById = async (postId) => {
  return apiRequest(`/posts/${postId}`);
};

/**
 * Update a post
 * @param {string} postId - Post ID
 * @param {object} data - Updated post data (content, visibility)
 * @param {object} image - Optional new image to upload
 */
export const updatePost = async (postId, data, image = null) => {
  // If no image update, use regular PUT request
  if (!image) {
    return apiRequest(`/posts/${postId}`, 'PUT', data);
  }
  
  // If updating with new image, use FormData
  const formData = new FormData();
  
  // Add text data fields
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  
  // Process and add the new image
  try {
    const processedImage = await processImageForUpload(image);
    
    formData.append('image', {
      uri: processedImage.uri,
      type: processedImage.type || 'image/jpeg',
      name: processedImage.name || 'post_image.jpg',
    });
  } catch (error) {
    console.error('Error processing update image:', error);
  }
  
  return apiRequest(`/posts/${postId}`, 'PUT', formData, true);
};

/**
 * Get posts by a specific user
 * @param {string} userId - User ID
 * @param {number} page - Page number
 * @param {number} limit - Number of posts per page
 */
export const getUserPosts = async (userId, page = 1, limit = 10) => {
  return apiRequest(`/posts/user/${userId}?page=${page}&limit=${limit}`);
};

/**
 * Get optimized image URL for a post image
 * @param {string} imageUrl - Original image URL
 * @param {object} options - Image options (width, quality)
 */
export const getPostImageUrl = (imageUrl, options = {}) => {
  return getOptimizedImageUrl(imageUrl, options);
};

/**
 * Prefetch post images for better performance
 * @param {Array} posts - Array of posts
 */
export const prefetchPostImages = async (posts) => {
  if (!posts || !posts.length) return;
  
  try {
    const FastImage = require('react-native-fast-image').default;
    
    // Extract image URLs from posts
    const imageUrls = posts
      .filter(post => post.image)
      .map(post => ({ uri: post.image }));
    
    if (imageUrls.length > 0) {
      FastImage.preload(imageUrls);
    }
  } catch (error) {
    console.error('Failed to prefetch post images:', error);
  }
};