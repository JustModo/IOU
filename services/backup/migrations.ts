export type BackupMigration = {
  fromVersion: string;
  toVersion: string;
  migrate: (data: any) => any;
};

// Ordered list — append new migrations at the end
export const MIGRATIONS: BackupMigration[] = [
  // 1.0.0 → 1.1.0: normalise legacy { appVersion, version: 1 } format
  {
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    migrate: (data: any) => {
      const { appVersion, ...rest } = data;
      return { ...rest, version: "1.1.0" };
    },
  },
];
