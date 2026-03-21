import React from "react";
import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import "../global.css";
import { DBProvider } from "@/context/DBContext";

import { GlobalAlertProvider } from "@/components/GlobalAlertProvider";

export default function RootLayout() {
  SystemUI.setBackgroundColorAsync("black");

  return (
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
  );
}
