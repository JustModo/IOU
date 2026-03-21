import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { checkForUpdates } from "@/services/updateService";

export default function Layout() {
  useEffect(() => {
    checkForUpdates(true);
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#121317",
          borderColor: "#1E1E1E",
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 14,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#aaa",
      }}
    >
      <Tabs.Screen
        name="iou"
        options={{
          title: "IOU",
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <MaterialCommunityIcons
                name="cash-multiple"
                size={size}
                color={color}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          headerShown: false,
          title: "More",
          tabBarIcon: ({ focused, color, size }) => {
            return <Feather name="more-horizontal" size={size} color={color} />;
          },
        }}
      />
    </Tabs>
  );
}
