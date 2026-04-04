import React from "react";
import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import "@/services/notifeeEvents";
import { DBProvider } from "@/context/DBContext";
import { COLORS } from "@/constants";

import { GlobalAlertProvider } from "@/components/GlobalAlertProvider";

export default function RootLayout() {
  SystemUI.setBackgroundColorAsync(COLORS.background);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GlobalAlertProvider>
          <DBProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "fade",
              }}
            >
              <Stack.Screen name="tabs" />
            </Stack>
          </DBProvider>
        </GlobalAlertProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
