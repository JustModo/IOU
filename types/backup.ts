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
