import { User } from "./user";
import { IOUTransaction } from "./transaction";

/**
 * The canonical backup payload shape (current version).
 * `version` is always the APP_VERSION semver string that produced the backup.
 */
export type BackupData = {
  version: string;
  date: string;
  users: User[];
  iouTransactions: IOUTransaction[];
};

export type BackupImageAsset = {
  fileName: string;
  mimeType: string;
  dataBase64: string;
};

export type BackupSections = {
  profilePictures?: Record<string, BackupImageAsset>;
  [key: string]: unknown;
};

export type BackupFilePayload = {
  format: "iou-backup";
  version: string;
  date: string;
  data: BackupData;
  sections: BackupSections;
  profilePictures?: Record<string, BackupImageAsset>;
};

export type BackupImportPayload = {
  data: BackupData;
  sections: BackupSections;
};
