// src/screens/groups/GroupPostsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';

// Dummy data for posts
const DUMMY_POSTS = [
  {
    id: '1',
    author: 'Rajesh Kumar',
    role: 'admin',
    content: 'Today\'s discussion topic: The importance of meditation in daily life. Share your experiences and tips!',
    timestamp: '2 hours ago',
    likes: 15,
    comments: [
      {
        id: '1',
        author: 'Priya Singh',
        content: 'Meditation has truly transformed my life. I practice for 20 minutes every morning.',
        timestamp: '1 hour ago'
      },
      {
        id: '2',
        author: 'Amit Sharma',
        content: 'Can you suggest some good meditation techniques for beginners?',
        timestamp: '30 minutes ago'
      }
    ]
  },
  {
    id: '2',
    author: 'Neha Patel',
    role: 'moderator',
    content: 'Sharing some photos from yesterday\'s bhajan session. It was a beautiful evening! 🙏',
    timestamp: '5 hours ago',
    likes: 24,
    comments: []
  }
];

const GroupPostsScreen = ({ route, navigation }) => {
  const { group, isAdmin } = route.params;
  const [newPost, setNewPost] = useState('');
  const [newComment, setNewComment] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  const handlePost = () => {
    if (!newPost.trim()) {
      Alert.alert('Error', 'Please write something to post');
      return;
    }
    
    console.log('New post:', newPost);
    setNewPost('');
    Alert.alert('Success', 'Post created successfully!');
  };

  const handleComment = (postId) => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Please write a comment');
      return;
    }

    console.log('New comment on post:', postId, newComment);
    setNewComment('');
    setSelectedPost(null);
  };

  const renderPost = (post) => (
    <View key={post.id} style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.authorAvatar} />
          <View>
            <Text style={styles.authorName}>{post.author}</Text>
            <Text style={[styles.authorRole, { color: post.role === 'admin' ? colors.primary : colors.text.secondary }]}>
              {post.role}
            </Text>
          </View>
        </View>
        <Text style={styles.timestamp}>{post.timestamp}</Text>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>❤️ {post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
        >
          <Text style={styles.actionText}>💬 {post.comments.length}</Text>
        </TouchableOpacity>
      </View>

      {post.comments.map(comment => (
        <View key={comment.id} style={styles.commentContainer}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentAuthor}>{comment.author}</Text>
            <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
          </View>
          <Text style={styles.commentContent}>{comment.content}</Text>
        </View>
      ))}

      {selectedPost === post.id && (
        <View style={styles.commentInput}>
          <TextInput
            style={styles.input}
            placeholder="Write a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity 
            style={styles.commentButton}
            onPress={() => handleComment(post.id)}
          >
            <Text style={styles.commentButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Posts</Text>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.createPost}>
          <TextInput
            style={styles.postInput}
            placeholder="Share something with the group..."
            value={newPost}
            onChangeText={setNewPost}
            multiline
          />
          <TouchableOpacity
            style={[styles.postButton, !newPost.trim() && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={!newPost.trim()}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        {DUMMY_POSTS.map(post => renderPost(post))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.m,
    padding: spacing.xs,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text.primary,
  },
  headerTitle: {
    ...typography.h2,
    flex: 1,
  },
  container: {
    flex: 1,
  },
  createPost: {
    padding: spacing.m,
    backgroundColor: colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  postInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.m,
    minHeight: 100,
    marginBottom: spacing.m,
    ...typography.body1,
  },
  postButton: {
    backgroundColor: colors.primary,
    padding: spacing.m,
    borderRadius: 8,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: colors.background.tertiary,
  },
  postButtonText: {
    ...typography.subtitle1,
    color: colors.background.main,
  },
  postCard: {
    backgroundColor: colors.background.main,
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.m,
  },
  authorInfo: {
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
  authorName: {
    ...typography.subtitle1,
  },
  authorRole: {
    ...typography.body2,
  },
  timestamp: {
    ...typography.body2,
    color: colors.text.tertiary,
  },
  postContent: {
    ...typography.body1,
    marginBottom: spacing.m,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.m,
    marginBottom: spacing.m,
  },
  actionButton: {
    marginRight: spacing.l,
  },
  actionText: {
    ...typography.body1,
  },
  commentContainer: {
    backgroundColor: colors.background.secondary,
    padding: spacing.m,
    borderRadius: 8,
    marginBottom: spacing.s,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  commentAuthor: {
    ...typography.subtitle2,
  },
  commentTimestamp: {
    ...typography.body2,
    color: colors.text.tertiary,
  },
  commentContent: {
    ...typography.body1,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.s,
    marginRight: spacing.s,
    ...typography.body1,
  },
  commentButton: {
    backgroundColor: colors.primary,
    padding: spacing.s,
    borderRadius: 8,
  },
  commentButtonText: {
    ...typography.subtitle2,
    color: colors.background.main,
  },
});

export default GroupPostsScreen;