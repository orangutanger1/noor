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
      <Stack.Screen name="welcome" />
      <Stack.Screen name="location" />
      <Stack.Screen name="calculation" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="ready" />
    </Stack>
  );
}
