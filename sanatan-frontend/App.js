import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { enableScreens } from 'react-native-screens';
import { View, Text } from 'react-native';

// Cache utilities
import { manageCacheSize, prefetchCommonImages } from './src/services/api';

// Import screens

// Onboarding
import SplashScreen from './src/screens/onboarding/SplashScreen';
import WelcomeScreen from './src/screens/onboarding/WelcomeScreen';

// Auth
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import OTPVerificationScreen from './src/screens/auth/OTPVerificationScreen';

// Feed
import FeedScreen from './src/screens/feed/FeedScreen';
import CreatePostScreen from './src/screens/feed/CreatePostScreen';

// Groups
import GroupsScreen from './src/screens/groups/GroupsScreen';
import GroupDetailScreen from './src/screens/groups/GroupDetailScreen';
import CreateGroupScreen from './src/screens/groups/CreateGroupScreen';
import MemberListScreen from './src/screens/groups/MemberListScreen';
import JoinRequestsScreen from './src/screens/groups/JoinRequestsScreen';
import GroupRulesScreen from './src/screens/groups/GroupRulesScreen';
import GroupPostsScreen from './src/screens/groups/GroupPostsScreen';

// Events
import EventsScreen from './src/screens/events/EventsScreen';
import EventDetailScreen from './src/screens/events/EventDetailScreen';

// Import custom bottom tab bar
import BottomTabBar from './src/components/BottomTabBar';

import ProfileScreen from './src/screens/profile/ProfileScreen';

// Location
import NearbyTemplesScreen from './src/screens/location/NearbyTemplesScreen';
import TempleDetailScreen from './src/screens/location/TempleDetailScreen'; 
import AdminTempleFormScreen from './src/screens/admin/AdminTempleFormScreen';

// Pandit
import PanditStackNavigator from './src/navigation/PanditStackNavigator';

// More Menu
const MoreScreen = ({ navigation }) => {
  // This is a simple placeholder component
  React.useEffect(() => {
    // Open the drawer immediately when this screen is focused
    if (navigation && navigation.navigate) {
      // Small delay to ensure navigation is ready
      setTimeout(() => {
        navigation.navigate('Nearby');
      }, 100);
    }
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>More Options</Text>
    </View>
  );
};

enableScreens();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Feed Stack Navigator
const FeedStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FeedScreen" component={FeedScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    </Stack.Navigator>
  );
};

// Groups Stack Navigator
const GroupsStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupsScreen" component={GroupsScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="MemberList" component={MemberListScreen} />
      <Stack.Screen name="JoinRequests" component={JoinRequestsScreen} />
      <Stack.Screen name="GroupRules" component={GroupRulesScreen} />
      <Stack.Screen name="GroupPosts" component={GroupPostsScreen} />
    </Stack.Navigator>
  );
};

const EventsStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsScreen" component={EventsScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
    </Stack.Navigator>
  );
};

const LocationStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NearbyTemples" component={NearbyTemplesScreen} />
      <Stack.Screen name="TempleDetail" component={TempleDetailScreen} />
      <Stack.Screen name="AdminTempleForm" component={AdminTempleFormScreen} />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabNavigator = () => {
  console.log('Rendering MainTabNavigator');
  try {
    return (
      <Tab.Navigator
        tabBar={props => {
          console.log('TabBar props:', props);
          return <BottomTabBar {...props} />;
        }}
        initialRouteName="Feed"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
        }}>
        <Tab.Screen name="Feed" component={FeedStackNavigator} />
        <Tab.Screen name="Events" component={EventsStackNavigator} />
        <Tab.Screen name="Groups" component={GroupsStackNavigator} />
        <Tab.Screen name="More" component={MoreScreen} />
        
        {/* These screens are accessed through the More menu */}
        <Tab.Screen 
          name="Nearby" 
          component={LocationStackNavigator} 
          options={{ tabBarButton: () => null }} 
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileStackNavigator} 
          options={{ tabBarButton: () => null }} 
        />
        <Tab.Screen 
          name="NearbyPandits" 
          component={PanditStackNavigator} 
          options={{ tabBarButton: () => null }} 
        />
      </Tab.Navigator>
    );
  } catch (error) {
    console.error('Error in MainTabNavigator:', error);
    return null;
  }
};

const App = () => {
  // Add useEffect for cache management
  useEffect(() => {
    // Manage cache size on app startup
    manageCacheSize().catch(error => {
      console.warn('Cache management error:', error);
    });

    // Optional: Prefetch common images 
    // This can include app logos, common UI elements, etc.
    prefetchCommonImages([
      // Add common image URLs here if you have any
      // Example: 'https://your-cloudfront-domain.com/common/logo.png'
    ]).catch(error => {
      console.warn('Image prefetch error:', error);
    });
    
    console.log('✅ Cache management initialized');
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}>
        {/* Auth & Onboarding Screens */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        
        {/* Main App (with Tab Navigation) */}
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;