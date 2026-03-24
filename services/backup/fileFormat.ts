import { BackupFilePayload, BackupSections } from "@/types/backup";

export const BACKUP_EXTENSION = "ioubackup";

export function isNewBackupPayload(raw: any): raw is BackupFilePayload {
  return raw?.format === "iou-backup" && !!raw?.data;
}

export function normalizeSections(raw: BackupFilePayload): BackupSections {
  const baseSections = raw.sections ?? {};
  const legacyProfilePictures = raw.profilePictures;
  if (legacyProfilePictures && !baseSections.profilePictures) {
    return {
      ...baseSections,
      profilePictures: legacyProfilePictures,
    };
  }
  return baseSections;
}
