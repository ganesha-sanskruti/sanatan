// src/services/postApi.js
import { apiRequest } from './api';

/**
 * Get feed posts with pagination
 * @param {number} page - Page number
 * @param {number} limit - Number of posts per page
 */
export const getFeedPosts = async (page = 1, limit = 10) => {
  return apiRequest(`/posts/feed?page=${page}&limit=${limit}`);
};


// src/services/postApi.js - Fixed createPost function

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

  // Create post data object first (similar to templeData)
  const postData = {
    content: content.trim(),
    visibility: visibility
  };

  // Create FormData for multipart/form-data (for image upload)
  const formData = new FormData();
  
  // Add all post data fields individually (like in temple API)
  Object.keys(postData).forEach(key => {
    formData.append(key, postData[key]);
  });
  
  // Add image if provided
  if (image) {
    formData.append('image', {
      uri: image.uri,
      type: 'image/jpeg',
      name: 'post_image.jpg',
    });
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
 * @param {object} data - Updated post data
 */
export const updatePost = async (postId, data) => {
  return apiRequest(`/posts/${postId}`, 'PUT', data);
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