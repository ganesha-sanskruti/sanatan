// src/navigation/PanditStackNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

// Pandit Screens
import NearbyPanditsScreen from '../screens/location/NearbyPanditsScreen';
import PanditDetailScreen from '../screens/location/PanditDetailScreen';
import CreatePanditProfileScreen from '../screens/location/CreatePanditProfileScreen';

const Stack = createStackNavigator();

// Custom wrapper for PanditDetailScreen to ensure proper navigation
const PanditDetailWrapper = (props) => {
  const navigation = useNavigation();
  
  // Create enhanced props with a more direct goBack function
  const enhancedProps = {
    ...props,
    navigation: {
      ...navigation,
      goBack: () => {
        console.log("Direct navigation back to PanditsList");
        navigation.navigate("PanditsList");
      }
    }
  };
  
  return <PanditDetailScreen {...enhancedProps} />;
};

const PanditStackNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="PanditsList"
      screenOptions={{ 
        headerShown: false,
        detachPreviousScreen: false
      }}
    >
      <Stack.Screen 
        name="PanditsList" 
        component={NearbyPanditsScreen} 
      />
      <Stack.Screen 
        name="PanditDetail" 
        component={PanditDetailWrapper}
        options={{
          unmountOnBlur: true
        }}
      />
      <Stack.Screen 
        name="CreatePanditProfile" 
        component={CreatePanditProfileScreen} 
      />
    </Stack.Navigator>
  );
};

export default PanditStackNavigator;