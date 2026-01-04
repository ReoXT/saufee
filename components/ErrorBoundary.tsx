import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AppState } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';

const PRIMARY_ORANGE = '#FF6B35';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';
const ERROR_RED = '#EF4444';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (in production, you'd send to error reporting service)
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // TODO: Send to Sentry or other error reporting service
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleRestart = () => {
    // Reset error state
    // In a real scenario, you might want to integrate with expo-updates
    // or use AppState to reload, but for now we'll just reset the error boundary
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <AlertCircle size={64} color={ERROR_RED} />
            </View>

            <Text style={styles.title}>Something went wrong</Text>

            <Text style={styles.description}>
              We're sorry for the inconvenience. The app encountered an unexpected error.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorText}>
                  {this.state.error.message}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleRestart}
              activeOpacity={0.8}
            >
              <RefreshCw size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Restart App</Text>
            </TouchableOpacity>

            <Text style={styles.supportText}>
              If this problem persists, please contact support at support@saufee.com
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: TEXT_PRIMARY,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: ERROR_RED,
    textAlign: 'left',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_ORANGE,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    shadowColor: PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 24,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  supportText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },
});
