// src/screens/location/CreatePanditProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';
import * as ImagePicker from 'react-native-image-picker';

const CreatePanditProfileScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    specializations: '',
    experience: '',
    servicesOffered: '',
    profileImage: null,
    isAvailableOnline: false,
    isAvailableForTravel: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormField = (field, value) => {
    setFormData(prevState => ({
      ...prevState,
      [field]: value
    }));
  };

  const selectImage = () => {
    const options = {
      title: 'Select Profile Picture',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      mediaType: 'photo',
      includeBase64: false,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        Alert.alert('Error', 'Failed to pick image');
      } else {
        const source = { uri: response.assets[0].uri };
        updateFormField('profileImage', source);
      }
    });
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return false;
    }
    
    if (!formData.phoneNumber.trim() || !/^\d{10}$/.test(formData.phoneNumber.trim())) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }
    
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return false;
    }
    
    if (!formData.city.trim()) {
      Alert.alert('Error', 'Please enter a city');
      return false;
    }
    
    if (!formData.specializations.trim()) {
      Alert.alert('Error', 'Please enter specializations');
      return false;
    }
    
    if (!formData.experience.trim() || isNaN(formData.experience)) {
      Alert.alert('Error', 'Please enter valid years of experience');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      // In a real app, you would send this data to your server
      // const response = await axios.post('your-api-endpoint', formData);
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Success',
        'Pandit profile created successfully! It will be reviewed by our team.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={commonStyles.safeArea}>
      <ScrollView style={commonStyles.container}>
        <View style={[commonStyles.screenPadding, styles.content]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={isSubmitting}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={[typography.h2, styles.headerTitle]}>Create Pandit Profile</Text>
            <View style={styles.placeholder} />
          </View>

          <Text style={styles.subtitle}>
            Fill in the details below to create a pandit profile. Fields marked with * are required.
          </Text>

          {/* Profile Picture */}
          <View style={styles.imageSection}>
            <TouchableOpacity onPress={selectImage} disabled={isSubmitting}>
              {formData.profileImage ? (
                <Image 
                  source={formData.profileImage} 
                  style={styles.profileImage} 
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => updateFormField('name', text)}
                placeholder="Enter full name"
                editable={!isSubmitting}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(text) => updateFormField('phoneNumber', text)}
                placeholder="Enter 10-digit phone number"
                keyboardType="phone-pad"
                maxLength={10}
                editable={!isSubmitting}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => updateFormField('email', text)}
                placeholder="Enter email address"
                keyboardType="email-address"
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(text) => updateFormField('address', text)}
                placeholder="Enter street address"
                editable={!isSubmitting}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => updateFormField('city', text)}
                placeholder="Enter city"
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Professional Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Specializations *</Text>
              <TextInput
                style={styles.input}
                value={formData.specializations}
                onChangeText={(text) => updateFormField('specializations', text)}
                placeholder="e.g., Vedic Rituals, Marriage Ceremonies"
                editable={!isSubmitting}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Years of Experience *</Text>
              <TextInput
                style={styles.input}
                value={formData.experience}
                onChangeText={(text) => updateFormField('experience', text)}
                placeholder="Enter years of experience"
                keyboardType="number-pad"
                editable={!isSubmitting}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Services Offered</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.servicesOffered}
                onChangeText={(text) => updateFormField('servicesOffered', text)}
                placeholder="List the services you offer, one per line"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Available for Online Consultations</Text>
              <Switch
                value={formData.isAvailableOnline}
                onValueChange={(value) => updateFormField('isAvailableOnline', value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={formData.isAvailableOnline ? "#fff" : "#f4f3f4"}
                disabled={isSubmitting}
              />
            </View>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Available to Travel</Text>
              <Switch
                value={formData.isAvailableForTravel}
                onValueChange={(value) => updateFormField('isAvailableForTravel', value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={formData.isAvailableForTravel ? "#fff" : "#f4f3f4"}
                disabled={isSubmitting}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.m,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: spacing.s,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  subtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.l,
    textAlign: 'center',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  section: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.l,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.m,
  },
  inputContainer: {
    marginBottom: spacing.m,
  },
  label: {
    ...typography.body2,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.background.main,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.m,
    ...typography.body1,
  },
  textArea: {
    minHeight: 100,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  switchLabel: {
    ...typography.body1,
    flex: 1,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.m,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    ...typography.body1,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default CreatePanditProfileScreen;