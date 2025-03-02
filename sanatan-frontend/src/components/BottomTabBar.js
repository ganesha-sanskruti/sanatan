// src/components/BottomTabBar.js
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { colors, typography, spacing, commonStyles } from '../styles/styles';

const BottomTabBar = ({ state, descriptors, navigation }) => {
  console.log('BottomTabBar rendering with state:', state);
  const [isMoreMenuVisible, setIsMoreMenuVisible] = useState(false);

  try {
    const getIcon = (routeName, isFocused) => {
      switch (routeName) {
        case 'Feed':
          return '🏠';
        case 'Events':
          return '📅';
        case 'Groups':
          return '👥';
        case 'More':
          return '⋮';
        default:
          return '📱';
      }
    };

    const showMoreMenu = () => {
      setIsMoreMenuVisible(true);
    };

    const hideMoreMenu = () => {
      setIsMoreMenuVisible(false);
    };

    const navigateToHiddenTab = (tabName) => {
      hideMoreMenu();
      navigation.navigate(tabName);
    };

    return (
      <>
        <View style={styles.container}>
          {state.routes.map((route, index) => {
            // Skip tabs that should be hidden from the tab bar
            if (route.name === 'Nearby' || route.name === 'Profile' || route.name === 'NearbyPandits') {
              return null;
            }

            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              if (route.name === 'More') {
                showMoreMenu();
                return;
              }

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={[
                  styles.tabButton,
                  isFocused && styles.focusedTab
                ]}
              >
                <Text style={[
                  styles.icon,
                  { color: isFocused ? colors.primary : colors.text.secondary }
                ]}>
                  {getIcon(route.name, isFocused)}
                </Text>
                <Text style={[
                  styles.tabText,
                  { color: isFocused ? colors.primary : colors.text.secondary }
                ]}>
                  {route.name}
                </Text>
                {isFocused && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* More Menu Modal */}
        <Modal
          visible={isMoreMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={hideMoreMenu}
        >
          <TouchableWithoutFeedback onPress={hideMoreMenu}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.handle} />
                <Text style={styles.menuTitle}>More Options</Text>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => navigateToHiddenTab('Profile')}
                >
                  <Text style={styles.menuIcon}>👤</Text>
                  <Text style={styles.menuText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => navigateToHiddenTab('Nearby')}
                >
                  <Text style={styles.menuIcon}>🗺️</Text>
                  <Text style={styles.menuText}>Nearby Temples</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => navigateToHiddenTab('NearbyPandits')}
                >
                  <Text style={styles.menuIcon}>🧑‍🏫</Text>
                  <Text style={styles.menuText}>Find Nearby Pandits</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </>
    );
  } catch (error) {
    console.error('Error in BottomTabBar:', error);
    return null;
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.main,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.s,
    paddingTop: spacing.xs,
    height: 65,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  focusedTab: {
    backgroundColor: colors.background.main,
  },
  icon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  tabText: {
    ...typography.body2,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -spacing.s,
    width: 40,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: spacing.xs / 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
  menuTitle: {
    ...typography.h3,
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: spacing.m,
  },
  menuText: {
    ...typography.body1,
  },
});

export default BottomTabBar;