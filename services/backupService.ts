import { db } from "@/db";
import { usersTable, iouTransactions } from "@/db/schema";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { Platform } from "react-native";
import {
  BackupData,
  BackupImportPayload,
} from "@/types/backup";
import { APP_VERSION } from "@/constants";
import { appAlert } from "@/services/alertService";
import { migrateToLatest } from "./backup/migrationEngine";
import { collectSections, applySectionsOnRestore } from "./backup/sections";
import {
  BACKUP_EXTENSION,
  isNewBackupPayload,
  normalizeSections,
} from "./backup/fileFormat";

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
  const sections = await collectSections(backupData);
  const backupPayload = {
    format: "iou-backup",
    version: APP_VERSION,
    date: backupData.date,
    data: backupData,
    sections,
  };
  const jsonString = JSON.stringify(backupPayload, null, 2);
  const datePart = new Date().toISOString().split("T")[0];

  if (Platform.OS === "android") {
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (permissions.granted) {
      const uri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        `iou_backup_v${APP_VERSION}_${datePart}.${BACKUP_EXTENSION}`,
        "application/octet-stream"
      );

      await FileSystem.writeAsStringAsync(uri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      appAlert("Success", "Backup saved successfully!");
    }
  } else {
    const fileUri =
      FileSystem.documentDirectory +
      `iou_backup_v${APP_VERSION}_${datePart}.${BACKUP_EXTENSION}`;
    await FileSystem.writeAsStringAsync(fileUri, jsonString);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      appAlert("Error", "Sharing is not available on this device");
    }
  }
}

export async function parseBackupFile(): Promise<BackupImportPayload | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "application/octet-stream", "text/plain"],
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  const fileUri = result.assets[0].uri;
  const fileContent = await FileSystem.readAsStringAsync(fileUri);

  let rawData: any;
  try {
    rawData = JSON.parse(fileContent);
  } catch {
    throw new Error("Invalid backup file");
  }

  if (isNewBackupPayload(rawData)) {
    return {
      data: migrateToLatest(rawData.data),
      sections: normalizeSections(rawData),
    };
  }

  if (!rawData.users || !rawData.iouTransactions) {
    throw new Error("Invalid backup file format");
  }

  return {
    data: migrateToLatest(rawData),
    sections: {},
  };
}

export async function restoreBackup(payload: BackupImportPayload): Promise<void> {
  const restoredData = await applySectionsOnRestore(
    payload.data,
    payload.sections
  );

  await db.delete(iouTransactions).run();
  await db.delete(usersTable).run();

  if (restoredData.users.length > 0) {
    await db.insert(usersTable).values(restoredData.users).run();
  }
  if (restoredData.iouTransactions.length > 0) {
    await db.insert(iouTransactions).values(restoredData.iouTransactions).run();
  }
}

export async function wipeAllData(): Promise<void> {
  await db.delete(iouTransactions).run();
  await db.delete(usersTable).run();
}
