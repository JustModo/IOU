import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function IOULayout() {
  return (
    <Stack>
      <Stack.Screen
        name="MoreHome"
        options={{ title: "More", headerShown: false }}
      />
    </Stack>
  );
}
