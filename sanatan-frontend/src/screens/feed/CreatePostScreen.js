import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';
//import { apiRequest } from '../../services/api';
import { getCurrentUser } from '../../services/api';
import { createPost } from '../../services/postApi';



const CreatePostScreen = ({ navigation, route }) => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [posting, setPosting] = useState(false);
  const [user, setUser] = useState(null);
  const [visibility, setVisibility] = useState('public'); // 'public' or 'private'

  // Fetch current user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getCurrentUser();
        if (response && response.success) {
          setUser(response.user);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);


const handlePost = async () => {
  if (!content.trim()) {
    Alert.alert('Error', 'Please write something to post');
    return;
  }

  try {
    setPosting(true);
    
    // Call the dedicated API function
    const response = await createPost(content.trim(), visibility, selectedImage);
    
    if (response.success) {
      Alert.alert(
        'Success',
        'Post created successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Error', response.message || 'Failed to create post');
    }
  } catch (error) {
    console.error('Error creating post:', error);
    Alert.alert('Error', 'Failed to create post. Please try again.');
  } finally {
    setPosting(false);
  }
};




  const handleSelectImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1200,
      maxWidth: 1200,
      quality: 0.8,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error:', response.error);
        Alert.alert('Error', 'Failed to pick image');
      } else if (response.assets && response.assets.length > 0) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  const toggleVisibility = () => {
    setVisibility(visibility === 'public' ? 'private' : 'public');
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
          disabled={posting}
        >
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Create Post</Text>
        
        <TouchableOpacity 
          onPress={handlePost}
          style={[
            styles.headerButton,
            styles.postButton,
            (!content.trim() || posting) && styles.postButtonDisabled
          ]}
          disabled={!content.trim() || posting}
        >
          {posting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[
              styles.postButtonText,
              !content.trim() && styles.postButtonTextDisabled
            ]}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            {user?.profilePicture ? (
              <Image 
                source={{ uri: user.profilePicture }} 
                style={styles.avatarImage} 
              />
            ) : null}
          </View>
          <View>
            <Text style={styles.userName}>{user?.name || 'Your Name'}</Text>
            <TouchableOpacity 
              style={styles.privacySelector}
              onPress={toggleVisibility}
            >
              <Text style={styles.privacyText}>
                {visibility === 'public' ? '🌎 Public' : '🔒 Private'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Post Input */}
        <TextInput
          style={styles.input}
          placeholder="Share your spiritual thoughts..."
          value={content}
          onChangeText={setContent}
          multiline
          autoFocus
          textAlignVertical="top"
          editable={!posting}
        />

        {/* Selected Image Preview */}
        {selectedImage && (
          <View style={styles.imagePreview}>
            <Image 
              source={{ uri: selectedImage.uri }}
              style={styles.previewImage}
            />
            <TouchableOpacity 
              style={styles.removeImage}
              onPress={() => setSelectedImage(null)}
              disabled={posting}
            >
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Media Options */}
        <View style={styles.mediaOptions}>
          <TouchableOpacity 
            style={styles.mediaButton}
            onPress={handleSelectImage}
            disabled={posting}
          >
            <Text style={styles.mediaButtonText}>📷 Add Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.mediaButton}
            onPress={() => Alert.alert('Coming Soon', 'Video upload will be available soon!')}
            disabled={posting}
          >
            <Text style={styles.mediaButtonText}>🎥 Add Video</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background.main,
  },
  headerButton: {
    padding: spacing.s,
  },
  headerButtonText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  headerTitle: {
    ...typography.h3,
  },
  postButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: colors.background.tertiary,
  },
  postButtonText: {
    color: colors.background.main,
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  container: {
    flex: 1,
    padding: spacing.m,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    marginRight: spacing.m,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userName: {
    ...typography.subtitle1,
    marginBottom: spacing.xs,
  },
  privacySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyText: {
    ...typography.body2,
    color: colors.primary,
  },
  input: {
    ...typography.body1,
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: spacing.l,
  },
  imagePreview: {
    position: 'relative',
    marginBottom: spacing.m,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImage: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: colors.background.main,
    fontSize: 16,
  },
  mediaOptions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.m,
  },
  mediaButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 20,
    marginRight: spacing.m,
  },
  mediaButtonText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
});

export default CreatePostScreen;