import { db } from "@/db";
import { usersTable, iouTransactions } from "@/db/schema";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { Platform } from "react-native";
import { BackupData } from "@/types/backup";
import { APP_VERSION } from "@/constants";
import { appAlert } from "@/services/alertService";
import { migrateToLatest } from "./backup/migrationEngine";

export async function createBackupPayload(): Promise<BackupData> {
  const usersData = await db.select().from(usersTable);
  const iouTxData = await db.select().from(iouTransactions);

  return {
    version: APP_VERSION,
    date: new Date().toISOString(),
    users: usersData,
    iouTransactions: iouTxData,
  };
}

export async function exportBackup(): Promise<void> {
  const backupData = await createBackupPayload();
  const jsonString = JSON.stringify(backupData, null, 2);

  if (Platform.OS === "android") {
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (permissions.granted) {
      const uri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        `iou_backup_v${APP_VERSION}_${new Date().toISOString().split("T")[0]}.json`,
        "application/json"
      );

      await FileSystem.writeAsStringAsync(uri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      appAlert("Success", "Backup saved successfully!");
    }
  } else {
    const fileUri =
      FileSystem.documentDirectory + `iou_backup_v${APP_VERSION}.json`;
    await FileSystem.writeAsStringAsync(fileUri, jsonString);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      appAlert("Error", "Sharing is not available on this device");
    }
  }
}

export async function parseBackupFile(): Promise<BackupData | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  const fileUri = result.assets[0].uri;
  const fileContent = await FileSystem.readAsStringAsync(fileUri);

  let rawData: any;
  try {
    rawData = JSON.parse(fileContent);
  } catch {
    throw new Error("Invalid JSON file");
  }

  if (!rawData.users || !rawData.iouTransactions) {
    throw new Error("Invalid backup file format");
  }

  return migrateToLatest(rawData);
}

export async function restoreBackup(data: BackupData): Promise<void> {
  await db.delete(iouTransactions).run();
  await db.delete(usersTable).run();

  if (data.users.length > 0) {
    await db.insert(usersTable).values(data.users).run();
  }
  if (data.iouTransactions.length > 0) {
    await db.insert(iouTransactions).values(data.iouTransactions).run();
  }
}

export async function wipeAllData(): Promise<void> {
  await db.delete(iouTransactions).run();
  await db.delete(usersTable).run();
}
