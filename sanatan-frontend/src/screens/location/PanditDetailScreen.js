// src/screens/location/PanditDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Share,
  BackHandler,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';
import { createBooking } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PanditDetailScreen = ({ route, navigation }) => {
  const { pandit } = route.params;
  const [isContactVisible, setIsContactVisible] = useState(false);
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    serviceType: '',
    additionalNotes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle hardware back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (isBookingModalVisible) {
          setIsBookingModalVisible(false);
          return true;
        }
        handleGoBack();
        return true; // Prevent default behavior
      }
    );

    return () => backHandler.remove();
  }, [isBookingModalVisible]);

  // Handle back navigation properly
  const handleGoBack = () => {
    console.log("Attempting to navigate back from PanditDetailScreen");
    
    // Try multiple navigation methods for redundancy
    try {
      // First, try conventional back navigation
      navigation.goBack();
      
      // If that doesn't work, explicitly navigate to the list screen
      setTimeout(() => {
        navigation.navigate('PanditsList');
      }, 100);
      
      return true;
    } catch (error) {
      console.log("Error during navigation: ", error);
      
      // Fallback to direct navigation
      navigation.navigate('NearbyPandits');
      return true;
    }
  };

  // Mock contact and service data
  const contactInfo = {
    phone: '+91 9876543210',
    email: `${pandit.name.toLowerCase().replace(' ', '.')}@example.com`,
    address: `123 Temple Street, ${pandit.location}`
  };

  const services = [
    {
      id: '1',
      name: 'Grih Pravesh',
      description: 'Traditional house warming ceremony',
      duration: '3-4 hours',
      price: '₹5,000 - ₹10,000'
    },
    {
      id: '2',
      name: 'Marriage Ceremony',
      description: 'Complete wedding rituals as per vedic traditions',
      duration: '4-6 hours',
      price: '₹15,000 - ₹25,000'
    },
    {
      id: '3',
      name: 'Satyanarayan Katha',
      description: 'Ritual worship of Lord Vishnu',
      duration: '2-3 hours',
      price: '₹3,000 - ₹7,000'
    },
    {
      id: '4',
      name: 'Personal Consultation',
      description: 'Guidance on personal matters or astrological concerns',
      duration: '1 hour',
      price: '₹1,000 - ₹2,000'
    }
  ];

  const handleCall = () => {
    Linking.openURL(`tel:${contactInfo.phone}`)
      .catch(() => {
        Alert.alert('Failed to make a call', 'Please try again later');
      });
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${contactInfo.email}`)
      .catch(() => {
        Alert.alert('Failed to open email', 'Please try again later');
      });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${pandit.name}, a ${pandit.specialization} specialist located in ${pandit.location}. Contact: ${contactInfo.phone}`,
      });
    } catch (error) {
      Alert.alert('Error sharing', error.message);
    }
  };

  const handleBooking = () => {
    setIsBookingModalVisible(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalVisible(false);
  };

  const updateBookingForm = (field, value) => {
    setBookingFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateBookingForm = () => {
    // Basic validation
    if (!bookingFormData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    
    if (!bookingFormData.phone.trim() || !/^\d{10}$/.test(bookingFormData.phone.trim())) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }
    
    if (bookingFormData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingFormData.email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (!bookingFormData.date.trim()) {
      Alert.alert('Error', 'Please enter preferred date');
      return false;
    }
    
    if (!bookingFormData.time.trim()) {
      Alert.alert('Error', 'Please enter preferred time');
      return false;
    }
    
    if (!bookingFormData.serviceType.trim()) {
      Alert.alert('Error', 'Please select a service type');
      return false;
    }
    
    return true;
  };


// Replace the existing submitBookingRequest function
const submitBookingRequest = async () => {
  if (!validateBookingForm()) return;
  
  try {
    setIsSubmitting(true);
    
    // Format the date properly for the API
    const dateArr = bookingFormData.date.split('/');
    const formattedDate = `${dateArr[2]}-${dateArr[1]}-${dateArr[0]}`; // Convert DD/MM/YYYY to YYYY-MM-DD
    
    // Use the API service to create a booking
    await createBooking({
      panditId: pandit.id,
      name: bookingFormData.name,
      phone: bookingFormData.phone,
      email: bookingFormData.email,
      date: formattedDate,
      time: bookingFormData.time,
      serviceType: bookingFormData.serviceType,
      additionalNotes: bookingFormData.additionalNotes
    });
    
    // Reset form
    setBookingFormData({
      name: '',
      phone: '',
      email: '',
      date: '',
      time: '',
      serviceType: '',
      additionalNotes: '',
    });
    
    setIsBookingModalVisible(false);
    
    Alert.alert(
      'Booking Successful',
      `Your consultation with ${pandit.name} has been requested. You will receive a confirmation shortly.`,
      [{ text: 'OK' }]
    );
  } catch (error) {
    console.error('Error submitting booking request:', error);
    Alert.alert('Error', error.message || 'Failed to submit booking request. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  // Render booking form modal
  const renderBookingModal = () => (
    <Modal
      visible={isBookingModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeBookingModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book Consultation</Text>
            <TouchableOpacity onPress={closeBookingModal} disabled={isSubmitting}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScrollView}>
            {/* Pandit Info */}
            <View style={styles.modalPanditInfo}>
              <Image source={{ uri: pandit.image }} style={styles.modalPanditImage} />
              <View>
                <Text style={styles.modalPanditName}>{pandit.name}</Text>
                <Text style={styles.modalPanditSpecialization}>{pandit.specialization}</Text>
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Your Name *</Text>
              <TextInput
                style={styles.formInput}
                value={bookingFormData.name}
                onChangeText={(text) => updateBookingForm('name', text)}
                placeholder="Enter your full name"
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number *</Text>
              <TextInput
                style={styles.formInput}
                value={bookingFormData.phone}
                onChangeText={(text) => updateBookingForm('phone', text)}
                placeholder="Enter your 10-digit phone number"
                keyboardType="phone-pad"
                maxLength={10}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email (optional)</Text>
              <TextInput
                style={styles.formInput}
                value={bookingFormData.email}
                onChangeText={(text) => updateBookingForm('email', text)}
                placeholder="Enter your email address"
                keyboardType="email-address"
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Preferred Date *</Text>
              <TextInput
                style={styles.formInput}
                value={bookingFormData.date}
                onChangeText={(text) => updateBookingForm('date', text)}
                placeholder="DD/MM/YYYY"
                editable={!isSubmitting}
              />
              <Text style={styles.formHint}>Format: DD/MM/YYYY (e.g., 25/03/2025)</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Preferred Time *</Text>
              <TextInput
                style={styles.formInput}
                value={bookingFormData.time}
                onChangeText={(text) => updateBookingForm('time', text)}
                placeholder="HH:MM AM/PM"
                editable={!isSubmitting}
              />
              <Text style={styles.formHint}>Format: HH:MM AM/PM (e.g., 10:30 AM)</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Service Type *</Text>
              <View style={styles.serviceOptions}>
                {services.map(service => (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceOption,
                      bookingFormData.serviceType === service.name && styles.selectedServiceOption
                    ]}
                    onPress={() => updateBookingForm('serviceType', service.name)}
                    disabled={isSubmitting}
                  >
                    <Text 
                      style={[
                        styles.serviceOptionText,
                        bookingFormData.serviceType === service.name && styles.selectedServiceOptionText
                      ]}
                    >
                      {service.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Additional Notes (optional)</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={bookingFormData.additionalNotes}
                onChangeText={(text) => updateBookingForm('additionalNotes', text)}
                placeholder="Any specific requirements or questions..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={submitBookingRequest}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Confirm Booking Request'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={commonStyles.safeArea}>
      <ScrollView style={commonStyles.container}>
        {/* Header with Image */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
            accessible={true}
            accessibilityLabel="Go back"
            accessibilityHint="Returns to the previous screen"
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: pandit.image }}
            style={styles.profileImage}
          />
        </View>

        {/* Basic Info */}
        <View style={[styles.section, styles.basicInfo]}>
          <Text style={typography.h2}>{pandit.name}</Text>
          <Text style={styles.specialization}>{pandit.specialization}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ {pandit.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>🧠 {pandit.experience} yrs</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>📍 {pandit.distance} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setIsContactVisible(!isContactVisible)}
          >
            <Text style={typography.h3}>Contact Information</Text>
            <Text style={styles.toggleText}>{isContactVisible ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          
          {isContactVisible && (
            <View style={styles.contactContainer}>
              <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
                <Text style={styles.contactLabel}>Phone:</Text>
                <Text style={styles.contactValue}>{contactInfo.phone}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
                <Text style={styles.contactLabel}>Email:</Text>
                <Text style={styles.contactValue}>{contactInfo.email}</Text>
              </TouchableOpacity>
              
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Address:</Text>
                <Text style={styles.contactValue}>{contactInfo.address}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Services Offered */}
        <View style={styles.section}>
          <Text style={[typography.h3, styles.sectionTitle]}>Services Offered</Text>
          
          {services.map(service => (
            <View key={service.id} style={styles.serviceItem}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
              <View style={styles.serviceMetaRow}>
                <Text style={styles.serviceMeta}>⏱️ {service.duration}</Text>
                <Text style={styles.serviceMeta}>💰 {service.price}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[typography.h3, styles.sectionTitle]}>About</Text>
          <Text style={styles.aboutText}>
            {`${pandit.name} is a respected ${pandit.specialization.toLowerCase()} specialist with ${pandit.experience} years of experience. He has performed thousands of ceremonies and rituals across the region, bringing peace and spiritual guidance to families.`}
          </Text>
          <Text style={styles.aboutText}>
            {`He is well-versed in Vedic scriptures and follows traditional practices while adapting to modern needs. His deep understanding of ancient texts and rituals makes him a sought-after spiritual guide in ${pandit.location}.`}
          </Text>
        </View>

        {/* Padding at bottom for scroll */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Booking Button */}
      <View style={styles.bookingContainer}>
        <TouchableOpacity 
          style={styles.bookingButton}
          onPress={handleBooking}
        >
          <Text style={styles.bookingButtonText}>Book Consultation</Text>
        </TouchableOpacity>
      </View>

      {/* Booking Modal */}
      {renderBookingModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
  },
  backButton: {
    padding: spacing.s,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text.primary,
  },
  shareButton: {
    padding: spacing.s,
  },
  shareButtonText: {
    ...typography.body1,
    color: colors.primary,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: spacing.m,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  section: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.m,
    marginHorizontal: spacing.m,
    marginBottom: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  basicInfo: {
    alignItems: 'center',
    marginTop: -spacing.xxl,
    paddingTop: spacing.xxl,
  },
  specialization: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.m,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.m,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h4,
    color: colors.primary,
  },
  statLabel: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: spacing.m,
  },
  toggleText: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  contactContainer: {
    marginTop: spacing.m,
  },
  contactItem: {
    flexDirection: 'row',
    marginBottom: spacing.s,
  },
  contactLabel: {
    ...typography.body1,
    fontWeight: 'bold',
    width: 70,
  },
  contactValue: {
    ...typography.body1,
    flex: 1,
  },
  serviceItem: {
    backgroundColor: colors.background.main,
    borderRadius: 8,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  serviceName: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.s,
  },
  serviceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceMeta: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  aboutText: {
    ...typography.body1,
    marginBottom: spacing.m,
    lineHeight: 22,
  },
  bookingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.m,
    backgroundColor: colors.background.main,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bookingButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.m,
    alignItems: 'center',
  },
  bookingButtonText: {
    ...typography.body1,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.main,
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
    padding: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
    paddingBottom: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
  },
  closeButton: {
    fontSize: 24,
    color: colors.text.secondary,
    padding: spacing.xs,
  },
  formScrollView: {
    marginBottom: spacing.m,
  },
  modalPanditInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
    padding: spacing.s,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
  },
  modalPanditImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: spacing.m,
  },
  modalPanditName: {
    ...typography.h4,
  },
  modalPanditSpecialization: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  formGroup: {
    marginBottom: spacing.m,
  },
  formLabel: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  formInput: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.m,
    ...typography.body1,
  },
  formHint: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  serviceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  serviceOption: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.m,
    margin: spacing.xs,
  },
  selectedServiceOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  serviceOptionText: {
    ...typography.body2,
  },
  selectedServiceOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.m,
    alignItems: 'center',
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

export default PanditDetailScreen;