import * as FileSystem from "expo-file-system";
import * as Notifications from "expo-notifications";
import notifee, {
  AndroidStyle,
  AuthorizationStatus,
  AndroidNotificationSetting,
  TriggerType,
  type TimestampTrigger,
} from "@notifee/react-native";
import { Image, Platform } from "react-native";
import { ReminderMessage } from "@/types/reminder";
import { User } from "@/types/user";
import { ReminderCandidate, ReminderSettings } from "@/types/reminder";
import { parseUserAmount } from "@/utils";
import { createReminderMessage } from "@/services/reminderTemplates";

const REMINDER_SETTINGS_FILE = `${FileSystem.documentDirectory}reminder-settings.json`;
const REMINDER_IDS_FILE = `${FileSystem.documentDirectory}reminder-scheduled-ids.json`;
const REMINDER_CHANNEL_ID = "debt-reminders";
const APP_ICON_URI = Image.resolveAssetSource(require("../assets/images/icon.png"))?.uri;

const MIN_INTERVAL_HOURS = 1 / 3600;
const MAX_INTERVAL_HOURS = 24 * 30;

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: false,
  intervalHours: 72,
  scheduleAheadCount: 18,
};

export type ReminderEnablementCheckResult = {
  permissionGranted: boolean;
  needsExactAlarmSettings: boolean;
};

type ScheduledReminderState = {
  ids: string[];
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

async function readJsonFile<T>(fileUri: string, fallback: T): Promise<T> {
  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    if (!info.exists) return fallback;
    const content = await FileSystem.readAsStringAsync(fileUri);
    return (JSON.parse(content) as T) ?? fallback;
  } catch {
    return fallback;
  }
}

async function writeJsonFile(fileUri: string, value: unknown): Promise<void> {
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(value));
}

function normalizeSettings(raw?: Partial<ReminderSettings>): ReminderSettings {
  const intervalHours = Number(raw?.intervalHours ?? DEFAULT_REMINDER_SETTINGS.intervalHours);
  const scheduleAheadCount = Number(
    raw?.scheduleAheadCount ?? DEFAULT_REMINDER_SETTINGS.scheduleAheadCount
  );

  return {
    enabled: Boolean(raw?.enabled),
    intervalHours: Number.isFinite(intervalHours)
      ? Math.min(MAX_INTERVAL_HOURS, Math.max(MIN_INTERVAL_HOURS, intervalHours))
      : DEFAULT_REMINDER_SETTINGS.intervalHours,
    scheduleAheadCount: Number.isFinite(scheduleAheadCount)
      ? Math.min(30, Math.max(4, Math.round(scheduleAheadCount)))
      : DEFAULT_REMINDER_SETTINGS.scheduleAheadCount,
  };
}

function buildCandidates(users: User[]): ReminderCandidate[] {
  const candidates: ReminderCandidate[] = [];

  for (const user of users) {
    const amount = parseUserAmount(user.amount);
    if (!amount) continue;

    const candidate: ReminderCandidate = {
      id: user.id,
      name: user.name,
      amount,
      kind: amount > 0 ? "collect" : "repay",
    };

    if (user.pfp) {
      candidate.pfp = user.pfp;
    }

    candidates.push(candidate);
  }

  return candidates;
}

function buildCoverageSequence(candidates: ReminderCandidate[], count: number): ReminderCandidate[] {
  if (!candidates.length || count <= 0) return [];

  const sequence: ReminderCandidate[] = [];
  let pool = shuffle(candidates);

  while (sequence.length < count) {
    if (pool.length === 0) {
      pool = shuffle(candidates);
    }

    const next = pool.shift();
    if (!next) continue;

    const previous = sequence[sequence.length - 1];
    if (previous && previous.id === next.id && pool.length > 0) {
      pool.push(next);
      continue;
    }

    sequence.push(next);
  }

  return sequence;
}

