import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';
import { register } from '../../services/api'; // Import the API function

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    try {
      console.log('Attempting Signup:', { 
        name, 
        phoneNumber,
        platform: Platform.OS
      });
      
      setLoading(true);
      
      const response = await register({ name, phoneNumber });
      
      console.log('Registration Response:', response);
      
      navigation.navigate('OTPVerification', { 
        phoneNumber,
        name,
        isLogin: false
      });
      
    } catch (error) {
      console.error('Full Registration Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      Alert.alert(
        'Registration Error', 
        `Error: ${error.message}\nDetails: ${JSON.stringify(error)}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={[commonStyles.container, commonStyles.screenPadding]}>
        {/* Header */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={typography.h2}>Create Account</Text>
          <Text style={[typography.body1, styles.subtitle]}>
            Join our spiritual community
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!loading}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={10}
            editable={!loading}
          />

          <TouchableOpacity
            style={[
              commonStyles.primaryButton, 
              styles.signupButton,
              loading && styles.disabledButton
            ]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={commonStyles.primaryButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={typography.body2}>Already have an account? </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={[
              styles.loginText,
              loading && styles.disabledText
            ]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginTop: spacing.m,
    padding: spacing.s,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text.primary,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  subtitle: {
    marginTop: spacing.s,
    color: colors.text.secondary,
  },
  form: {
    flex: 1,
  },
  label: {
    ...typography.subtitle2,
    marginBottom: spacing.xs,
  },
  input: {
    height: 50,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: spacing.m,
    fontSize: 16,
    marginBottom: spacing.l,
  },
  signupButton: {
    marginTop: spacing.m,
    height: 50,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  disabledText: {
    opacity: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  loginText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default SignupScreen;