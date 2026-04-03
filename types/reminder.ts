export type ReminderKind = "collect" | "repay";

export type ReminderTemplate = {
  title: string;
  body: string;
};

export type ReminderCandidate = {
  id: number;
  name: string;
  amount: number;
  pfp?: string | null;
  kind: ReminderKind;
};

export type ReminderSettings = {
  enabled: boolean;
  intervalHours: number;
  scheduleAheadCount: number;
};
