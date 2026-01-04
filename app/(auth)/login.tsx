import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../../lib/contexts/AuthContext';
import SaufeeLogo from '../../components/SaufeeLogo';
import AnimatedGradientButton from '../../components/AnimatedGradientButton';
import {
  PRIMARY_ORANGE,
  WHITE,
  BACKGROUND,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  ERROR_RED,
  BORDER_RADIUS,
  SPACING_LARGE,
  SPACING_MEDIUM,
} from '../../constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { signIn } = useAuth();

  const handleLogin = async () => {
    setError('');

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigation is handled by the auth state listener in _layout
    }
  };

  const handleSignUpPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/signup');
  };

  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Reset Password',
      'Password reset feature coming soon! Please contact support if you need assistance.',
      [{ text: 'OK' }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <SaufeeLogo size={70} />
        </View>
        <Text style={styles.tagline}>AI-Powered Routine Planner</Text>

        {/* Form */}
        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={TEXT_SECONDARY}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor={TEXT_SECONDARY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowPassword(!showPassword);
              }}
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff size={18} color="#9CA3AF" />
              ) : (
                <Eye size={18} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPasswordContainer}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={PRIMARY_ORANGE} size="large" />
            </View>
          ) : (
            <AnimatedGradientButton
              onPress={handleLogin}
              disabled={loading}
              style={styles.buttonContainer}
            >
              Login
            </AnimatedGradientButton>
          )}

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUpPress} disabled={loading}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING_LARGE,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 50,
  },
  formContainer: {
    gap: SPACING_MEDIUM,
  },
  input: {
    backgroundColor: WHITE,
    borderRadius: BORDER_RADIUS,
    padding: 18,
    fontSize: 16,
    color: TEXT_PRIMARY,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    backgroundColor: WHITE,
    borderRadius: BORDER_RADIUS,
    padding: 18,
    paddingRight: 55,
    fontSize: 16,
    color: TEXT_PRIMARY,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 18,
    bottom: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: ERROR_RED,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotPasswordText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: SPACING_LARGE,
  },
  loadingContainer: {
    marginTop: SPACING_LARGE,
    alignItems: 'center',
    paddingVertical: 18,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING_LARGE,
  },
  signupText: {
    color: TEXT_SECONDARY,
    fontSize: 16,
  },
  signupLink: {
    color: PRIMARY_ORANGE,
    fontSize: 16,
    fontWeight: '600',
  },
});
