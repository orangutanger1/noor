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
      {/* Welcome & Credibility */}
      <Stack.Screen name="welcome" />
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

      {/* Spiritual Journey */}
      <Stack.Screen name="experience" />
      <Stack.Screen name="commitment" />

      {/* Personalized Transition */}
      <Stack.Screen name="quote2" />

      {/* App Setup */}
      <Stack.Screen name="location" />
      <Stack.Screen name="calculation" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="ready" />
    </Stack>
  );
}
