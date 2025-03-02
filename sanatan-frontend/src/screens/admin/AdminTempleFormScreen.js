// src/screens/admin/AdminTempleFormScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  Image,
  Platform,
  KeyboardAvoidingView,
  LogBox,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';
import { createTemple, updateTemple, getTempleById } from '../../services/templeApi';

// Temporarily ignore the VirtualizedList warning
LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

const AdminTempleFormScreen = ({ route, navigation }) => {
  const editMode = route.params?.templeId !== undefined;
  const templeId = route.params?.templeId;
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [timings, setTimings] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState('');
  const [facilities, setFacilities] = useState('');
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(!editMode);
  
  // UI state
  const [loading, setLoading] = useState(editMode);
  const [submitting, setSubmitting] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);

  // Temple types to select from
  const templeTypes = [
    'Shiva Temple',
    'Vishnu Temple',
    'Krishna Temple',
    'Ganesh Temple',
    'Hanuman Temple',
    'Durga Temple',
    'Lakshmi Temple',
    'Ram Temple',
    'ISKCON',
    'Other'
  ];

  useEffect(() => {
    if (editMode) {
      fetchTempleDetails();
    } else if (useCurrentLocation) {
      getCurrentLocation();
    }
  }, [editMode, useCurrentLocation]);

  const fetchTempleDetails = async () => {
    try {
      setLoading(true);
      const response = await getTempleById(templeId);
      
      if (response.success) {
        const temple = response.data;
        
        // Populate form fields with temple data
        setName(temple.name);
        setType(temple.type);
        setAddress(temple.address);
        setDescription(temple.description || '');
        setTimings(temple.timings || '');
        setContact(temple.contact || '');
        setWebsite(temple.website || '');
        setFacilities(temple.facilities?.join(', ') || '');
        
        // Set location
        if (temple.location) {
          setLocation({
            latitude: temple.location.coordinates[1],
            longitude: temple.location.coordinates[0],
          });
        }
        
        // Set images
        if (temple.images && temple.images.length > 0) {
          const formattedImages = temple.images.map(uri => ({ uri }));
          setImages(formattedImages);
        }
      } else {
        Alert.alert('Error', 'Failed to fetch temple details');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching temple details:', error);
      Alert.alert('Error', 'Failed to fetch temple details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        console.error('Geolocation error:', error);
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please set location manually.'
        );
        setUseCurrentLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleMapPress = event => {
    if (!useCurrentLocation) {
      setLocation(event.nativeEvent.coordinate);
    }
  };
  
  // Function to search for an address and update location
  const searchAddress = async (query) => {
    try {
      // You can use the Google Geocoding API here if you want to implement your own search
      // For now, just setting the address text
      setAddress(query);
    } catch (error) {
      console.error('Error searching address:', error);
    }
  };

  const pickImage = () => {
    const options = {
      title: 'Select Temple Images',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      mediaType: 'photo',
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      multiple: true,
      selectionLimit: 5 - images.length, // Allow up to 5 images total
    };

    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error:', response.error);
        Alert.alert('Error', 'Failed to select images');
      } else if (response.assets && response.assets.length > 0) {
        setImages([...images, ...response.assets]);
      }
    });
  };

  const removeImage = index => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Temple name is required');
      return false;
    }
    
    if (!type) {
      Alert.alert('Error', 'Temple type is required');
      return false;
    }
    
    if (!address.trim()) {
      Alert.alert('Error', 'Address is required');
      return false;
    }
    
    if (!location) {
      Alert.alert('Error', 'Location coordinates are required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      
      const templeData = {
        name,
        type,
        address,
        description,
        latitude: location.latitude,
        longitude: location.longitude,
        timings,
        contact,
        website,
        facilities,
      };
      
      console.log('Submitting temple data:', templeData);
      
      let response;
      
      if (editMode) {
        response = await updateTemple(templeId, templeData, images);
      } else {
        response = await createTemple(templeData, images);
      }
      
      if (response.success) {
        Alert.alert(
          'Success',
          `Temple ${editMode ? 'updated' : 'created'} successfully`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', `Failed to ${editMode ? 'update' : 'create'} temple`);
      }
    } catch (error) {
      console.error('Temple submission error:', error);
      Alert.alert(
        'Error',
        `Failed to ${editMode ? 'update' : 'create'} temple: ${error.message}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading temple details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={submitting}
          >
            <Text style={styles.backButtonIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editMode ? 'Edit Temple' : 'Add New Temple'}
          </Text>
        </View>
        
        <ScrollView 
          style={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formContainer}>
            {/* Temple Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Temple Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter temple name"
                editable={!submitting}
              />
            </View>

            {/* Temple Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Temple Type *</Text>
              <View style={styles.typeContainer}>
                {templeTypes.map(templeType => (
                  <TouchableOpacity
                    key={templeType}
                    style={[
                      styles.typeButton,
                      type === templeType && styles.typeButtonSelected
                    ]}
                    onPress={() => setType(templeType)}
                    disabled={submitting}
                  >
                    <Text style={[
                      styles.typeText,
                      type === templeType && styles.typeTextSelected
                    ]}>
                      {templeType}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={(text) => {
                  setAddress(text);
                  // Optionally, you could add a debounced search here
                }}
                placeholder="Enter complete address"
                multiline
                numberOfLines={3}
                editable={!submitting}
              />
              <TouchableOpacity 
                style={styles.searchAddressButton}
                onPress={() => searchAddress(address)}
                disabled={!address.trim() || submitting}
              >
                <Text style={styles.searchAddressButtonText}>Search this address</Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter temple description"
                multiline
                numberOfLines={5}
                editable={!submitting}
              />
            </View>

            {/* Timings */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Timings</Text>
              <TextInput
                style={styles.input}
                value={timings}
                onChangeText={setTimings}
                placeholder="E.g. 5:00 AM - 9:00 PM"
                editable={!submitting}
              />
            </View>

            {/* Contact */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Number</Text>
              <TextInput
                style={styles.input}
                value={contact}
                onChangeText={setContact}
                placeholder="Enter contact number"
                keyboardType="phone-pad"
                editable={!submitting}
              />
            </View>

            {/* Website */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                value={website}
                onChangeText={setWebsite}
                placeholder="Enter website URL"
                keyboardType="url"
                editable={!submitting}
              />
            </View>

            {/* Facilities */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Facilities</Text>
              <TextInput
                style={styles.input}
                value={facilities}
                onChangeText={setFacilities}
                placeholder="E.g. Parking, Prasad, Restrooms (comma separated)"
                editable={!submitting}
              />
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <View style={styles.locationHeader}>
                <Text style={styles.label}>Location *</Text>
                <View style={styles.locationToggle}>
                  <Text style={styles.toggleLabel}>Use Current Location</Text>
                  <Switch
                    value={useCurrentLocation}
                    onValueChange={value => {
                      setUseCurrentLocation(value);
                      if (value) {
                        getCurrentLocation();
                      }
                    }}
                    disabled={submitting}
                  />
                </View>
              </View>
              
              <View style={styles.mapContainer}>
                {location ? (
                  <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                      ...location,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }}
                    onPress={handleMapPress}
                    onMapReady={() => setMapReady(true)}
                  >
                    <Marker
                      coordinate={location}
                      draggable={!useCurrentLocation}
                      onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
                    />
                  </MapView>
                ) : (
                  <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapPlaceholderText}>Loading map...</Text>
                  </View>
                )}
                
                {!useCurrentLocation && mapReady && (
                  <Text style={styles.mapHint}>
                    Tap on the map to set location or drag the marker
                  </Text>
                )}
              </View>
              
              {location && (
                <View style={styles.coordinatesContainer}>
                  <Text style={styles.coordinatesText}>
                    Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
                  </Text>
                </View>
              )}
            </View>

            {/* Images */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Temple Images (max 5)</Text>
              <View style={styles.imagesContainer}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                      disabled={submitting}
                    >
                      <Text style={styles.removeImageButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                
                {images.length < 5 && (
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={pickImage}
                    disabled={submitting}
                  >
                    <Text style={styles.addImageButtonText}>+</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editMode ? 'Update Temple' : 'Add Temple'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    padding: spacing.s,
  },
  backButtonIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  headerTitle: {
    ...typography.h3,
    marginLeft: spacing.m,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
    marginTop: spacing.m,
    color: colors.text.secondary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    padding: spacing.m,
  },
  inputGroup: {
    marginBottom: spacing.l,
  },
  label: {
    ...typography.subtitle2,
    marginBottom: spacing.s,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    ...typography.body1,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  typeButtonSelected: {
    backgroundColor: colors.primary,
  },
  typeText: {
    ...typography.body2,
    color: colors.text.primary,
  },
  typeTextSelected: {
    color: colors.background.main,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  locationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    ...typography.body2,
    marginRight: spacing.s,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  mapHint: {
    position: 'absolute',
    bottom: spacing.s,
    left: spacing.s,
    right: spacing.s,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: spacing.s,
    borderRadius: 4,
    textAlign: 'center',
    ...typography.caption,
  },
  coordinatesContainer: {
    marginTop: spacing.s,
    alignItems: 'center',
  },
  coordinatesText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addImageButtonText: {
    fontSize: 40,
    color: colors.text.secondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  submitButtonText: {
    color: 'white',
    ...typography.subtitle1,
  },
  disabledButton: {
    opacity: 0.7,
  },
  searchAddressButton: {
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: spacing.s,
  },
  searchAddressButtonText: {
    ...typography.body2,
    color: colors.primary,
  },
});

export default AdminTempleFormScreen