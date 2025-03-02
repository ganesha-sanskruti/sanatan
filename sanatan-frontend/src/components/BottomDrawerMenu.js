// src/components/BottomDrawerMenu.js
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { colors, typography, spacing } from '../styles/styles';

const { height } = Dimensions.get('window');

const BottomDrawerMenu = ({ isVisible, onClose, navigation }) => {
  const translateY = useRef(new Animated.Value(height)).current;
  
  useEffect(() => {
    if (isVisible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const handleMenuItemPress = (routeName) => {
    onClose();
    setTimeout(() => {
      navigation.navigate(routeName);
    }, 300); // Small delay to allow drawer to close
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.container,
                { transform: [{ translateY }] }
              ]}
            >
              <View style={styles.handle} />
              <Text style={styles.title}>More Options</Text>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuItemPress('Profile')}
              >
                <Text style={styles.icon}>👤</Text>
                <Text style={styles.menuText}>Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuItemPress('Nearby')}
              >
                <Text style={styles.icon}>🗺️</Text>
                <Text style={styles.menuText}>Nearby</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background.main,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.m,
    paddingBottom: spacing.xl * 2,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: spacing.m,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.m,
    color: colors.text.primary,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  icon: {
    fontSize: 24,
    marginRight: spacing.m,
  },
  menuText: {
    ...typography.body1,
    color: colors.text.primary,
  },
});

export default BottomDrawerMenu;