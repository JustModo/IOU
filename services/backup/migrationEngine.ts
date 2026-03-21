import { BackupData } from "@/types/backup";
import { APP_VERSION } from "@/constants";
import { MIGRATIONS } from "./migrations";

export function detectVersion(raw: any): string {
  if (typeof raw.version === "string") return raw.version;
  if (typeof raw.appVersion === "string") return raw.appVersion;
  if (raw.users && raw.iouTransactions) return "1.0.0";
  throw new Error("Unrecognised backup format — cannot determine version.");
}

export function migrateToLatest(rawData: any): BackupData {
  let version = detectVersion(rawData);
  let data = { ...rawData };

  let idx = MIGRATIONS.findIndex((m) => m.fromVersion === version);

  while (idx !== -1 && idx < MIGRATIONS.length) {
    const migration = MIGRATIONS[idx];
    if (migration.fromVersion !== version) break;
    data = migration.migrate(data);
    version = migration.toVersion;
    idx++;
  }

  if (version !== APP_VERSION) {
    console.warn(
      `Backup migrated to ${version}, but current app is ${APP_VERSION}. Missing migrations may cause issues.`
    );
  }

  return data as BackupData;
}
