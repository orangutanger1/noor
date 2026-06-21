import { Tabs } from "expo-router";
import { Home, Clock, Book, Heart, User } from "lucide-react-native";
import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isDark ? colors.surface : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color}>
              <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: "Prayer",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color}>
              <Clock size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: "Quran",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color}>
              <Book size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="duas"
        options={{
          title: "Duas",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color}>
              <Heart size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color}>
              <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ children, focused, color }: { children: React.ReactNode; focused: boolean; color: string }) {
  return (
    <View style={styles.iconContainer}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 32,
    position: 'relative',
  },
});
