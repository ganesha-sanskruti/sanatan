// src/screens/location/TempleDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';
import { getTempleById, rateTemple } from '../../services/templeApi';

// Placeholder image for temples without images
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x200?text=Temple+Image';

const TempleDetailScreen = ({ route, navigation }) => {
  const { templeId } = route.params;
  const [temple, setTemple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchTempleDetails();
  }, [templeId]);

  const fetchTempleDetails = async () => {
    try {
      setLoading(true);
      const response = await getTempleById(templeId);
      
      if (response.success) {
        setTemple(response.data);
      } else {
        Alert.alert('Error', 'Failed to fetch temple details');
      }
    } catch (error) {
      console.error('Error fetching temple details:', error);
      Alert.alert('Error', 'Failed to fetch temple details');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMaps = () => {
    if (!temple || !temple.location) return;
    
    const { coordinates } = temple.location;
    const latitude = coordinates[1];
    const longitude = coordinates[0];
    const label = temple.name;
    
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });
    
    Linking.openURL(url);
  };

  const handleCall = () => {
    if (!temple || !temple.contact) return;
    
    Linking.openURL(`tel:${temple.contact}`);
  };

  const handleWebsite = () => {
    if (!temple || !temple.website) return;
    
    Linking.openURL(temple.website);
  };

  const handleShare = async () => {
    if (!temple) return;
    
    try {
      await Share.share({
        message: `Check out ${temple.name} at ${temple.address}. It's a beautiful ${temple.type} temple!`,
        title: temple.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRateTemple = async (rating) => {
    try {
      setUserRating(rating);
      setSubmittingRating(true);
      
      const response = await rateTemple(templeId, rating);
      
      if (response.success) {
        setTemple(response.data);
        Alert.alert('Thank You', 'Your rating has been submitted');
      } else {
        Alert.alert('Error', 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error rating temple:', error);
      Alert.alert('Error', 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
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

  if (!temple) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Temple not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{temple.name}</Text>
        </View>

        {/* Temple Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: temple.images && temple.images.length > 0 ? temple.images[0] : PLACEHOLDER_IMAGE }}
            style={styles.templeImage}
            resizeMode="cover"
          />
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              ⭐ {temple.ratings.average.toFixed(1)} ({temple.ratings.count})
            </Text>
          </View>
        </View>

        {/* Temple Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.templeName}>{temple.name}</Text>
          <Text style={styles.templeType}>{temple.type}</Text>
          
          <View style={styles.addressContainer}>
            <Text style={styles.addressTitle}>Address:</Text>
            <Text style={styles.addressText}>{temple.address}</Text>
          </View>
          
          {temple.timings && (
            <View style={styles.timingsContainer}>
              <Text style={styles.timingsTitle}>Timings:</Text>
              <Text style={styles.timingsText}>{temple.timings}</Text>
            </View>
          )}

          {temple.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>About:</Text>
              <Text style={styles.descriptionText}>{temple.description}</Text>
            </View>
          )}

          {/* Facilities */}
          {temple.facilities && temple.facilities.length > 0 && (
            <View style={styles.facilitiesContainer}>
              <Text style={styles.facilitiesTitle}>Facilities:</Text>
              <View style={styles.facilitiesList}>
                {temple.facilities.map((facility, index) => (
                  <View key={index} style={styles.facilityItem}>
                    <Text style={styles.facilityText}>{facility}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleOpenMaps}
            >
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>
            
            {temple.contact && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCall}
              >
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
            )}
            
            {temple.website && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleWebsite}
              >
                <Text style={styles.actionButtonText}>Website</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
            >
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>Rate this Temple:</Text>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRateTemple(star)}
                  disabled={submittingRating}
                >
                  <Text style={[
                    styles.ratingStar,
                    star <= userRating && styles.ratingStarSelected
                  ]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {submittingRating && (
              <ActivityIndicator size="small" color={colors.primary} />
            )}
          </View>

          {/* Map Section */}
          <View style={styles.mapSection}>
            <Text style={styles.mapTitle}>Location:</Text>
            <View style={styles.mapContainer}>
              {temple.location && (
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: temple.location.coordinates[1],
                    longitude: temple.location.coordinates[0],
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: temple.location.coordinates[1],
                      longitude: temple.location.coordinates[0],
                    }}
                    title={temple.name}
                  />
                </MapView>
              )}
              <TouchableOpacity
                style={styles.openMapButton}
                onPress={handleOpenMaps}
              >
                <Text style={styles.openMapButtonText}>Open in Maps</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
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
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.subtitle1,
    marginBottom: spacing.l,
    color: colors.text.secondary,
  },
  backButtonText: {
    ...typography.subtitle2,
    color: colors.primary,
  },
  imageContainer: {
    position: 'relative',
  },
  templeImage: {
    width: '100%',
    height: 200,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: spacing.m,
    right: spacing.m,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  ratingText: {
    color: '#FFF',
    ...typography.body2,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: spacing.m,
  },
  templeName: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  templeType: {
    ...typography.subtitle2,
    color: colors.primary,
    marginBottom: spacing.m,
  },
  addressContainer: {
    marginBottom: spacing.m,
  },
  addressTitle: {
    ...typography.subtitle2,
    marginBottom: spacing.xs,
  },
  addressText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  timingsContainer: {
    marginBottom: spacing.m,
  },
  timingsTitle: {
    ...typography.subtitle2,
    marginBottom: spacing.xs,
  },
  timingsText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  descriptionContainer: {
    marginBottom: spacing.m,
  },
  descriptionTitle: {
    ...typography.subtitle2,
    marginBottom: spacing.xs,
  },
  descriptionText: {
    ...typography.body2,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  facilitiesContainer: {
    marginBottom: spacing.m,
  },
  facilitiesTitle: {
    ...typography.subtitle2,
    marginBottom: spacing.xs,
  },
  facilitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityItem: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  facilityText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.l,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  actionButtonText: {
    color: '#FFF',
    ...typography.subtitle2,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  ratingTitle: {
    ...typography.subtitle1,
    marginBottom: spacing.m,
  },
  ratingStars: {
    flexDirection: 'row',
    marginBottom: spacing.s,
  },
  ratingStar: {
    fontSize: 32,
    color: colors.background.secondary,
    marginHorizontal: spacing.xs,
  },
  ratingStarSelected: {
    color: '#FFD700', // Gold color for selected stars
  },
  mapSection: {
    marginBottom: spacing.l,
  },
  mapTitle: {
    ...typography.subtitle2,
    marginBottom: spacing.s,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  openMapButton: {
    position: 'absolute',
    bottom: spacing.m,
    right: spacing.m,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 20,
  },
  openMapButtonText: {
    color: '#FFF',
    ...typography.body2,
    fontWeight: '600',
  },
});

export default TempleDetailScreen;