import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { G, Path } from 'react-native-svg';

export default function SplashScreen() {
  const router = useRouter();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const raysOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate logo entrance
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animate rays appearing
      Animated.timing(raysOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Wait a moment, then fade out and navigate
        setTimeout(() => {
          Animated.timing(containerOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            router.replace('/(onboarding)/welcome');
          });
        }, 800);
      });
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        {/* Background squircle */}
        <View style={styles.logoBackground}>
          {/* Rays container with separate opacity */}
          <Animated.View style={[styles.raysContainer, { opacity: raysOpacity }]}>
            <Svg width={160} height={160} viewBox="0 0 512 512" fill="none">
              <G transform="translate(256, 256)">
                {/* Ray 1 (Top - 0 degrees) */}
                <Path
                  d="M0 -45 C 25 -45 50 -80 50 -130 C 50 -180 0 -210 0 -210 C 0 -210 -50 -180 -50 -130 C -50 -80 -25 -45 0 -45 Z"
                  fill="#FFFFFF"
                />
                {/* Ray 2 (72 degrees) */}
                <G transform="rotate(72)">
                  <Path
                    d="M0 -45 C 25 -45 50 -80 50 -130 C 50 -180 0 -210 0 -210 C 0 -210 -50 -180 -50 -130 C -50 -80 -25 -45 0 -45 Z"
                    fill="#FFFFFF"
                  />
                </G>
                {/* Ray 3 (144 degrees) */}
                <G transform="rotate(144)">
                  <Path
                    d="M0 -45 C 25 -45 50 -80 50 -130 C 50 -180 0 -210 0 -210 C 0 -210 -50 -180 -50 -130 C -50 -80 -25 -45 0 -45 Z"
                    fill="#FFFFFF"
                  />
                </G>
                {/* Ray 4 (216 degrees) */}
                <G transform="rotate(216)">
                  <Path
                    d="M0 -45 C 25 -45 50 -80 50 -130 C 50 -180 0 -210 0 -210 C 0 -210 -50 -180 -50 -130 C -50 -80 -25 -45 0 -45 Z"
                    fill="#FFFFFF"
                  />
                </G>
                {/* Ray 5 (288 degrees) */}
                <G transform="rotate(288)">
                  <Path
                    d="M0 -45 C 25 -45 50 -80 50 -130 C 50 -180 0 -210 0 -210 C 0 -210 -50 -180 -50 -130 C -50 -80 -25 -45 0 -45 Z"
                    fill="#FFFFFF"
                  />
                </G>
              </G>
            </Svg>
          </Animated.View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004D40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    width: 160,
    height: 160,
    borderRadius: 36,
    backgroundColor: '#004D40',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  raysContainer: {
    position: 'absolute',
  },
});
