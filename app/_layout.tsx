import React from "react";
import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import "../global.css";
import { DBProvider } from "@/hooks/useDB";

export default function RootLayout() {
  SystemUI.setBackgroundColorAsync("black");

  return (
    <DBProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="tabs" />
        <Stack.Screen name="stack/user/[id]" />
      </Stack>
    </DBProvider>
  );
}
