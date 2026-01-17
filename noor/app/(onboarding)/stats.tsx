import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star, Users, Globe } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';

const { width } = Dimensions.get('window');

const STATS = [
  {
    icon: Users,
    value: '100K+',
    label: 'Muslims use Noor daily',
  },
  {
    icon: Globe,
    value: '150+',
    label: 'Countries worldwide',
  },
  {
    icon: Star,
    value: '4.9',
    label: 'Average app rating',
  },
];

export default function StatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const statAnims = useRef(STATS.map(() => new Animated.Value(0))).current;
  const quoteAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.stagger(150, [
        ...statAnims.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          })
        ),
        Animated.timing(quoteAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const handleContinue = () => {
    router.push('/(onboarding)/name');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />

      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.arabicText}>ٱلْحَمْدُ لِلَّٰهِ</Text>
          <Text style={styles.title}>Trusted by Muslims{'\n'}around the world</Text>
        </Animated.View>

        <View style={styles.statsContainer}>
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Animated.View
                key={index}
                style={[
                  styles.statCard,
                  {
                    opacity: statAnims[index],
                    transform: [{
                      scale: statAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    }],
                  },
                ]}
              >
                <View style={styles.statIconWrapper}>
                  <Icon size={20} color={Colors.light.gold} strokeWidth={1.5} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View
          style={[
            styles.quoteContainer,
            {
              opacity: quoteAnim,
              transform: [{
                translateY: quoteAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            },
          ]}
        >
          <View style={styles.quoteMark}>
            <Text style={styles.quoteMarkText}>"</Text>
          </View>
          <Text style={styles.quoteText}>
            The best among you are those who learn the Quran and teach it.
          </Text>
          <Text style={styles.quoteSource}>— Prophet Muhammad ﷺ (Bukhari)</Text>
        </Animated.View>

        <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
          <OnboardingButton
            title="Continue"
            onPress={handleContinue}
          />
          <OnboardingProgress currentStep={2} totalSteps={16} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  arabicText: {
    fontSize: 24,
    color: Colors.light.gold,
    marginBottom: 16,
    letterSpacing: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: '300',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  quoteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  quoteMark: {
    marginBottom: 8,
  },
  quoteMarkText: {
    fontSize: 48,
    color: Colors.light.gold,
    opacity: 0.5,
    fontFamily: 'serif',
    lineHeight: 48,
  },
  quoteText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 28,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  quoteSource: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  bottomSection: {
    paddingTop: 20,
  },
});
