import React, { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { request, PERMISSIONS } from 'react-native-permissions';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';
import { getNearbyTemples, searchTemples } from '../../services/templeApi';
import { GOOGLE_MAPS_API_KEY } from '@env';



const NearbyTemplesScreen = ({ navigation }) => {
  const [temples, setTemples] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedView, setSelectedView] = useState('list'); // 'list' or 'map'
  const [sortByDistance, setSortByDistance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searching, setSearching] = useState(false);
  const mapRef = useRef(null);
  const placesRef = useRef(null);

  // Fetch user location and nearby temples
  useEffect(() => {
    getUserLocationAndTemples();
  }, []);

  const getUserLocationAndTemples = async () => {
    try {
      setLoading(true);
      
      // Request location permission first
      let permissionRequest;
      
      if (Platform.OS === 'ios') {
        permissionRequest = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      } else {
        permissionRequest = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      }
      
      if (permissionRequest === 'granted') {
        // Permission granted, now get location
        Geolocation.getCurrentPosition(
          async position => {
            const userCoords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            
            setUserLocation(userCoords);
            
            // Fetch nearby temples with the user's coordinates
            await fetchNearbyTemples(userCoords.latitude, userCoords.longitude);
          },
          error => {
            console.error('Geolocation error:', error);
            // Better error handling:
            if (error.code === 3) { // TIMEOUT
              Alert.alert(
                'Location Timeout',
                'Getting your location is taking longer than expected. Would you like to try again or proceed with default location?',
                [
                  {
                    text: 'Try Again',
                    onPress: () => getUserLocationAndTemples()
                  },
                  {
                    text: 'Use Default',
                    onPress: () => {
                      // Use a default location (e.g., city center)
                      const defaultLocation = {
                        latitude: 28.6139, // Default to a central location (Delhi NCR)
                        longitude: 77.2090
                      };
                      setUserLocation(defaultLocation);
                      fetchNearbyTemples(defaultLocation.latitude, defaultLocation.longitude);
                    }
                  }
                ]
              );
            } else {
              Alert.alert(
                'Location Error',
                'Unable to get your location. Please check your location settings and try again.',
                [{ text: 'OK' }]
              );
            }
            setLoading(false);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 30000, // Increase timeout to 30 seconds
            maximumAge: 1000 
          }
        );
      } else {
        // Permission denied
        Alert.alert(
          'Location Permission Denied',
          'Sanatan needs location permission to find nearby temples. Please enable location services in your device settings.',
          [{ text: 'OK' }]
        );
        setLoading(false);
      }
    } catch (error) {
      console.error('Error getting location and temples:', error);
      setLoading(false);
    }
  };

  const fetchNearbyTemples = async (latitude, longitude) => {
    try {
      const response = await getNearbyTemples(latitude, longitude, 10); // 10km radius
      
      if (response.success) {
        setTemples(response.data);
      } else {
        console.error('API returned error:', response);
        Alert.alert('Error', 'Failed to fetch nearby temples');
      }
    } catch (error) {
      console.error('Error fetching nearby temples:', error);
      Alert.alert('Error', 'Failed to fetch nearby temples');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) {
      // If search is cleared, reset to nearby temples
      if (userLocation) {
        fetchNearbyTemples(userLocation.latitude, userLocation.longitude);
      }
      return;
    }
    
    try {
      setSearching(true);
      
      const response = await searchTemples(
        searchText,
        userLocation?.latitude,
        userLocation?.longitude
      );
      
      if (response.success) {
        setTemples(response.data);
      } else {
        Alert.alert('Error', 'Failed to search temples');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search temples');
    } finally {
      setSearching(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    
    if (userLocation) {
      await fetchNearbyTemples(userLocation.latitude, userLocation.longitude);
    }
  };

  const getSortedTemples = () => {
    if (!temples) return [];
    
    return [...temples].sort((a, b) => {
      const distanceA = parseFloat(a.distance?.split(' ')[0] || 0);
      const distanceB = parseFloat(b.distance?.split(' ')[0] || 0);
      return sortByDistance ? distanceA - distanceB : distanceB - distanceA;
    });
  };

  const renderTempleItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.templeCard}
      onPress={() => navigation.navigate('TempleDetail', { templeId: item._id })}
    >
      <View style={styles.templeInfo}>
        <Text style={styles.templeName}>{item.name}</Text>
        {item.distance && <Text style={styles.templeDistance}>{item.distance}</Text>}
        <Text style={styles.templeAddress}>{item.address}</Text>
        <Text style={styles.templeTimings}>{item.timings}</Text>
      </View>
      <View style={styles.templeRating}>
        <Text style={styles.ratingText}>⭐ {item.ratings?.average.toFixed(1) || 'N/A'}</Text>
        <Text style={styles.typeText}>{item.type}</Text>
      </View>
    </TouchableOpacity>
  );

  // Empty list component
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <>
          <Text style={styles.emptyText}>No temples found nearby</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={getUserLocationAndTemples}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Temples</Text>
      </View>

      {/* Google Places Autocomplete */}
      <View style={styles.autocompleteContainer}>
        <GooglePlacesAutocomplete
          ref={placesRef}
          placeholder='Search for a location...'
          onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            if (details) {
              const { lat, lng } = details.geometry.location;
              
              // Update user location
              const searchLocation = {
                latitude: lat,
                longitude: lng
              };
              
              setUserLocation(searchLocation);
              
              // Fetch temples near this location
              fetchNearbyTemples(lat, lng);
              
              // If in map view, center the map on this location
              if (selectedView === 'map' && mapRef.current) {
                mapRef.current.animateToRegion({
                  ...searchLocation,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }, 1000);
              }
            }
          }}
          fetchDetails={true}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'en',
            components: 'country:in', // Restrict to India
          }}
          styles={{
            container: {
              flex: 0,
            },
            textInputContainer: {
              backgroundColor: colors.background.secondary,
              borderRadius: 8,
              paddingHorizontal: 5,
            },
            textInput: {
              height: 40,
              color: colors.text.primary,
              fontSize: 16,
              backgroundColor: colors.background.secondary,
            },
            predefinedPlacesDescription: {
              color: colors.primary,
            },
            listView: {
              backgroundColor: colors.background.main,
              borderRadius: 8,
              marginTop: 5,
            },
            row: {
              backgroundColor: colors.background.main,
              padding: 13,
              height: 44,
              flexDirection: 'row',
            },
            separator: {
              height: 0.5,
              backgroundColor: colors.border,
            },
            description: {
              fontSize: 14,
            },
            loader: {
              flexDirection: 'row',
              justifyContent: 'flex-end',
              height: 20,
            },
          }}
        />
      </View>

      {/* Search Bar for Temple Name */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search temples by name..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={searching}
        >
          {searching ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.actionContainer}>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setSortByDistance(!sortByDistance)}
          >
            <Text style={styles.sortButtonText}>
              {sortByDistance ? '↓ Distance' : '↑ Distance'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AdminTempleForm')}
          >
            <Text style={styles.addButtonText}>+ Add Temple</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.viewToggle}>
        <TouchableOpacity 
          style={[styles.toggleButton, selectedView === 'list' && styles.toggleButtonActive]}
          onPress={() => setSelectedView('list')}
        >
          <Text style={[styles.toggleText, selectedView === 'list' && styles.toggleTextActive]}>List</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, selectedView === 'map' && styles.toggleButtonActive]}
          onPress={() => setSelectedView('map')}
        >
          <Text style={[styles.toggleText, selectedView === 'map' && styles.toggleTextActive]}>Map</Text>
        </TouchableOpacity>
      </View>

      {selectedView === 'list' ? (
        <FlatList
          data={getSortedTemples()}
          renderItem={renderTempleItem}
          keyExtractor={item => item._id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        />
      ) : (
        <View style={styles.mapContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : userLocation && temples.length > 0 ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                ...userLocation,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              {/* User location marker */}
              <Marker
                coordinate={userLocation}
                title="Your Location"
                pinColor="blue"
              />
              
              {/* Temple markers */}
              {temples.map(temple => (
                <Marker
                  key={temple._id}
                  coordinate={{
                    latitude: temple.location.coordinates[1],
                    longitude: temple.location.coordinates[0],
                  }}
                  title={temple.name}
                  description={temple.address}
                  onCalloutPress={() => navigation.navigate('TempleDetail', { templeId: temple._id })}
                />
              ))}
            </MapView>
          ) : (
            <View style={styles.emptyMapContainer}>
              <Text style={styles.emptyText}>No temples found nearby</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
  },
  autocompleteContainer: {
    marginHorizontal: spacing.m,
    marginBottom: spacing.s,
    zIndex: 1, // Important for dropdown to show over other elements
    elevation: 50, // For Android
  },
  searchContainer: {
    flexDirection: 'row',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    paddingHorizontal: spacing.m,
    marginRight: spacing.s,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: colors.background.main,
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.s,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 20,
    marginRight: spacing.m,
  },
  sortButtonText: {
    color: colors.text.primary,
    ...typography.body2,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 20,
  },
  addButtonText: {
    color: colors.background.main,
    ...typography.body2,
    fontWeight: '600',
  },
  viewToggle: {
    flexDirection: 'row',
    padding: spacing.m,
    backgroundColor: colors.background.main,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.m,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.xs,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    ...typography.subtitle2,
    color: colors.text.secondary,
  },
  toggleTextActive: {
    color: colors.background.main,
  },
  listContent: {
    padding: spacing.m,
    flexGrow: 1,
  },
  templeCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.main,
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  templeInfo: {
    flex: 1,
  },
  templeName: {
    ...typography.subtitle1,
    marginBottom: spacing.xs,
  },
  templeDistance: {
    ...typography.body2,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  templeAddress: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  templeTimings: {
    ...typography.body2,
    color: colors.text.tertiary,
  },
  templeRating: {
    alignItems: 'flex-end',
  },
  ratingText: {
    ...typography.subtitle2,
    marginBottom: spacing.xs,
  },
  typeText: {
    ...typography.body2,
    color: colors.text.secondary,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.subtitle1,
    color: colors.text.secondary,
    marginBottom: spacing.m,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.background.main,
    ...typography.subtitle2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NearbyTemplesScreen;