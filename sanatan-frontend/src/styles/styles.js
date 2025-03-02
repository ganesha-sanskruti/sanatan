// src/styles/styles.js
import { StyleSheet } from 'react-native';

// Color palette
export const colors = {
  primary: '#FF9933', // Saffron color - spiritual & cultural significance
  secondary: '#138808', // Green from flag
  background: {
    main: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#EEEEEE',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    tertiary: '#999999',
  },
  border: '#EEEEEE',
  success: '#4CAF50',
  error: '#FF5252',
  warning: '#FFC107',
  info: '#2196F3',
};

// Typography
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  subtitle1: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: 0.15,
  },
  subtitle2: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
    letterSpacing: 0.1,
  },
  body1: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  body2: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  caption: {
    fontSize: 12,
    color: colors.text.tertiary,
    letterSpacing: 0.4,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1.25,
    textTransform: 'uppercase',
  },
};

// Spacing
export const spacing = {
  xs: 4,   // Extra small
  s: 8,    // Small
  m: 16,   // Medium
  l: 24,   // Large
  xl: 32,  // Extra large
  xxl: 40, // Extra extra large
};

// Border Radius
export const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  round: 999, // For circular elements
};

// Shadows
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 6,
  },
};

// Common styles
export const commonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenPadding: {
    padding: spacing.m,
  },

  // Button styles
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    ...shadows.small,
  },
  secondaryButton: {
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    ...typography.button,
    color: colors.background.main,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
  },

  // Input styles
  input: {
    height: 48,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.m,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputLabel: {
    ...typography.subtitle2,
    marginBottom: spacing.xs,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: spacing.m,
  },

  // Card styles
  card: {
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    marginVertical: spacing.s,
    ...shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  cardTitle: {
    ...typography.subtitle1,
  },

  // List styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listItemText: {
    ...typography.body1,
    flex: 1,
  },

  // Badge styles
  badge: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
  },
  badgeText: {
    ...typography.caption,
    color: colors.background.main,
  },

  // Layout helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Loading state
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Error styles
  error: {
    color: colors.error,
    ...typography.caption,
    marginTop: spacing.xs,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background.main,
  },
  headerTitle: {
    ...typography.h2,
    flex: 1,
  },

  // Image styles
  roundImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  
  // Avatar styles
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
  },
  
  // Tab styles
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.main,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.m,
  },
  
  // Form styles
  formGroup: {
    marginBottom: spacing.l,
  },
  formLabel: {
    ...typography.subtitle2,
    marginBottom: spacing.xs,
  },
  formError: {
    color: colors.error,
    ...typography.caption,
    marginTop: spacing.xs,
  },
});

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  commonStyles,
};