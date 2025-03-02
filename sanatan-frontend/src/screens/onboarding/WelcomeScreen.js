import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';

const FeatureItem = ({ title, description }) => (
  <View style={styles.featureContainer}>
    <Text style={typography.subtitle1}>{title}</Text>
    <Text style={[typography.body2, styles.featureDescription]}>
      {description}
    </Text>
  </View>
);

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={[commonStyles.container, commonStyles.screenPadding]}>
        <View style={styles.headerContainer}>
          <Text style={[typography.h2, styles.headerText]}>
            Welcome to Sanatan
          </Text>
          <Text style={[typography.body1, styles.subheaderText]}>
            Connect with temples, join spiritual communities, and stay updated with events
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <FeatureItem
            title="Find Temples"
            description="Discover and connect with temples near you"
          />
          <FeatureItem
            title="Join Communities"
            description="Be part of spiritual groups and discussions"
          />
          <FeatureItem
            title="Attend Events"
            description="Stay updated with religious events and festivals"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[commonStyles.primaryButton, styles.signupButton]}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={commonStyles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={commonStyles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={commonStyles.secondaryButtonText}>
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  headerText: {
    textAlign: 'center',
  },
  subheaderText: {
    textAlign: 'center',
    marginTop: spacing.s,
    marginBottom: spacing.xl,
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  featureContainer: {
    marginBottom: spacing.l,
  },
  featureDescription: {
    marginTop: spacing.xs,
  },
  buttonContainer: {
    marginBottom: spacing.xl,
  },
  signupButton: {
    marginBottom: spacing.m,
  },
});

export default WelcomeScreen;