async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    const current = await notifee.getNotificationSettings();
    if (current.authorizationStatus >= AuthorizationStatus.AUTHORIZED) return true;

    const asked = await notifee.requestPermission();
    return asked.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;

  await notifee.createChannel({
    id: REMINDER_CHANNEL_ID,
    name: "Debt Reminders",
    vibration: true,
    vibrationPattern: [250, 250, 250, 250],
    lights: true,
    lightColor: "#22c55e",
  });
}

function buildAttachment(uri?: string | null): Notifications.NotificationContentInput["attachments"] {
  if (Platform.OS !== "ios") return undefined;
  const normalizedUri = normalizeImageUri(uri);
  if (!normalizedUri) return undefined;

  return [
    {
      identifier: `user-${Date.now()}`,
      url: normalizedUri,
      type: "image",
    },
  ];
}

function normalizeImageUri(uri?: string | null): string | undefined {
  if (!uri) return undefined;
  const trimmed = uri.trim();
  if (!trimmed) return undefined;
  if (
    trimmed.startsWith("file://") ||
    trimmed.startsWith("content://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("asset:/") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  return `file://${trimmed}`;
}

function resolveNotificationAvatarUri(uri?: string | null): string | undefined {
  return normalizeImageUri(uri) ?? normalizeImageUri(APP_ICON_URI);
}

async function scheduleReminderNotification(
  candidate: ReminderCandidate,
  message: ReminderMessage,
  dateMs?: number
): Promise<string> {
  if (Platform.OS === "android") {
    const imageUri = resolveNotificationAvatarUri(candidate.pfp);
    const id = `reminder-${candidate.id}-${dateMs ?? Date.now()}`;
    const messageTimestamp = dateMs ?? Date.now();

    const androidNotification: Parameters<typeof notifee.displayNotification>[0] = {
      id,
      title: message.caption,
      body: message.description,
      data: {
        userId: String(candidate.id),
        name: message.caption,
        amount: String(candidate.amount),
        kind: candidate.kind,
        imageUri: imageUri ?? "",
      },
      android: {
        channelId: REMINDER_CHANNEL_ID,
        smallIcon: "notification_icon",
        largeIcon: imageUri ?? APP_ICON_URI,
        circularLargeIcon: true,
        autoCancel: true,
        onlyAlertOnce: false,
        timestamp: messageTimestamp,
        showTimestamp: true,
        pressAction: { id: "default" },
        style: {
          type: AndroidStyle.BIGTEXT,
          text: message.description,
        },
      },
    };

    if (typeof dateMs === "number") {
      const exactTrigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: dateMs,
        alarmManager: true,
      };

      try {
        await notifee.createTriggerNotification(androidNotification, exactTrigger);
      } catch (error) {
        console.warn("Exact alarm scheduling failed, falling back to standard trigger", error);

        const fallbackTrigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: dateMs,
        };
        await notifee.createTriggerNotification(androidNotification, fallbackTrigger);
      }

      return id;
    }

    await notifee.displayNotification(androidNotification);
    return id;
  }

  const imageUri = resolveNotificationAvatarUri(candidate.pfp);

  return Notifications.scheduleNotificationAsync({
    content: {
      title: message.caption,
      body: message.description,
      data: {
        userId: candidate.id,
        name: message.caption,
        amount: candidate.amount,
        kind: candidate.kind,
        imageUri: imageUri ?? null,
      },
      attachments: buildAttachment(imageUri),
    },
    trigger:
      typeof dateMs === "number"
        ? {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(dateMs),
          }
        : null,
  });
}

