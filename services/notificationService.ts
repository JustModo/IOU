import * as FileSystem from "expo-file-system";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { User } from "@/types/user";
import { ReminderCandidate, ReminderSettings } from "@/types/reminder";
import { parseUserAmount } from "@/utils";
import { createReminderMessage } from "@/services/reminderTemplates";

const REMINDER_SETTINGS_FILE = `${FileSystem.documentDirectory}reminder-settings.json`;
const REMINDER_IDS_FILE = `${FileSystem.documentDirectory}reminder-scheduled-ids.json`;
const REMINDER_CHANNEL_ID = "debt-reminders";

const MIN_INTERVAL_HOURS = 1;
const MAX_INTERVAL_HOURS = 168;

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: false,
  intervalHours: 12,
  scheduleAheadCount: 18,
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
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: "Debt Reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#22c55e",
  });
}

function buildAttachment(uri?: string | null): Notifications.NotificationContentInput["attachments"] {
  if (Platform.OS !== "ios") return undefined;
  if (!uri) return undefined;
  const trimmed = uri.trim();
  if (!trimmed) return undefined;

  return [
    {
      identifier: `user-${Date.now()}`,
      url: trimmed,
      type: "image",
    },
  ];
}

async function clearScheduledReminders(): Promise<void> {
  const state = await readJsonFile<ScheduledReminderState>(REMINDER_IDS_FILE, { ids: [] });
  await Promise.all(
    state.ids.map(async (id) => {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch {
        // Ignore stale ids; they can happen after app reinstalls or manual clears.
      }
    })
  );
  await writeJsonFile(REMINDER_IDS_FILE, { ids: [] } satisfies ScheduledReminderState);
}

function nextRandomIntervalMs(intervalHours: number): number {
  const base = intervalHours * 60 * 60 * 1000;
  const min = Math.round(base * 0.55);
  const max = Math.round(base * 1.35);
  return randomInt(min, max);
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
    nextTime += nextRandomIntervalMs(settings.intervalHours);
    const message = createReminderMessage(candidate);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: message.title,
        body: message.body,
        data: {
          userId: candidate.id,
          name: candidate.name,
          amount: candidate.amount,
          kind: candidate.kind,
          imageUri: candidate.pfp ?? null,
        },
        attachments: buildAttachment(candidate.pfp),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(nextTime),
      },
    });

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

export async function bootstrapReminderEngine(users: User[]): Promise<void> {
  await refreshReminderSchedule(users);
}
