// src/screens/location/NearbyPanditsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';

// Mock data for pandits
const MOCK_PANDITS = [
  {
    id: '1',
    name: 'Acharya Sharma',
    specialization: 'Vedic Rituals, Astrology',
    experience: 15,
    rating: 4.8,
    distance: 0.8,
    location: 'Bandra, Mumbai',
    image: 'https://via.placeholder.com/100',
    coordinate: { latitude: 19.0596, longitude: 72.8295 }
  },
  {
    id: '2',
    name: 'Pandit Ramesh Joshi',
    specialization: 'Marriage Ceremonies, Havan',
    experience: 20,
    rating: 4.7,
    distance: 1.5,
    location: 'Andheri, Mumbai',
    image: 'https://via.placeholder.com/100',
    coordinate: { latitude: 19.1136, longitude: 72.8697 }
  },
  {
    id: '3',
    name: 'Acharya Vinod Shastri',
    specialization: 'Vastu Shastra, Grih Pravesh',
    experience: 12,
    rating: 4.5,
    distance: 2.7,
    location: 'Juhu, Mumbai',
    image: 'https://via.placeholder.com/100',
    coordinate: { latitude: 19.1075, longitude: 72.8263 }
  },
  {
    id: '4',
    name: 'Pandit Krishna Trivedi',
    specialization: 'Katha, Bhagavad Gita Discourses',
    experience: 25,
    rating: 4.9,
    distance: 3.2,
    location: 'Dadar, Mumbai',
    image: 'https://via.placeholder.com/100',
    coordinate: { latitude: 19.0178, longitude: 72.8478 }
  },
  {
    id: '5',
    name: 'Acharya Deepak Mishra',
    specialization: 'Pitra Dosh Nivaran, Kaal Sarp Yog',
    experience: 18,
    rating: 4.6,
    distance: 4.0,
    location: 'Vile Parle, Mumbai',
    image: 'https://via.placeholder.com/100',
    coordinate: { latitude: 19.0969, longitude: 72.8497 }
  },
];

const NearbyPanditsScreen = ({ navigation }) => {
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // For now, we'll just use the mock data
    // In a real app, we would request location permissions
    setPandits(MOCK_PANDITS);
    setLoading(false);
  }, []);

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(1));
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const renderPanditItem = ({ item }) => (
    <TouchableOpacity
      style={styles.panditCard}
      onPress={() => navigation.navigate('PanditDetail', { pandit: item })}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.panditImage}
      />
      <View style={styles.panditInfo}>
        <Text style={styles.panditName}>{item.name}</Text>
        <Text style={styles.panditSpecialization}>{item.specialization}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.panditDetail}>⭐ {item.rating}</Text>
          <Text style={styles.panditDetail}>🧠 {item.experience} yrs exp</Text>
          <Text style={styles.panditDetail}>📍 {item.distance} km</Text>
        </View>
        <Text style={styles.panditLocation}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={commonStyles.safeArea}>
      <View style={[commonStyles.container, commonStyles.screenPadding]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={[typography.h2, styles.headerTitle]}>Nearby Pandits</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('CreatePanditProfile')}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Finding nearby pandits...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsText}>
              {pandits.length} pandits found near you
            </Text>
            <FlatList
              data={pandits}
              renderItem={renderPanditItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.m,
    marginBottom: spacing.l,
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
  addButton: {
    padding: spacing.s,
  },
  addButtonText: {
    fontSize: 24,
    color: colors.primary,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
    marginTop: spacing.m,
    color: colors.text.secondary,
  },
  resultsText: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.m,
  },
  listContainer: {
    paddingBottom: spacing.xxl,
  },
  panditCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  panditImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: spacing.m,
  },
  panditInfo: {
    flex: 1,
  },
  panditName: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  panditSpecialization: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  panditDetail: {
    ...typography.body2,
    color: colors.text.secondary,
    marginRight: spacing.m,
  },
  panditLocation: {
    ...typography.body2,
    color: colors.text.secondary,
  },
});

export default NearbyPanditsScreen;