async function clearScheduledReminders(): Promise<void> {
  const state = await readJsonFile<ScheduledReminderState>(REMINDER_IDS_FILE, { ids: [] });
  await Promise.all(
    state.ids.map(async (id) => {
      try {
        if (Platform.OS === "android") {
          await notifee.cancelTriggerNotification(id);
          await notifee.cancelNotification(id);
        }
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch {
        // Ignore stale ids; they can happen after app reinstalls or manual clears.
      }
    })
  );
  await writeJsonFile(REMINDER_IDS_FILE, { ids: [] } satisfies ScheduledReminderState);
}

function nextIntervalMs(intervalHours: number): number {
  const ms = Math.round(intervalHours * 60 * 60 * 1000);
  return Math.max(1000, ms);
}

async function scheduleRemindersForCandidates(
  candidates: ReminderCandidate[],
  settings: ReminderSettings
): Promise<void> {
  if (!candidates.length) {
    await writeJsonFile(REMINDER_IDS_FILE, { ids: [] } satisfies ScheduledReminderState);
    return;
  }

  const sequence = buildCoverageSequence(candidates, settings.scheduleAheadCount);
  const ids: string[] = [];
  let nextTime = Date.now();

  for (const candidate of sequence) {
    nextTime += nextIntervalMs(settings.intervalHours);
    const message = createReminderMessage(candidate);

    const id = await scheduleReminderNotification(candidate, message, nextTime);

    ids.push(id);
  }

  await writeJsonFile(REMINDER_IDS_FILE, { ids } satisfies ScheduledReminderState);
}

export async function getReminderSettings(): Promise<ReminderSettings> {
  const saved = await readJsonFile<Partial<ReminderSettings>>(
    REMINDER_SETTINGS_FILE,
    DEFAULT_REMINDER_SETTINGS
  );
  return normalizeSettings(saved);
}

export async function saveReminderSettings(
  partial: Partial<ReminderSettings>
): Promise<ReminderSettings> {
  const current = await getReminderSettings();
  const merged = normalizeSettings({ ...current, ...partial });
  await writeJsonFile(REMINDER_SETTINGS_FILE, merged);
  return merged;
}

export async function refreshReminderSchedule(users: User[]): Promise<void> {
  const settings = await getReminderSettings();
  await ensureAndroidChannel();
  await clearScheduledReminders();

  if (!settings.enabled) return;

  const permissionGranted = await ensureNotificationPermissions();
  if (!permissionGranted) return;

  const candidates = buildCandidates(users);
  await scheduleRemindersForCandidates(candidates, settings);
}

export async function updateReminderSettings(
  partial: Partial<ReminderSettings>,
  users: User[]
): Promise<ReminderSettings> {
  const merged = await saveReminderSettings(partial);
  await refreshReminderSchedule(users);
  return merged;
}

export async function requestReminderPermissionAndCheckExactAlarm(): Promise<ReminderEnablementCheckResult> {
  const permissionGranted = await ensureNotificationPermissions();

  if (!permissionGranted) {
    return {
      permissionGranted: false,
      needsExactAlarmSettings: false,
    };
  }

  if (Platform.OS !== "android") {
    return {
      permissionGranted: true,
      needsExactAlarmSettings: false,
    };
  }

  const settings = await notifee.getNotificationSettings();

  return {
    permissionGranted: true,
    needsExactAlarmSettings: settings.android.alarm === AndroidNotificationSetting.DISABLED,
  };
}

export async function openReminderExactAlarmSettings(): Promise<void> {
  if (Platform.OS !== "android") return;
  await notifee.openAlarmPermissionSettings();
}

export async function bootstrapReminderEngine(users: User[]): Promise<void> {
  await refreshReminderSchedule(users);
}

export type TriggerDebtReminderNowResult = "sent" | "permission-denied" | "no-candidates";

export async function triggerDebtReminderNow(
  users: User[]
): Promise<TriggerDebtReminderNowResult> {
  await ensureAndroidChannel();

  const permissionGranted = await ensureNotificationPermissions();
  if (!permissionGranted) return "permission-denied";

  const candidates = buildCandidates(users);
  if (!candidates.length) return "no-candidates";

  const candidate = candidates[randomInt(0, candidates.length - 1)];
  const message = createReminderMessage(candidate);

  await scheduleReminderNotification(candidate, message);

  return "sent";
}
