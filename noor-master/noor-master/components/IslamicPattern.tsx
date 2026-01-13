import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import Colors from '@/constants/colors';

interface IslamicPatternProps {
  size?: number;
  color?: string;
  opacity?: number;
}

export const IslamicStar: React.FC<IslamicPatternProps> = ({ 
  size = 40, 
  color = Colors.light.gold,
  opacity = 0.15 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G opacity={opacity}>
        <Path
          d="M50 0 L61 35 L97 35 L68 57 L79 91 L50 70 L21 91 L32 57 L3 35 L39 35 Z"
          fill={color}
        />
      </G>
    </Svg>
  );
};

export const GeometricBorder: React.FC<{ width: number; color?: string }> = ({ 
  width, 
  color = Colors.light.gold 
}) => {
  return (
    <View style={[styles.border, { width, borderColor: color }]}>
      <View style={[styles.borderInner, { borderColor: color }]} />
    </View>
  );
};

export const AyahSeparator: React.FC<{ color?: string }> = ({ color = Colors.light.gold }) => {
  return (
    <View style={styles.separatorContainer}>
      <View style={[styles.separatorLine, { backgroundColor: color }]} />
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="8" fill={color} opacity={0.3} />
        <Circle cx="12" cy="12" r="4" fill={color} opacity={0.6} />
        <Circle cx="12" cy="12" r="2" fill={color} />
      </Svg>
      <View style={[styles.separatorLine, { backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  border: {
    height: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  borderInner: {
    width: '60%',
    height: 1,
    borderTopWidth: 1,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  separatorLine: {
    height: 1,
    flex: 1,
    opacity: 0.3,
  },
});
