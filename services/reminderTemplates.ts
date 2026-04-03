import { ReminderCandidate, ReminderTemplate } from "@/types/reminder";

const COLLECT_TEMPLATES: ReminderTemplate[] = [
  {
    title: "Friendly Debt Radar",
    body: "{name} still owes you {amount}. Time for a polite nudge.",
  },
  {
    title: "Money Magnet Mode",
    body: "Collect mission: ping {name} and recover {amount}.",
  },
  {
    title: "Collector Alert",
    body: "Quick follow-up with {name}. Your {amount} is waiting.",
  },
  {
    title: "Cash Comeback",
    body: "Send {name} a reminder. You are due {amount}.",
  },
  {
    title: "Gentle Reminder",
    body: "{name} owes you. A message now can close it fast.",
  },
];

const REPAY_TEMPLATES: ReminderTemplate[] = [
  {
    title: "Settle It Time",
    body: "You owe {name} {amount}. A quick repay keeps things clean.",
  },
  {
    title: "Debt Detox",
    body: "Clear {amount} with {name} and breathe easy.",
  },
  {
    title: "Kindness Ping",
    body: "Repay {name} today. Current due: {amount}.",
  },
  {
    title: "Balance Booster",
    body: "One step to zero balance: pay {name} {amount}.",
  },
  {
    title: "Friendly Nudge",
    body: "You still owe {name}. This is your sign to settle up.",
  },
];

function randomItem<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function formatAmount(amount: number): string {
  return `₹${Number.isFinite(amount) ? amount : 0}`;
}

export function createReminderMessage(candidate: ReminderCandidate): ReminderTemplate {
  const template =
    candidate.kind === "collect"
      ? randomItem(COLLECT_TEMPLATES)
      : randomItem(REPAY_TEMPLATES);

  return {
    title: template.title.replaceAll("{name}", candidate.name),
    body: template.body
      .replaceAll("{name}", candidate.name)
      .replaceAll("{amount}", formatAmount(Math.abs(candidate.amount))),
  };
}

export const reminderTemplateLibrary = {
  collect: COLLECT_TEMPLATES,
  repay: REPAY_TEMPLATES,
};
