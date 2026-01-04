import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

interface SaufeeIconProps {
  size?: number;
}

export default function SaufeeIcon({ size = 280 }: SaufeeIconProps) {
  const borderRadius = size * 0.22;
  const fontSize = size * 0.23;
  const letterSpacing = size * -0.007;
  const shadowOffset = size * 0.089;
  const shadowRadius = size * 0.179;
  const elevation = size * 0.089;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: shadowOffset },
        shadowOpacity: 0.15,
        shadowRadius,
        elevation,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Background gradient for depth */}
      <LinearGradient
        colors={['#ffffff', '#f5f5f5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />

      {/* Inner shadow effect for raised platform */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          borderRadius,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.05)',
        }}
      />

      {/* Gradient text using MaskedView */}
      <MaskedView
        maskElement={
          <Text
            style={{
              fontFamily: 'Inter-Bold',
              fontSize,
              fontWeight: '700',
              letterSpacing,
              backgroundColor: 'transparent',
              textAlign: 'center',
            }}
          >
            saufee
          </Text>
        }
      >
        <LinearGradient
          colors={['#FF6B35', '#FF8C5A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height: fontSize * 1.5,
            width: size,
          }}
        />
      </MaskedView>
    </View>
  );
}
