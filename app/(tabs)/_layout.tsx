import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, useColorScheme, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import Colors from "@/constants/colors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "dice", selected: "dice.fill" }} />
        <Label>Generate</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="flow">
        <Icon sf={{ default: "arrow.triangle.branch", selected: "arrow.triangle.branch" }} />
        <Label>Flow</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="saved">
        <Icon sf={{ default: "bookmark", selected: "bookmark.fill" }} />
        <Label>Saved</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colorScheme = useColorScheme();
  const isDark = true;
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";
  const { palette } = Colors;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.amber,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : palette.midnight,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: palette.cardBorder,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.midnight }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Generate",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="dice-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="flow"
        options={{
          title: "Flow",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="git-merge-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
