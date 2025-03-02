import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Switch, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5001/api'; // Update with your actual API URL

// Simple utility to validate email
const validateEmail = (email) => {
  if (!email) return true; // Email is optional
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const ProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [preferredTemple, setPreferredTemple] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoadingProfile(true);
      
      // Since we're in development/test mode, we'll get the data from AsyncStorage
      // In production, we would fetch from the API
      const token = await AsyncStorage.getItem('token');
      const storedPhone = await AsyncStorage.getItem('userPhone');
      const storedName = await AsyncStorage.getItem('userName');
      
      if (!token) {
        // If no token exists, navigate to login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }
      
      // Set the basic information we have in storage
      if (storedName) setName(storedName);
      if (storedPhone) setPhoneNumber(storedPhone);
      
      // In a real app, we would fetch the full profile from the API
      // try {
      //   const response = await axios.get(`${API_URL}/users/profile`, {
      //     headers: { Authorization: `Bearer ${token}` }
      //   });
      //   
      //   if (response.data && response.data.user) {
      //     const { user } = response.data;
      //     setName(user.name || '');
      //     setPhoneNumber(user.phoneNumber || '');
      //     setEmail(user.email || '');
      //     setPreferredTemple(user.preferredTemple || '');
      //     setNotificationsEnabled(user.notificationsEnabled !== false);
      //     
      //     if (user.profilePicture) {
      //       setProfilePhoto(`${API_URL}/${user.profilePicture}`);
      //     }
      //   }
      // } catch (error) {
      //   if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      //     await AsyncStorage.removeItem('token');
      //     navigation.reset({
      //       index: 0,
      //       routes: [{ name: 'Login' }],
      //     });
      //   } else {
      //     console.error('Error fetching profile:', error);
      //     Alert.alert('Error', 'Failed to load profile. Please try again.');
      //   }
      // }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data. Please try again.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
      if (!response.didCancel && !response.error && response.assets && response.assets.length > 0) {
        setProfilePhoto(response.assets[0].uri);
      }
    });
  };

  const saveProfile = async () => {
    // Validate email if provided
    if (email && !validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Session Expired', 'Please login again', [
          { text: 'OK', onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })}
        ]);
        return;
      }
      
      // In a real app, we would send the update to the backend
      // Here we'll just update AsyncStorage for the name
      await AsyncStorage.setItem('userName', name);
      
      // Prepare form data for multipart/form-data
      // const formData = new FormData();
      // formData.append('name', name);
      // if (email) formData.append('email', email);
      // if (preferredTemple) formData.append('preferredTemple', preferredTemple);
      // formData.append('notificationsEnabled', notificationsEnabled);
      // 
      // if (profilePhoto && !profilePhoto.startsWith('http')) {
      //   const filename = profilePhoto.split('/').pop();
      //   const match = /\.(\w+)$/.exec(filename);
      //   const type = match ? `image/${match[1]}` : 'image/jpeg';
      //   
      //   formData.append('profilePicture', {
      //     uri: profilePhoto,
      //     name: filename,
      //     type
      //   });
      // }
      // 
      // await axios.put(`${API_URL}/users/profile`, formData, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     'Content-Type': 'multipart/form-data'
      //   }
      // });
      
      // Simulate a delay for the update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        await AsyncStorage.removeItem('token');
        Alert.alert('Session Expired', 'Your session has expired. Please login again.', [
          { text: 'OK', onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })}
        ]);
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear all user data
      await AsyncStorage.multiRemove(['token', 'userName', 'userPhone']);
      
      // Navigate to login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  if (loadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Photo */}
      <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
        {profilePhoto ? (
          <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Pick an Image</Text>
          </View>
        )}
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>

      {/* Personal Information */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={[styles.input, styles.disabledInput]}
        value={phoneNumber}
        editable={false}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Preferred Temples/Communities */}
      <Text style={styles.label}>Preferred Temple/Community</Text>
      <TextInput
        style={styles.input}
        placeholder="E.g. ISKCON, Meenakshi Temple"
        value={preferredTemple}
        onChangeText={setPreferredTemple}
      />

      {/* Notification Preferences */}
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Enable Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: colors.text.tertiary, true: colors.primary }}
        />
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
        onPress={saveProfile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Profile</Text>
        )}
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.m,
    backgroundColor: colors.background.main,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.main,
  },
  loadingText: {
    ...typography.body1,
    marginTop: spacing.m,
  },
  photoContainer: {
    alignItems: 'center',
    marginVertical: spacing.l,
  },
  label: {
    ...typography.body1,
    fontWeight: 'bold',
    marginTop: spacing.m,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.s,
    marginTop: spacing.xs,
  },
  disabledInput: {
    backgroundColor: colors.background.secondary,
    color: colors.text.secondary,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.m,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: colors.text.secondary,
  },
  changePhotoText: {
    ...typography.body2,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.m,
    alignItems: 'center',
    marginTop: spacing.l,
  },
  saveButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  saveButtonText: {
    ...typography.subtitle1,
    color: colors.background.main,
    fontWeight: 'bold',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.m,
    alignItems: 'center',
    marginTop: spacing.m,
    marginBottom: spacing.xl,
  },
  logoutButtonText: {
    ...typography.subtitle1,
    color: colors.primary,
    fontWeight: 'bold',
  }
});

export default ProfileScreen;