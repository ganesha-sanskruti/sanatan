import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';

import { 
  getFeedPosts, 
  toggleLike as apiToggleLike, 
  addComment as apiAddComment, 
  addReply as apiAddReply 
} from '../../services/postApi';

const FeedScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);

  // useEffect(() => {
  //   fetchPosts();
  // }, []);


  useEffect(() => {
    // Initial fetch
    fetchPosts();
    
    // Add a listener for when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh posts when screen is focused
      fetchPosts(true);
    });
    
    // Clean up the listener when component unmounts
    return unsubscribe;
  }, [navigation]);

  

  const fetchPosts = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setPage(1);
      } else if (!refresh && !hasMore) {
        return;
      }
  
      const currentPage = refresh ? 1 : page;
      const response = await getFeedPosts(currentPage, 10);
      
      if (response.success) {
        if (refresh || currentPage === 1) {
          setPosts(response.posts);
        } else {
          setPosts(prevPosts => [...prevPosts, ...response.posts]);
        }
        setHasMore(response.hasMore);
        setPage(currentPage + 1);
      } else {
        console.error('Failed to fetch posts:', response);
        // Fallback to dummy data if API fails (for development purposes)
        if (posts.length === 0) {
          setPosts(DUMMY_POSTS);
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fallback to dummy data if API fails (for development purposes)
      if (posts.length === 0) {
        setPosts(DUMMY_POSTS);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchPosts(true);
  };

  // Toggle Like
  const toggleLike = async (postId) => {
    // Prevent multiple rapid clicks
    if (actionInProgress === `like_${postId}`) return;
    setActionInProgress(`like_${postId}`);
  
    // Optimistically update UI
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          } 
        : post
    ));
  
    try {
      const response = await apiToggleLike(postId);
      if (!response.success) {
        // Revert on failure
        setPosts(posts.map(post => 
          post.id === postId ? { ...post } : post
        ));
        console.error('Failed to toggle like:', response);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setPosts(prevPosts => prevPosts.map(post => 
        post.id === postId ? { ...post } : post
      ));
    } finally {
      setActionInProgress(null);
    }
  };

  // Add Comment
  const addComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
  
    // Prevent multiple rapid submissions
    if (actionInProgress === `comment_${postId}`) return;
    setActionInProgress(`comment_${postId}`);
  
    try {
      const response = await apiAddComment(postId, text);
      
      if (response.success) {
        // Update the local state with the new comment
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...post.comments, response.comment]
            };
          }
          return post;
        }));
        
        // Clear the input
        setCommentInputs({ ...commentInputs, [postId]: '' });
      } else {
        Alert.alert('Error', 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setActionInProgress(null);
    }
  };


   // addReply function:
  const addReply = async (postId, commentId) => {
    const text = commentInputs[commentId]?.trim();
    if (!text) return;
  
    // Prevent multiple rapid submissions
    if (actionInProgress === `reply_${commentId}`) return;
    setActionInProgress(`reply_${commentId}`);
  
    try {
      const response = await apiAddReply(postId, commentId, text);
      
      if (response.success) {
        // Update the local state with the new reply
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: post.comments.map(comment => {
                if (comment.id === commentId) {
                  return {
                    ...comment,
                    replies: [...comment.replies, response.reply]
                  };
                }
                return comment;
              })
            };
          }
          return post;
        }));
        
        // Clear the input
        setCommentInputs({ ...commentInputs, [commentId]: '' });
      } else {
        Alert.alert('Error', 'Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      Alert.alert('Error', 'Failed to add reply');
    } finally {
      setActionInProgress(null);
    }
  };

  // Share Post
  const sharePost = async (content) => {
    try {
      await Share.share({ message: content });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };


  

  const renderPost = (post) => (
    <View key={post.id} style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.authorContainer}>
          <View style={styles.authorAvatar} />
          <View style={styles.authorInfo}>
            <View style={styles.authorNameContainer}>
              <Text style={styles.authorName}>{post.author}</Text>
              {post.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.authorType}>{post.authorType}</Text>
          </View>
        </View>
        <Text style={styles.timeAgo}>{post.timeAgo}</Text>
      </View>

      {/* Post Content */}
      <Text style={styles.postContent}>{post.content}</Text>

      {/* Post Image (if any) */}
      {post.image && (
        <Image 
          source={{ uri: post.image }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Post Actions */}
      <View style={styles.postFooter}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => toggleLike(post.id)}
          disabled={actionInProgress === `like_${post.id}`}
        >
          <Text style={{ color: post.isLiked ? 'red' : 'black' }}>
            {post.isLiked ? '❤️' : '🤍'} {post.likes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text>💬 {post.comments.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => sharePost(post.content)}>
          <Text>📤 Share</Text>
        </TouchableOpacity>
      </View>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Write a comment..."
          value={commentInputs[post.id] || ''}
          onChangeText={(text) => setCommentInputs({ ...commentInputs, [post.id]: text })}
        />
        <TouchableOpacity 
          onPress={() => addComment(post.id)}
          disabled={!commentInputs[post.id]?.trim() || actionInProgress === `comment_${post.id}`}
        >
          <Text style={[
            styles.commentPostButton,
            (!commentInputs[post.id]?.trim() || actionInProgress === `comment_${post.id}`) && styles.disabledButton
          ]}>
            Post
          </Text>
        </TouchableOpacity>
      </View>

      {/* Render Comments & Replies */}
      {post.comments.map(comment => (
        <View key={comment.id} style={styles.commentContainer}>
          <Text style={styles.commentText}>
            <Text style={styles.commentAuthor}>{comment.author || 'User'}: </Text> 
            {comment.text}
          </Text>

          {/* Reply Input */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.replyInput}
              placeholder="Reply..."
              value={commentInputs[comment.id] || ''}
              onChangeText={(text) => setCommentInputs({ ...commentInputs, [comment.id]: text })}
            />
            <TouchableOpacity 
              onPress={() => addReply(post.id, comment.id)}
              disabled={!commentInputs[comment.id]?.trim() || actionInProgress === `reply_${comment.id}`}
            >
              <Text style={[
                styles.replyPostButton,
                (!commentInputs[comment.id]?.trim() || actionInProgress === `reply_${comment.id}`) && styles.disabledButton
              ]}>
                Reply
              </Text>
            </TouchableOpacity>
          </View>

          {/* Render Replies */}
          {comment.replies && comment.replies.map(reply => (
            <Text key={reply.id} style={styles.replyText}>
              <Text style={styles.replyAuthor}>{reply.author || 'User'}: </Text>
              {reply.text}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );


  {/* Floating Action Button for create post */}
<TouchableOpacity
  style={styles.fab}
  onPress={() => navigation.navigate('CreatePost')}
>
  <Text style={styles.fabIcon}>+</Text>
</TouchableOpacity>

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      {/* Header with Create Post button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
        <TouchableOpacity 
          style={styles.createPostButton}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Text style={styles.createPostButtonText}>+ Create Post</Text>
        </TouchableOpacity>
      </View>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      )}

      {/* Post list */}
      {!loading && (
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        >
          {posts.length > 0 ? (
            posts.map(post => renderPost(post))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet. Be the first to post!</Text>
              <TouchableOpacity 
                style={styles.createFirstPostButton}
                onPress={() => navigation.navigate('CreatePost')}
              >
                <Text style={styles.createFirstPostButtonText}>Create Post</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Load More */}
          {hasMore && posts.length > 0 && (
            <TouchableOpacity 
              style={styles.loadMoreButton}
              onPress={() => fetchPosts()}
            >
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// Dummy data for fallback (in case the API fails during development)
const DUMMY_POSTS = [
  {
    id: '1',
    author: 'Shiva Temple',
    authorType: 'Temple',
    content: 'Join us for the special Mahashivratri celebration tomorrow at 6 PM. There will be special puja and prasad distribution.',
    timeAgo: '2 hours ago',
    likes: 128,
    comments: [],
    isLiked: false,
    isVerified: true,
  },
  {
    id: '2',
    author: 'Krishna Consciousness Group',
    authorType: 'Community',
    content: 'Today\'s thought: "When you do things from your soul, you feel a river moving in you, a joy." Join our daily bhajan session.',
    timeAgo: '3 hours ago',
    likes: 89,
    comments: [],
    isLiked: false,
    isVerified: true,
  },
];

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
  },
  createPostButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 20,
  },
  createPostButtonText: {
    color: colors.background.main,
    ...typography.body2,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body1,
    color: colors.text.secondary,
    marginTop: spacing.m,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body1,
    color: colors.text.secondary,
    marginBottom: spacing.l,
    textAlign: 'center',
  },
  createFirstPostButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    borderRadius: 8,
  },
  createFirstPostButtonText: {
    color: colors.background.main,
    ...typography.subtitle2,
  },
  scrollView: {
    flex: 1,
  },
  postCard: {
    backgroundColor: colors.background.main,
    padding: spacing.m,
    marginVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    marginRight: spacing.s,
  },
  authorInfo: {
    flex: 1,
  },
  authorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    ...typography.subtitle1,
    marginRight: spacing.xs,
  },
  verifiedBadge: {
    backgroundColor: colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  authorType: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  timeAgo: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  postContent: {
    ...typography.body1,
    marginBottom: spacing.m,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.m,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.s,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    padding: spacing.s,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.s,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.s,
    marginLeft: spacing.l,
  },
  commentPostButton: {
    color: colors.primary,
    paddingHorizontal: spacing.m,
  },
  replyPostButton: {
    color: colors.primary,
    paddingHorizontal: spacing.m,
  },
  disabledButton: {
    color: colors.text.tertiary,
  },
  commentContainer: {
    marginTop: spacing.s,
  },
  commentText: {
    ...typography.body2,
    marginBottom: spacing.xs,
  },
  commentAuthor: {
    fontWeight: 'bold',
  },
  replyText: {
    ...typography.body2,
    paddingLeft: spacing.l,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  replyAuthor: {
    fontWeight: 'bold',
  },
  loadMoreButton: {
    backgroundColor: colors.background.secondary,
    padding: spacing.m,
    alignItems: 'center',
    margin: spacing.m,
    borderRadius: 8,
  },
  loadMoreText: {
    ...typography.body2,
    color: colors.text.primary,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabIcon: {
    fontSize: 24,
    color: 'white',
  },
});

export default FeedScreen;