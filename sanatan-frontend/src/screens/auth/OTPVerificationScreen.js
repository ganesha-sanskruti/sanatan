import React, { useState, useRef, useEffect } from 'react';
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
import { verifyOTP, resendOTP } from '../../services/api'; // Import API functions

const OTP_LENGTH = 4;

const OTPVerificationScreen = ({ navigation, route }) => {
  const { phoneNumber, name, isLogin } = route.params;
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value, index) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Auto verify when all digits are entered
    if (index === OTP_LENGTH - 1 && value) {
      const fullOtp = [...newOtp.slice(0, -1), value].join('');
      if (fullOtp.length === OTP_LENGTH) {
        verifyOtpWithAPI(fullOtp);
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const verifyOtpWithAPI = async (enteredOtp) => {
    try {
      setVerifying(true);
      
      // Call the API to verify OTP
      const response = await verifyOTP({ 
        phoneNumber,
        otp: enteredOtp
      });
      
      // If successful, navigate to main screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
      
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Error', error.message || 'Invalid OTP. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    try {
      // Reset OTP fields and timer
      setOtp(['', '', '', '']);
      setTimer(30);
      setCanResend(false);
      inputRefs.current[0].focus();
      
      // Call API to resend OTP
      await resendOTP({ phoneNumber });
      
      Alert.alert('Success', 'OTP resent successfully!');
    } catch (error) {
      console.error('Error resending OTP:', error);
      Alert.alert('Error', error.message || 'Failed to resend OTP. Please try again.');
      setCanResend(true);
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={[commonStyles.container, commonStyles.screenPadding]}>
        {/* Header */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={verifying}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={typography.h2}>Verify Phone</Text>
          <Text style={[typography.body1, styles.subtitle]}>
            Enter the 4-digit code sent to {phoneNumber}
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputRefs.current[index] = ref}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!verifying}
            />
          ))}
        </View>

        {/* Verification Status */}
        {verifying && (
          <View style={styles.verifyingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.verifyingText}>Verifying...</Text>
          </View>
        )}

        {/* Resend Timer */}
        <View style={styles.resendContainer}>
          <Text style={typography.body2}>
            {canResend ? 'Didn\'t receive code?' : `Resend code in ${timer}s`}
          </Text>
          {canResend && (
            <TouchableOpacity onPress={handleResendOtp} disabled={verifying}>
              <Text style={[styles.resendText, verifying && styles.disabledText]}>
                Resend OTP
              </Text>
            </TouchableOpacity>
          )}
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: colors.background.secondary,
  },
  verifyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
  },
  verifyingText: {
    ...typography.body2,
    marginLeft: spacing.s,
    color: colors.text.secondary,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.s,
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default OTPVerificationScreen;



