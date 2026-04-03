import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, Linking } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useDB } from "@/context/DBContext";
import TitleBar from "@/components/TitleBar";
import ConfirmModal from "@/components/ConfirmModal";
import * as backupService from "@/services/backupService";
import {
  DEFAULT_REMINDER_SETTINGS,
  getReminderSettings,
  refreshReminderSchedule,
  updateReminderSettings,
} from "@/services/notificationService";
import { ReminderSettings } from "@/types/reminder";
import { APP_VERSION, DEVELOPER_NAME, GITHUB_RELEASES_URL, GITHUB_REPO_NAME } from "@/constants";
import { appAlert } from "@/services/alertService";
import { checkForUpdates } from "@/services/updateService";
import { COLORS } from "@/constants";
import { runDevNotificationTriggerFlow } from "@/services/devScripts";

type IntervalUnit = "days" | "hours";

type IntervalParts = {
  days: number;
  hours: number;
};

const MAX_INTERVAL_HOURS = 24 * 30;

function clampIntervalHours(totalHours: number): number {
  return Math.min(MAX_INTERVAL_HOURS, Math.max(1, Math.round(totalHours)));
}

function intervalPartsFromHours(intervalHours: number): IntervalParts {
  const totalHours = clampIntervalHours(intervalHours);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  return { days, hours };
}

function intervalHoursFromParts(parts: IntervalParts): number {
  const totalHours = Math.max(0, Math.round(parts.days)) * 24 + Math.max(0, Math.round(parts.hours));
  return clampIntervalHours(totalHours);
}

function formatIntervalHoursHuman(intervalHours: number): string {
  const parts = intervalPartsFromHours(intervalHours);
  const labels: string[] = [];

  if (parts.days > 0) {
    labels.push(`${parts.days} day${parts.days === 1 ? "" : "s"}`);
  }

  if (parts.hours > 0) {
    labels.push(`${parts.hours} hour${parts.hours === 1 ? "" : "s"}`);
  }

  if (!labels.length) return "1 hour";

  return labels.join(" ");
}

