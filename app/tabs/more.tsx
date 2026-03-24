import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, Linking } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useDB } from "@/context/DBContext";
import TitleBar from "@/components/TitleBar";
import ConfirmModal from "@/components/ConfirmModal";
import * as backupService from "@/services/backupService";
import { APP_VERSION, DEVELOPER_NAME, GITHUB_RELEASES_URL, GITHUB_REPO_NAME } from "@/constants";
import { appAlert } from "@/services/alertService";
import { checkForUpdates } from "@/services/updateService";
import { COLORS } from "@/constants";

export default function More() {
  const { fetchData } = useDB();
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
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
            await fetchData();
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
          await fetchData();
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

        {loading && (
          <Text className="text-center text-muted-foreground mt-6 text-sm">Processing...</Text>
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
    </SafeAreaView>
  );
}
