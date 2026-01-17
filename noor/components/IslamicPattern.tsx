import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, G, Defs, RadialGradient, Stop, Line, Polygon } from 'react-native-svg';
import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PatternProps {
  size?: number;
  color?: string;
  opacity?: number;
}

/**
 * Eight-Pointed Star (Rub el Hizb)
 * A fundamental Islamic geometric pattern symbolizing the eightfold path
 */
export const IslamicStar: React.FC<PatternProps> = ({
  size = 40,
  color = Colors.light.gold,
  opacity = 0.15,
}) => {
  // Create an 8-pointed star with overlapping squares
  const center = size / 2;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.2;

  const createStarPath = () => {
    const points: string[] = [];
    for (let i = 0; i < 8; i++) {
      const outerAngle = (i * 45 - 90) * (Math.PI / 180);
      const innerAngle = ((i * 45 + 22.5) - 90) * (Math.PI / 180);

      const outerX = center + outerRadius * Math.cos(outerAngle);
      const outerY = center + outerRadius * Math.sin(outerAngle);
      const innerX = center + innerRadius * Math.cos(innerAngle);
      const innerY = center + innerRadius * Math.sin(innerAngle);

      if (i === 0) {
        points.push(`M ${outerX} ${outerY}`);
      } else {
        points.push(`L ${outerX} ${outerY}`);
      }
      points.push(`L ${innerX} ${innerY}`);
    }
    points.push('Z');
    return points.join(' ');
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id="starGradient" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity={opacity * 1.5} />
          <Stop offset="100%" stopColor={color} stopOpacity={opacity * 0.5} />
        </RadialGradient>
      </Defs>
      <G>
        <Path d={createStarPath()} fill="url(#starGradient)" />
        <Circle cx={center} cy={center} r={size * 0.08} fill={color} opacity={opacity * 2} />
      </G>
    </Svg>
  );
};

/**
 * Geometric Border with Interlocking Pattern
 * Inspired by traditional Islamic woodwork and tilework
 */
