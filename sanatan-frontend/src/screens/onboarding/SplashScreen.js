import React, { useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Navigate after delay
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[commonStyles.container, commonStyles.centered]}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={[typography.h1, { color: colors.primary, marginBottom: spacing.s }]}>
          Sanatan
        </Text>
        <Text style={typography.subtitle2}>
          Connect with your spiritual community
        </Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;