import { Stack } from "expo-router";

export default function IOULayout() {
  return (
    <Stack>
      <Stack.Screen
        name="IOUHome"
        options={{ title: "IOU", headerShown: false }}
      />
    </Stack>
  );
}
