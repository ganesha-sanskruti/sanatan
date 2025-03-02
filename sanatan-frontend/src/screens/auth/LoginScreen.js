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
import { login } from '../../services/api'; // Import the API function

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Basic validation
   // if (!phoneNumber.trim() || phoneNumber.length < 10) { AT remove this after testing
      if (!phoneNumber.trim() || phoneNumber.length < 1) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    
    try {
      setLoading(true);
      
      // For testing purposes, bypass OTP validation for phone number '1111'
      if (phoneNumber === '1111') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
        return;
      }
      
      // Call the API login function
      await login({ phoneNumber });
      
      // Navigate to OTP screen
      navigation.navigate('OTPVerification', { 
        phoneNumber: phoneNumber,
        isLogin: true 
      });
      
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'Failed to login. Please try again.');
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
          <Text style={typography.h2}>Welcome Back</Text>
          <Text style={[typography.body1, styles.subtitle]}>
            Login with your phone number
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
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
              styles.loginButton,
              loading && styles.disabledButton
            ]}
            onPress={handleLogin}
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
          <Text style={typography.body2}>Don't have an account? </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Signup')}
            disabled={loading}
          >
            <Text style={[
              styles.signupText,
              loading && styles.disabledText
            ]}>Sign Up</Text>
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
  loginButton: {
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
  signupText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;






// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   SafeAreaView,
//   TextInput,
//   Alert,
//   StyleSheet,
//   ActivityIndicator,
// } from 'react-native';
// import { colors, typography, spacing, commonStyles } from '../../styles/styles';
// import { login } from '../../services/api'; // Import the API function

// const LoginScreen = ({ navigation }) => {
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     // Basic validation
//     if (!phoneNumber.trim() || phoneNumber.length < 10) {
//       Alert.alert('Error', 'Please enter a valid phone number');
//       return;
//     }
    
//     try {
//       setLoading(true);
      
//       // Call the API login function
//       await login({ phoneNumber });
      
//       // Navigate to OTP screen
//       navigation.navigate('OTPVerification', { 
//         phoneNumber: phoneNumber,
//         isLogin: true 
//       });
      
//     } catch (error) {
//       console.error('Login error:', error);
//       Alert.alert('Error', error.message || 'Failed to login. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={commonStyles.safeArea}>
//       <View style={[commonStyles.container, commonStyles.screenPadding]}>
//         {/* Header */}
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//           disabled={loading}
//         >
//           <Text style={styles.backButtonText}>←</Text>
//         </TouchableOpacity>

//         <View style={styles.header}>
//           <Text style={typography.h2}>Welcome Back</Text>
//           <Text style={[typography.body1, styles.subtitle]}>
//             Login with your phone number
//           </Text>
//         </View>

//         {/* Form */}
//         <View style={styles.form}>
//           <Text style={styles.label}>Phone Number</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter your phone number"
//             value={phoneNumber}
//             onChangeText={setPhoneNumber}
//             keyboardType="phone-pad"
//             maxLength={10}
//             editable={!loading}
//           />

//           <TouchableOpacity
//             style={[
//               commonStyles.primaryButton, 
//               styles.loginButton,
//               loading && styles.disabledButton
//             ]}
//             onPress={handleLogin}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator size="small" color="#ffffff" />
//             ) : (
//               <Text style={commonStyles.primaryButtonText}>Continue</Text>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Footer */}
//         <View style={styles.footer}>
//           <Text style={typography.body2}>Don't have an account? </Text>
//           <TouchableOpacity 
//             onPress={() => navigation.navigate('Signup')}
//             disabled={loading}
//           >
//             <Text style={[
//               styles.signupText,
//               loading && styles.disabledText
//             ]}>Sign Up</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   backButton: {
//     marginTop: spacing.m,
//     padding: spacing.s,
//   },
//   backButtonText: {
//     fontSize: 24,
//     color: colors.text.primary,
//   },
//   header: {
//     marginTop: spacing.xl,
//     marginBottom: spacing.xxl,
//   },
//   subtitle: {
//     marginTop: spacing.s,
//     color: colors.text.secondary,
//   },
//   form: {
//     flex: 1,
//   },
//   label: {
//     ...typography.subtitle2,
//     marginBottom: spacing.xs,
//   },
//   input: {
//     height: 50,
//     backgroundColor: colors.background.secondary,
//     borderRadius: 8,
//     paddingHorizontal: spacing.m,
//     fontSize: 16,
//     marginBottom: spacing.l,
//   },
//   loginButton: {
//     marginTop: spacing.m,
//     height: 50,
//     justifyContent: 'center',
//   },
//   disabledButton: {
//     opacity: 0.7,
//   },
//   disabledText: {
//     opacity: 0.5,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     paddingVertical: spacing.xl,
//   },
//   signupText: {
//     ...typography.body2,
//     color: colors.primary,
//     fontWeight: '600',
//   },
// });

// export default LoginScreen;