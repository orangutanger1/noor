import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { AppProvider } from "@/providers/AppProvider";
import { OnboardingProvider, useOnboarding } from "@/providers/OnboardingProvider";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";
import { RevenueCatProvider } from "@/providers/RevenueCatProvider";
import { RamadanProvider } from "@/providers/RamadanProvider";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isOnboardingComplete, isLoading: onboardingLoading } = useOnboarding();
  const { colors, isLoading: themeLoading } = useTheme();

  const isLoading = onboardingLoading || themeLoading;

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = segments[0] === "(onboarding)";

    if (!isOnboardingComplete && !inOnboarding) {
      // Not completed onboarding and not on onboarding screens - redirect to onboarding
      router.replace("/(onboarding)/splash");
    } else if (isOnboardingComplete && inOnboarding) {
      // Completed onboarding but still on onboarding screens - redirect to main app
      router.replace("/(tabs)");
    }
  }, [isOnboardingComplete, isLoading, segments]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.cream }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      initialRouteName={isOnboardingComplete ? "(tabs)" : "(onboarding)"}
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.ivory,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="(onboarding)"
        options={{
          headerShown: false,
          animation: "fade",
        }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="paywall"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="modal"
        options={{
          presentation: "modal",
          title: "Settings",
        }}
      />
      <Stack.Screen
        name="surah/[id]"
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="ramadan"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <RevenueCatProvider>
            <OnboardingProvider>
              <AppProvider>
                <RamadanProvider>
                  <RootLayoutNav />
                </RamadanProvider>
              </AppProvider>
            </OnboardingProvider>
          </RevenueCatProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.cream,
  },
});
