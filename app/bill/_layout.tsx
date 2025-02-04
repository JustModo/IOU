import { Stack } from "expo-router";

export default function IOULayout() {
  return (
    <Stack>
      <Stack.Screen
        name="BillHome"
        options={{ title: "IOU", headerShown: false }}
      />
    </Stack>
  );
}
