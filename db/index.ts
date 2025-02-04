import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../drizzle/migrations";

// Open database connection
const expo = openDatabaseSync("db.db", { enableChangeListener: true });
export const db = drizzle(expo);

export function useDBMigrations() {
  return useMigrations(db, migrations);
}
