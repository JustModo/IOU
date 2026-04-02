import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { checkForUpdates } from "@/services/updateService";
import { COLORS } from "@/constants";

export default function Layout() {
  useEffect(() => {
    checkForUpdates(true);
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          borderColor: COLORS.border,
          height: 60,
          paddingTop: 6,
          paddingBottom: 6,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarActiveTintColor: COLORS.foreground,
        tabBarInactiveTintColor: COLORS.mutedForeground,
      }}
    >
      <Tabs.Screen
        name="iou"
        options={{
          title: "IOU",
          tabBarIcon: ({ color, size }) => {
            return <Feather name="credit-card" size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => {
            return <Feather name="home" size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          headerShown: false,
          title: "More",
          tabBarIcon: ({ color, size }) => {
            return <Feather name="more-horizontal" size={size} color={color} />;
          },
        }}
      />
    </Tabs>
  );
}
