import { View, Text, StyleSheet } from 'react-native';
import { PRIMARY_ORANGE, BACKGROUND, TEXT_PRIMARY, SPACING_LARGE } from '../constants/theme';
import { APP_NAME } from '../constants/config';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to {APP_NAME}</Text>
      <Text style={styles.subtitle}>AI-Powered Routine Planner</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING_LARGE,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: PRIMARY_ORANGE,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
});
