import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, Linking, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import notifee, { AndroidNotificationSetting, AuthorizationStatus } from "@notifee/react-native";
import { COLORS } from "@/constants";

type AndroidReminderSetupState = {
  notificationPermissionGranted: boolean;
  exactAlarmAllowed: boolean;
  batteryOptimizationEnabled: boolean | null;
  hasDevicePowerManagerSettings: boolean;
};

const REMINDER_CHANNEL_ID = "debt-reminders";

function toReadable(value: boolean | null, trueText: string, falseText: string): string {
  if (value === null) return "Unknown";
  return value ? trueText : falseText;
}

export default function AndroidReminderSetupScreen() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<AndroidReminderSetupState | null>(null);

  const loadState = async () => {
    if (Platform.OS !== "android") {
      return;
    }

    setBusy(true);
    try {
      const settings = await notifee.getNotificationSettings();
      const batteryOptimizationEnabled = await notifee.isBatteryOptimizationEnabled().catch(() => null);
      const powerManagerInfo = await notifee.getPowerManagerInfo().catch(() => ({ activity: null }));

      setState({
        notificationPermissionGranted:
          settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED,
        exactAlarmAllowed: settings.android.alarm !== AndroidNotificationSetting.DISABLED,
        batteryOptimizationEnabled,
        hasDevicePowerManagerSettings: Boolean(powerManagerInfo.activity),
      });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void loadState();
  }, []);

  const openNotificationSettings = async () => {
    try {
      await notifee.openNotificationSettings(REMINDER_CHANNEL_ID);
    } catch {
      await Linking.openSettings();
    }
  };

  const openExactAlarmSettings = async () => {
    try {
      await notifee.openAlarmPermissionSettings();
    } catch {
      await Linking.openSettings();
    }
  };

  const openBatteryOptimizationSettings = async () => {
    try {
      await notifee.openBatteryOptimizationSettings();
    } catch {
      await Linking.openSettings();
    }
  };

  const openDevicePowerManagerSettings = async () => {
    try {
      await notifee.openPowerManagerSettings();
    } catch {
      await Linking.openSettings();
    }
  };

  if (Platform.OS !== "android") {
    return (
      <SafeAreaView className="bg-background flex-1">
        <View className="w-full h-16 bg-background border-b border-border flex-row items-center px-4">
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
            <AntDesign name="left" size={24} color={COLORS.foreground} />
            <Text className="text-foreground font-semibold text-[15px]">Back</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-foreground text-lg font-semibold">Android only</Text>
          <Text className="text-muted-foreground text-center mt-2">
            This setup page is only needed on Android devices.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      <View className="w-full h-16 bg-background border-b border-border flex-row items-center px-4 justify-between">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
          <AntDesign name="left" size={24} color={COLORS.foreground} />
          <Text className="text-foreground font-semibold text-[15px]">Back</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={loadState} disabled={busy} className="px-3 py-2 border border-input">
          <Text className="text-foreground text-xs font-medium tracking-widest uppercase">
            {busy ? "Checking" : "Refresh"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text className="text-foreground text-[22px] font-bold tracking-wide">Fix Reminder Issues</Text>
        <Text className="text-muted-foreground text-[14px] mt-1 leading-5">
          Keep reminders reliable by allowing notifications, exact alarms, and disabling battery restrictions for this app.
        </Text>

        <View className="mt-5 gap-3">
          <View className="border border-input p-4">
            <Text className="text-foreground text-[15px] font-medium">Notifications</Text>
            <Text className="text-subtle text-xs mt-1">
              Status: {state ? (state.notificationPermissionGranted ? "Allowed" : "Blocked") : "Unknown"}
            </Text>
            <Text className="text-muted-foreground text-xs mt-2 leading-5">
              Must be allowed so reminders can appear.
            </Text>
            <TouchableOpacity className="mt-3 py-3 border border-input items-center" onPress={openNotificationSettings}>
              <Text className="text-foreground font-medium text-[14px]">Open Notification Settings</Text>
            </TouchableOpacity>
          </View>

          <View className="border border-input p-4">
            <Text className="text-foreground text-[15px] font-medium">Exact alarms</Text>
            <Text className="text-subtle text-xs mt-1">
              Status: {state ? (state.exactAlarmAllowed ? "Allowed" : "Restricted") : "Unknown"}
            </Text>
            <Text className="text-muted-foreground text-xs mt-2 leading-5">
              Improves reliability for scheduled reminders.
            </Text>
            <TouchableOpacity className="mt-3 py-3 border border-input items-center" onPress={openExactAlarmSettings}>
              <Text className="text-foreground font-medium text-[14px]">Open Exact Alarm Settings</Text>
            </TouchableOpacity>
          </View>

          <View className="border border-input p-4">
            <Text className="text-foreground text-[15px] font-medium">Battery optimization</Text>
            <Text className="text-subtle text-xs mt-1">
              Status: {toReadable(
                state?.batteryOptimizationEnabled ?? null,
                "Enabled (can delay reminders)",
                "Disabled"
              )}
            </Text>
            <Text className="text-muted-foreground text-xs mt-2 leading-5">
              Disable optimization for this app to reduce delayed notifications.
            </Text>
            <TouchableOpacity className="mt-3 py-3 border border-input items-center" onPress={openBatteryOptimizationSettings}>
              <Text className="text-foreground font-medium text-[14px]">Open Battery Optimization</Text>
            </TouchableOpacity>
          </View>

          {state?.hasDevicePowerManagerSettings && (
            <View className="border border-input p-4">
              <Text className="text-foreground text-[15px] font-medium">Device power manager</Text>
              <Text className="text-muted-foreground text-xs mt-2 leading-5">
                Some manufacturers add extra background limits here.
              </Text>
              <TouchableOpacity className="mt-3 py-3 border border-input items-center" onPress={openDevicePowerManagerSettings}>
                <Text className="text-foreground font-medium text-[14px]">Open Device Power Manager</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
