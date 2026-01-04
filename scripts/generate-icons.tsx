/**
 * App Icon Generation Script
 *
 * This script generates app icons at various sizes required for iOS and Android.
 * Run this with: npx expo start and navigate to this screen in the app,
 * or use a React Native screenshot library to capture the icons programmatically.
 *
 * Required sizes:
 * - iOS: 1024x1024, 180x180, 120x120, 76x76
 * - Android: 512x512, 192x192, 96x96, 72x72, 48x48
 *
 * For production:
 * 1. Use this component to render each icon size
 * 2. Take screenshots or use react-native-view-shot
 * 3. Save to assets/icon-{size}.png
 * 4. Update app.json to reference the 1024x1024 icon
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SaufeeIcon from '../components/SaufeeIcon';
import { BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY } from '../constants/theme';

const ICON_SIZES = [
  { size: 1024, name: 'iOS App Store' },
  { size: 512, name: 'Android Play Store' },
  { size: 192, name: 'Android xxxhdpi' },
  { size: 180, name: 'iOS iPhone 3x' },
  { size: 120, name: 'iOS iPhone 2x' },
  { size: 96, name: 'Android xxhdpi' },
  { size: 76, name: 'iOS iPad' },
  { size: 72, name: 'Android xhdpi' },
  { size: 48, name: 'Android mdpi' },
];

export default function IconGeneratorScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>App Icon Generator</Text>
      <Text style={styles.subtitle}>
        Use screenshot tools to capture each icon at the specified size
      </Text>

      {ICON_SIZES.map(({ size, name }) => (
        <View key={size} style={styles.iconContainer}>
          <View style={[styles.iconWrapper, { width: size, height: size }]}>
            <SaufeeIcon size={size} />
          </View>
          <Text style={styles.iconLabel}>
            {size}x{size}px - {name}
          </Text>
          <Text style={styles.iconFilename}>
            Save as: icon-{size}.png
          </Text>
        </View>
      ))}

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Instructions:</Text>
        <Text style={styles.instructionsText}>
          1. Use react-native-view-shot or screenshot tools to capture each icon
          {'\n'}
          2. Save to assets/ folder with the specified filename
          {'\n'}
          3. Update app.json "icon" field to point to icon-1024.png
          {'\n'}
          4. For iOS, ensure icon has no transparency
          {'\n'}
          5. For Android adaptive icon, create separate foreground/background layers
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 30,
    textAlign: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrapper: {
    marginBottom: 12,
    // Add border to see icon boundaries
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  iconLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  iconFilename: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontFamily: 'monospace',
  },
  instructionsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
});