export const GeometricBorder: React.FC<{ width: number; color?: string; height?: number }> = ({
  width,
  color = Colors.light.gold,
  height = 6,
}) => {
  const patternWidth = 24;
  const repeatCount = Math.ceil(width / patternWidth);

  return (
    <View style={[styles.geometricBorderContainer, { width }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <RadialGradient id="borderGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={0.8} />
            <Stop offset="100%" stopColor={color} stopOpacity={0.4} />
          </RadialGradient>
        </Defs>
        {/* Top line */}
        <Line x1="0" y1="0.5" x2={width} y2="0.5" stroke={color} strokeWidth="1" opacity={0.3} />
        {/* Bottom line */}
        <Line x1="0" y1={height - 0.5} x2={width} y2={height - 0.5} stroke={color} strokeWidth="1" opacity={0.3} />
        {/* Diamond pattern */}
        {Array.from({ length: repeatCount }).map((_, i) => {
          const x = i * patternWidth + patternWidth / 2;
          return (
            <G key={i}>
              <Polygon
                points={`${x},1 ${x + 4},${height / 2} ${x},${height - 1} ${x - 4},${height / 2}`}
                fill={color}
                opacity={0.2}
              />
              <Circle cx={x} cy={height / 2} r={1.5} fill={color} opacity={0.4} />
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

/**
 * Ayah Separator - Ornate divider for Quranic content
 * Features concentric circles with radiating lines
 */
export const AyahSeparator: React.FC<{ color?: string; width?: number }> = ({
  color = Colors.light.gold,
  width = SCREEN_WIDTH - 48,
}) => {
  const centerSize = 32;

  return (
    <View style={[styles.separatorContainer, { width }]}>
      <View style={[styles.separatorLine, { backgroundColor: color }]} />
      <View style={styles.separatorCenter}>
        <Svg width={centerSize} height={centerSize} viewBox={`0 0 ${centerSize} ${centerSize}`}>
          <Defs>
            <RadialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={color} stopOpacity={1} />
              <Stop offset="70%" stopColor={color} stopOpacity={0.5} />
              <Stop offset="100%" stopColor={color} stopOpacity={0.1} />
            </RadialGradient>
          </Defs>
          {/* Outer glow ring */}
          <Circle cx={16} cy={16} r={14} fill="none" stroke={color} strokeWidth={0.5} opacity={0.2} />
          {/* Middle ring */}
          <Circle cx={16} cy={16} r={10} fill="none" stroke={color} strokeWidth={0.5} opacity={0.3} />
          {/* Inner filled circle with gradient */}
          <Circle cx={16} cy={16} r={6} fill="url(#centerGradient)" />
          {/* Center dot */}
          <Circle cx={16} cy={16} r={2} fill={color} />
          {/* Radiating lines */}
          {[0, 45, 90, 135].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 16 + 7 * Math.cos(rad);
            const y1 = 16 + 7 * Math.sin(rad);
            const x2 = 16 + 13 * Math.cos(rad);
            const y2 = 16 + 13 * Math.sin(rad);
            return (
              <Line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={0.5}
                opacity={0.3}
              />
            );
          })}
        </Svg>
      </View>
      <View style={[styles.separatorLine, { backgroundColor: color }]} />
    </View>
  );
};

/**
 * Decorative Corner Ornament
 * For card corners and frame decorations
 */
export const CornerOrnament: React.FC<PatternProps & { rotation?: number }> = ({
  size = 32,
  color = Colors.light.gold,
  opacity = 0.3,
  rotation = 0,
}) => {
  return (
    <View style={{ transform: [{ rotate: `${rotation}deg` }] }}>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <G opacity={opacity}>
          {/* Main curved flourish */}
          <Path
            d="M2 30 Q2 2, 30 2"
            fill="none"
            stroke={color}
            strokeWidth={1.5}
          />
          {/* Inner curve */}
          <Path
            d="M6 26 Q6 6, 26 6"
            fill="none"
            stroke={color}
            strokeWidth={1}
            opacity={0.6}
          />
          {/* Corner dot */}
          <Circle cx={4} cy={28} r={2} fill={color} />
          {/* Decorative elements */}
          <Circle cx={10} cy={22} r={1} fill={color} opacity={0.5} />
          <Circle cx={22} cy={10} r={1} fill={color} opacity={0.5} />
        </G>
      </Svg>
    </View>
  );
};

/**
 * Crescent Moon with Star
 * Classic Islamic symbol for headers
 */
export const CrescentStar: React.FC<PatternProps> = ({
  size = 48,
  color = Colors.light.gold,
  opacity = 1,
}) => {
  const scale = size / 48;

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <RadialGradient id="crescentGradient" cx="30%" cy="30%" r="70%">
          <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
          <Stop offset="100%" stopColor={color} stopOpacity={opacity * 0.7} />
        </RadialGradient>
      </Defs>
      <G>
        {/* Crescent moon */}
        <Path
          d="M24 4 C12 4, 4 14, 4 24 C4 34, 12 44, 24 44 C16 40, 12 32, 12 24 C12 16, 16 8, 24 4 Z"
          fill="url(#crescentGradient)"
        />
        {/* Star */}
        <Path
          d="M32 12 L33.5 17 L38.5 17 L34.5 20 L36 25 L32 22 L28 25 L29.5 20 L25.5 17 L30.5 17 Z"
          fill={color}
          opacity={opacity}
        />
      </G>
    </Svg>
  );
};

/**
 * Geometric Pattern Background
 * Subtle tessellating pattern for backgrounds
 */
export const PatternBackground: React.FC<{
  width: number;
  height: number;
  color?: string;
  opacity?: number;
  density?: 'low' | 'medium' | 'high';
}> = ({
  width,
  height,
  color = Colors.light.gold,
  opacity = 0.05,
  density = 'medium',
}) => {
  const spacing = density === 'low' ? 60 : density === 'medium' ? 40 : 24;
  const starSize = density === 'low' ? 16 : density === 'medium' ? 12 : 8;

  const cols = Math.ceil(width / spacing) + 1;
  const rows = Math.ceil(height / spacing) + 1;

  return (
    <View style={[styles.patternBackground, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height}>
        {Array.from({ length: rows }).map((_, row) =>
          Array.from({ length: cols }).map((_, col) => {
            const x = col * spacing + (row % 2 === 0 ? 0 : spacing / 2);
            const y = row * spacing;
            const starOpacity = opacity * (0.5 + Math.random() * 0.5);

            return (
              <G key={`${row}-${col}`} transform={`translate(${x}, ${y})`}>
                <IslamicStarSVG size={starSize} color={color} opacity={starOpacity} />
              </G>
            );
          })
        )}
      </Svg>
    </View>
  );
};

// Helper component for SVG-only star (used in PatternBackground)
const IslamicStarSVG: React.FC<PatternProps> = ({ size = 12, color = Colors.light.gold, opacity = 0.1 }) => {
  const center = size / 2;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.2;

  const createStarPath = () => {
    const points: string[] = [];
    for (let i = 0; i < 8; i++) {
      const outerAngle = (i * 45 - 90) * (Math.PI / 180);
      const innerAngle = ((i * 45 + 22.5) - 90) * (Math.PI / 180);

      const outerX = center + outerRadius * Math.cos(outerAngle);
      const outerY = center + outerRadius * Math.sin(outerAngle);
      const innerX = center + innerRadius * Math.cos(innerAngle);
      const innerY = center + innerRadius * Math.sin(innerAngle);

      if (i === 0) {
        points.push(`M ${outerX} ${outerY}`);
      } else {
        points.push(`L ${outerX} ${outerY}`);
      }
      points.push(`L ${innerX} ${innerY}`);
    }
    points.push('Z');
    return points.join(' ');
  };

  return (
    <Path d={createStarPath()} fill={color} opacity={opacity} />
  );
};

/**
 * Decorative Verse Number
 * Ornate circular frame for ayah numbers
 */
export const VerseNumber: React.FC<{
  number: number;
  size?: number;
  color?: string;
}> = ({ number, size = 28, color = Colors.light.gold }) => {
  return (
    <View style={[styles.verseNumberContainer, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 28 28">
        {/* Outer decorative ring */}
        <Circle cx={14} cy={14} r={12} fill="none" stroke={color} strokeWidth={1} opacity={0.3} />
        {/* Inner ring */}
        <Circle cx={14} cy={14} r={9} fill="none" stroke={color} strokeWidth={0.5} opacity={0.5} />
        {/* Points at cardinal directions */}
        {[0, 90, 180, 270].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x = 14 + 12 * Math.cos(rad);
          const y = 14 + 12 * Math.sin(rad);
          return <Circle key={angle} cx={x} cy={y} r={1.5} fill={color} opacity={0.4} />;
        })}
      </Svg>
      <View style={styles.verseNumberTextContainer}>
        {/* The number text should be rendered outside SVG for proper font rendering */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  geometricBorderContainer: {
    overflow: 'hidden',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  separatorLine: {
    height: 1,
    flex: 1,
    opacity: 0.2,
  },
  separatorCenter: {
    marginHorizontal: 16,
  },
  patternBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  verseNumberContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseNumberTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
