import { Stack } from "expo-router";
import Colors from "@/constants/colors";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: Colors.light.cream },
      }}
    >
      {/* Splash Animation */}
      <Stack.Screen name="splash" options={{ animation: 'fade' }} />

      {/* Welcome & Credibility */}
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="features" />
      <Stack.Screen name="stats" />

      {/* User Profile */}
      <Stack.Screen name="name" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="age" />
      <Stack.Screen name="motivation" />
      <Stack.Screen name="lifestage" />

      {/* Inspirational Transition */}
      <Stack.Screen name="quote1" />

      {/* Qibla Compass Calibration */}
      <Stack.Screen name="compass" />

      {/* Spiritual Journey */}
      <Stack.Screen name="experience" />
      <Stack.Screen name="commitment" />

      {/* Personalized Transition */}
      <Stack.Screen name="quote2" />

      {/* Review */}
      <Stack.Screen name="review" />

      {/* App Setup */}
      <Stack.Screen name="location" />
      <Stack.Screen name="calculation" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="ready" />
    </Stack>
  );
}
