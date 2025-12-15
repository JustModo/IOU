import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Alert, ScrollView, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { db } from "@/db";
import { usersTable, iouTransactions, billTable, billTransactions } from "@/db/schema";
import { sql } from "drizzle-orm";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useDB } from "@/context/DBContext";
import TitleBar from "@/components/TitleBar";
import ConfirmModal from "@/components/ConfirmModal";

export default function More() {
  const { fetchData } = useDB();
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
      title: "",
      message: "",
      onConfirm: async () => {},
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
      const usersData = await db.select().from(usersTable);
      const iouTxData = await db.select().from(iouTransactions);
      const billsData = await db.select().from(billTable);
      const billTxData = await db.select().from(billTransactions);

      const backupData = {
        users: usersData,
        iouTransactions: iouTxData,
        bills: billsData,
        billTransactions: billTxData,
        version: 1,
        date: new Date().toISOString(),
      };

      const jsonString = JSON.stringify(backupData, null, 2);

      if (Platform.OS === "android") {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        
        if (permissions.granted) {
          const uri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            "iou_backup.json",
            "application/json"
          );
          
          await FileSystem.writeAsStringAsync(uri, jsonString, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          Alert.alert("Success", "Backup saved successfully!");
        } else {
            // User cancelled permission
        }
      } else {
        // Fallback for iOS / other platforms
        const fileUri = FileSystem.documentDirectory + "iou_backup.json";
        await FileSystem.writeAsStringAsync(fileUri, jsonString);

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
        } else {
             Alert.alert("Error", "Sharing is not available on this device");
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      
      let data: any;
      try {
          data = JSON.parse(fileContent);
      } catch (e) {
          Alert.alert("Error", "Invalid JSON file");
          return;
      }

      if (!data.users || !data.iouTransactions || !data.bills || !data.billTransactions) {
        Alert.alert("Error", "Invalid backup file format");
        return;
      }

      showConfirm(
          "Confirm Restore",
          "This will overwrite all current data. Are you sure?",
          async () => {
              try {
                setLoading(true);
                // Wipe existing data
                await db.delete(billTransactions).run();
                await db.delete(billTable).run();
                await db.delete(iouTransactions).run();
                await db.delete(usersTable).run();

                // Insert new data
                if (data.users.length > 0) await db.insert(usersTable).values(data.users).run();
                if (data.iouTransactions.length > 0) await db.insert(iouTransactions).values(data.iouTransactions).run();
                if (data.bills.length > 0) await db.insert(billTable).values(data.bills).run();
                if (data.billTransactions.length > 0) await db.insert(billTransactions).values(data.billTransactions).run();
                
                await fetchData();
                setModalVisible(false);
                Alert.alert("Success", "Data restored successfully");
              } catch (e) {
                console.error(e);
                Alert.alert("Error", "Failed to restore data");
              } finally {
                setLoading(false);
              }
          },
          "Restore"
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to import file");
    }
  };

  const handleWipe = () => {
    showConfirm(
        "Confirm Wipe",
        "Are you sure you want to delete ALL data? This action cannot be undone.",
        async () => {
            try {
              setLoading(true);
              await db.delete(billTransactions).run();
              await db.delete(billTable).run();
              await db.delete(iouTransactions).run();
              await db.delete(usersTable).run();
              await fetchData();
              setModalVisible(false);
              Alert.alert("Success", "App data wiped successfully");
            } catch (e) {
              console.error(e);
              Alert.alert("Error", "Failed to wipe data");
            } finally {
              setLoading(false);
            }
        },
        "Delete All"
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
           <TitleBar

        title="MORE"
      >

      </TitleBar>

      <ScrollView className="flex-1 p-4">
        <Text className="text-gray-500 text-sm font-semibold mb-4 ml-2 uppercase">Data Management</Text>
        
        <View className="bg-[#121317] rounded-xl overflow-hidden mb-8">
          <TouchableOpacity 
            className="flex-row items-center p-4 border-b border-gray-800 active:bg-gray-900"
            onPress={handleExport}
            disabled={loading}
          >
            <View className="w-10 h-10 rounded-full bg-blue-900/30 items-center justify-center mr-4">
               <Feather name="upload" size={20} color="#60a5fa" />
            </View>
            <View className="flex-1">
                <Text className="text-white text-lg font-medium">Backup Data</Text>
                <Text className="text-gray-400 text-sm">Export your data to a JSON file</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center p-4 active:bg-gray-900"
            onPress={handleImport}
            disabled={loading}
          >
            <View className="w-10 h-10 rounded-full bg-green-900/30 items-center justify-center mr-4">
               <Feather name="download" size={20} color="#4ade80" />
            </View>
            <View className="flex-1">
                <Text className="text-white text-lg font-medium">Restore Data</Text>
                <Text className="text-gray-400 text-sm">Import data from a backup file</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <Text className="text-gray-500 text-sm font-semibold mb-4 ml-2 uppercase">Danger Zone</Text>
        
        <View className="bg-[#121317] rounded-xl overflow-hidden mb-8">
            <TouchableOpacity 
                className="flex-row items-center p-4 active:bg-gray-900"
                onPress={handleWipe}
                disabled={loading}
            >
                <View className="w-10 h-10 rounded-full bg-red-900/30 items-center justify-center mr-4">
                <Feather name="trash-2" size={20} color="#f87171" />
                </View>
                <View className="flex-1">
                    <Text className="text-red-400 text-lg font-medium">Wipe All Data</Text>
                    <Text className="text-gray-400 text-sm">Permanently delete all app data</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
        </View>

        {loading && (
            <Text className="text-center text-gray-500 mt-4">Processing...</Text>
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
