import { Text, TextStyle } from 'react-native';

/**
 * Saufee Logo Component
 *
 * A bold statement logo with heavy weight and tight letter spacing.
 *
 * CUSTOMIZATION:
 * - size: Controls the font size (default: 90)
 * - style: Override any text styles
 *
 * To make it bolder: Change fontFamily to 'Inter-Black'
 * To adjust spacing: Modify letterSpacing (negative = tighter, positive = wider)
 * To change color: Modify color value
 */

interface SaufeeLogoProps {
  size?: number;
  style?: TextStyle;
}

export default function SaufeeLogo({
  size = 90,
  style
}: SaufeeLogoProps) {
  return (
    <Text
      style={[
        {
          // Font settings - Inter-Black is the heaviest weight
          fontFamily: 'Inter-Black',
          fontSize: size,
          fontWeight: '900',

          // Brand color - Saufee orange
          color: '#FF6B35',

          // Tight letter spacing for bold statement look
          letterSpacing: -3,

          // Line height matches font size for proper vertical alignment
          lineHeight: size * 1.1,
        },
        style,
      ]}
    >
      saufee
    </Text>
  );
}