export default function More() {
  const { users, fetchData } = useDB();
  const [loading, setLoading] = useState(false);
  const [reminderBusy, setReminderBusy] = useState(false);
  const [devScriptBusy, setDevScriptBusy] = useState(false);
  const [reminderSettings, setReminderSettings] =
    useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [intervalModalVisible, setIntervalModalVisible] = useState(false);
  const [intervalDraft, setIntervalDraft] = useState<IntervalParts>(
    intervalPartsFromHours(DEFAULT_REMINDER_SETTINGS.intervalHours)
  );
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    onConfirm: async () => { },
    confirmText: "Confirm",
    variant: "danger" as "danger" | "default"
  });

  const showConfirm = (title: string, message: string, onConfirm: () => Promise<void>, confirmText = "Confirm", variant: "danger" | "default" = "danger") => {
    setModalConfig({ title, message, onConfirm, confirmText, variant });
    setModalVisible(true);
  };

  useEffect(() => {
    let mounted = true;

    const loadReminderSettings = async () => {
      const settings = await getReminderSettings();
      if (mounted) {
        setReminderSettings(settings);
      }
    };

    void loadReminderSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const applyReminderSettings = async (partial: Partial<ReminderSettings>) => {
    const optimistic = { ...reminderSettings, ...partial };
    setReminderSettings(optimistic);
    setReminderBusy(true);

    try {
      const saved = await updateReminderSettings(partial, users);
      setReminderSettings(saved);
    } catch (error) {
      console.error(error);
      appAlert("Error", "Failed to update reminder settings");
      const reloaded = await getReminderSettings();
      setReminderSettings(reloaded);
    } finally {
      setReminderBusy(false);
    }
  };

  const handleOpenIntervalModal = () => {
    setIntervalDraft(intervalPartsFromHours(reminderSettings.intervalHours));
    setIntervalModalVisible(true);
  };

  const handleIntervalChange = (unit: IntervalUnit, delta: number) => {
    setIntervalDraft((current) => {
      const updated = {
        ...current,
        [unit]: Math.max(0, current[unit] + delta),
      };

      return intervalPartsFromHours(intervalHoursFromParts(updated));
    });
  };

  const handleSaveInterval = async () => {
    await applyReminderSettings({ intervalHours: intervalHoursFromParts(intervalDraft) });
    setIntervalModalVisible(false);
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      await backupService.exportBackup();
    } catch (error) {
      console.error(error);
      appAlert("Error", "Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      const data = await backupService.parseBackupFile();
      if (!data) return; // User cancelled

      showConfirm(
        "Confirm Restore",
        "This will overwrite all current data. Are you sure?",
        async () => {
          try {
            setLoading(true);
            await backupService.restoreBackup(data);
            const updatedUsers = await fetchData();
            await refreshReminderSchedule(updatedUsers);
            setModalVisible(false);
            appAlert("Success", "Data restored successfully");
          } catch (e) {
            console.error(e);
            appAlert("Error", "Failed to restore data");
          } finally {
            setLoading(false);
          }
        },
        "Restore"
      );
    } catch (error: any) {
      console.error(error);
      appAlert("Error", error?.message || "Failed to import file");
    }
  };

  const handleWipe = () => {
    showConfirm(
      "Confirm Wipe",
      "Are you sure you want to delete ALL data? This action cannot be undone.",
      async () => {
        try {
          setLoading(true);
          await backupService.wipeAllData();
          const updatedUsers = await fetchData();
          await refreshReminderSchedule(updatedUsers);
          setModalVisible(false);
          appAlert("Success", "App data wiped successfully");
        } catch (e) {
          console.error(e);
          appAlert("Error", "Failed to wipe data");
        } finally {
          setLoading(false);
        }
      },
      "Delete All"
    );
  };

  const handleRunDevNotificationFlow = async () => {
    try {
      setDevScriptBusy(true);
      const alert = await runDevNotificationTriggerFlow(users);
      appAlert(alert.title, alert.message);
    } catch (error) {
      console.error(error);
      appAlert("Error", "Failed to run dev notification script");
    } finally {
      setDevScriptBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TitleBar title="Settings" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mt-6 mb-2">
          <Image source={require("@/assets/images/icon.png")} className="w-24 h-24 rounded-3xl" />
        </View>

        <Text className="text-subtle text-[10px] font-bold tracking-widest mb-1 mt-6 px-4 uppercase">Reminders</Text>

        <View className="border-t border-b border-border">
          <TouchableOpacity
            className="flex-row items-center p-3 active:bg-muted"
            onPress={() => applyReminderSettings({ enabled: !reminderSettings.enabled })}
            disabled={reminderBusy}
          >
            <Feather
              name={reminderSettings.enabled ? "bell" : "bell-off"}
              size={20}
              color={COLORS.foreground}
              className="mr-2 ml-1"
            />
            <View className="flex-1 ml-2">
              <Text className="text-foreground text-[15px] font-medium">Debt Reminders</Text>
              <Text className="text-subtle text-xs mt-0.5">
                {reminderSettings.enabled
                  ? `Enabled`
                  : "Disabled"}
              </Text>
            </View>
            <Text
              className="text-xs tracking-widest uppercase"
              style={{ color: reminderSettings.enabled ? COLORS.foreground : COLORS.mutedForeground }}
            >
              {reminderSettings.enabled ? "On" : "Off"}
            </Text>
          </TouchableOpacity>

          {reminderSettings.enabled && (
            <>
              <View className="h-[1px] bg-border ml-11" />

              <TouchableOpacity
                className="flex-row items-center p-3 active:bg-muted"
                onPress={handleOpenIntervalModal}
                disabled={reminderBusy}
              >
                <Feather name="clock" size={20} color={COLORS.foreground} className="mr-2 ml-1" />
                <View className="flex-1 ml-2">
                  <Text className="text-foreground text-[15px] font-medium">Reminder Interval</Text>
                  <Text className="text-subtle text-xs mt-0.5">
                    Every {formatIntervalHoursHuman(reminderSettings.intervalHours)}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={COLORS.subtle} />
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text className="text-subtle text-[10px] font-bold tracking-widest mb-1 mt-6 px-4 uppercase">Data & Storage</Text>
        
        <View className="border-t border-b border-border">
          <TouchableOpacity
            className="flex-row items-center p-3 active:bg-muted"
            onPress={handleExport}
            disabled={loading}
          >
            <Feather name="upload" size={20} color={COLORS.foreground} className="mr-2 ml-1" />
            <View className="flex-1 ml-2">
              <Text className="text-foreground text-[15px] font-medium">Backup Data</Text>
              <Text className="text-subtle text-xs mt-0.5">Export to JSON file</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={COLORS.subtle} />
          </TouchableOpacity>

          <View className="h-[1px] bg-border ml-11" />

          <TouchableOpacity
            className="flex-row items-center p-3 active:bg-muted"
            onPress={handleImport}
            disabled={loading}
          >
            <Feather name="download" size={20} color={COLORS.foreground} className="mr-2 ml-1" />
            <View className="flex-1 ml-2">
              <Text className="text-foreground text-[15px] font-medium">Restore Data</Text>
              <Text className="text-subtle text-xs mt-0.5">Import from backup</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={COLORS.subtle} />
          </TouchableOpacity>
        </View>

        <Text className="text-subtle text-[10px] font-bold tracking-widest mb-1 mt-6 px-4 uppercase">Danger Zone</Text>
        
        <View className="border-t border-b border-border">
          <TouchableOpacity
            className="flex-row items-center p-3 active:bg-muted"
            onPress={handleWipe}
            disabled={loading}
          >
            <Feather name="trash-2" size={20} color={COLORS.destructive} className="mr-2 ml-1" />
            <View className="flex-1 ml-2">
              <Text className="text-destructive text-[15px] font-medium">Wipe All Data</Text>
              <Text className="text-subtle text-xs mt-0.5">Permanently delete everything</Text>
            </View>
          </TouchableOpacity>
        </View>

        {__DEV__ && (
          <>
            <Text className="text-subtle text-[10px] font-bold tracking-widest mb-1 mt-6 px-4 uppercase">Dev Tools</Text>

            <View className="border-t border-b border-border">
              {/* Dev script row: comment out this TouchableOpacity block to disable from More screen. */}
              <TouchableOpacity
                className="flex-row items-center p-3 active:bg-muted"
                onPress={handleRunDevNotificationFlow}
                disabled={devScriptBusy}
              >
                <Feather name="tool" size={20} color={COLORS.foreground} className="mr-2 ml-1" />
                <View className="flex-1 ml-2">
                  <Text className="text-foreground text-[15px] font-medium">Run Notification Dev Flow</Text>
                  <Text className="text-subtle text-xs mt-0.5">Manually executes notification trigger flow</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={COLORS.subtle} />
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text className="text-subtle text-[10px] font-bold tracking-widest mb-1 mt-6 px-4 uppercase">About</Text>
        
        <View className="border-t border-border bg-background">
          <View className="flex-row justify-between items-center p-3">
            <Text className="text-foreground text-[15px] ml-1">Developer</Text>
            <Text className="text-muted-foreground text-[15px]">{DEVELOPER_NAME}</Text>
          </View>
          <TouchableOpacity 
            className="flex-row justify-between items-center p-3 active:bg-muted"
            onPress={() => Linking.openURL(GITHUB_RELEASES_URL)}
          >
            <Text className="text-foreground text-[15px] ml-1">GitHub</Text>
            <View className="flex-row items-center">
              <Text className="text-link text-[15px] mr-1">{GITHUB_REPO_NAME}</Text>
              <Feather name="external-link" size={14} color={COLORS.link} />
            </View>
          </TouchableOpacity>
          <View className="flex-row justify-between items-center p-3">
            <Text className="text-foreground text-[15px] ml-1">Version</Text>
            <Text className="text-muted-foreground text-[15px]">{APP_VERSION}</Text>
          </View>
          <TouchableOpacity 
            className="flex-row justify-between items-center p-3 active:bg-muted"
            onPress={() => checkForUpdates(false)}
          >
            <Text className="text-foreground text-[15px] ml-1">Check For Updates</Text>
            <MaterialIcons name="autorenew" size={20} color={COLORS.subtle} />
          </TouchableOpacity>
        </View>

        {(loading || reminderBusy || devScriptBusy) && (
          <Text className="text-center text-muted-foreground mt-6 text-sm">
            {loading ? "Processing..." : reminderBusy ? "Updating reminders..." : "Running dev script..."}
          </Text>
        )}
      </ScrollView>

      <ConfirmModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalVisible(false)}
        confirmText={modalConfig.confirmText}
        variant={modalConfig.variant}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={intervalModalVisible}
        onRequestClose={() => setIntervalModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center px-4" style={{ backgroundColor: COLORS.overlay }}>
          <View className="bg-background p-6 w-full max-w-sm border border-input">
            <Text className="text-foreground text-[17px] font-bold text-center tracking-widest uppercase">
              Reminder Interval
            </Text>
            <Text className="text-muted-foreground text-center text-[14px] leading-5 mt-2">
              Pick days and hours, then save.
            </Text>

            <View className="flex-row mt-5 gap-3">
              {[
                { key: "days" as const, label: "Days", value: intervalDraft.days },
                { key: "hours" as const, label: "Hours", value: intervalDraft.hours },
              ].map((item) => (
                <View key={item.key} className="flex-1 border border-input">
                  <Text className="text-subtle text-xs text-center py-2 tracking-widest uppercase">
                    {item.label}
                  </Text>
                  <View className="h-[1px] bg-border" />
                  <View className="flex-row items-center h-12">
                    <TouchableOpacity
                      className="w-12 h-12 items-center justify-center border-r border-input active:bg-muted"
                      onPress={() => handleIntervalChange(item.key, -1)}
                      disabled={reminderBusy}
                    >
                      <Feather name="minus" size={16} color={COLORS.foreground} />
                    </TouchableOpacity>

                    <View className="flex-1 items-center justify-center">
                      <Text className="text-foreground text-base font-semibold">{item.value}</Text>
                    </View>

                    <TouchableOpacity
                      className="w-12 h-12 items-center justify-center border-l border-input active:bg-muted"
                      onPress={() => handleIntervalChange(item.key, 1)}
                      disabled={reminderBusy}
                    >
                      <Feather name="plus" size={16} color={COLORS.foreground} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <Text className="text-subtle text-center text-xs mt-4">
              Current: {formatIntervalHoursHuman(intervalHoursFromParts(intervalDraft))}
            </Text>

            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity
                className="flex-1 py-3 border border-input items-center"
                onPress={() => setIntervalModalVisible(false)}
                disabled={reminderBusy}
              >
                <Text className="text-foreground font-medium text-[15px]">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3 items-center bg-foreground"
                onPress={handleSaveInterval}
                disabled={reminderBusy}
              >
                <Text className="font-medium text-[15px] text-background">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
