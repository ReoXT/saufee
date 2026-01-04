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

export default function SignUpScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signUp } = useAuth();

  const handleSignUp = async () => {
    setError('');

    // Validation
    if (!displayName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (displayName.length < 2) {
      setError('Display name must be at least 2 characters');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);

    const { error: signUpError } = await signUp(email, password, displayName);

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigation is handled by the auth state listener in _layout
      // Could also navigate to onboarding here if needed
    }
  };

  const handleLoginPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
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
        <Text style={styles.tagline}>Create your account</Text>

        {/* Form */}
        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Display Name"
            placeholderTextColor={TEXT_SECONDARY}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            autoComplete="name"
            editable={!loading}
          />

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
              autoComplete="password-new"
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

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm Password"
              placeholderTextColor={TEXT_SECONDARY}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowConfirmPassword(!showConfirmPassword);
              }}
              disabled={loading}
            >
              {showConfirmPassword ? (
                <EyeOff size={18} color="#9CA3AF" />
              ) : (
                <Eye size={18} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>

          {/* Sign Up Button */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={PRIMARY_ORANGE} size="large" />
            </View>
          ) : (
            <AnimatedGradientButton
              onPress={handleSignUp}
              disabled={loading}
              style={styles.buttonContainer}
            >
              Create Account
            </AnimatedGradientButton>
          )}

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLoginPress} disabled={loading}>
              <Text style={styles.loginLink}>Login</Text>
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
    marginBottom: 40,
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
  buttonContainer: {
    marginTop: SPACING_LARGE,
  },
  loadingContainer: {
    marginTop: SPACING_LARGE,
    alignItems: 'center',
    paddingVertical: 18,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING_LARGE,
  },
  loginText: {
    color: TEXT_SECONDARY,
    fontSize: 16,
  },
  loginLink: {
    color: PRIMARY_ORANGE,
    fontSize: 16,
    fontWeight: '600',
  },
});
