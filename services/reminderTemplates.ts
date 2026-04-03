import { ReminderCandidate, ReminderMessage, ReminderTemplate } from "@/types/reminder";
import { REMINDER_TEMPLATES } from "@/constants/templates";

function randomItem<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function formatAmount(amount: number): string {
  return `₹${Number.isFinite(amount) ? amount : 0}`;
}

function applyTokenTemplate(template: string, candidate: ReminderCandidate): string {
  return template
    .replaceAll("{name}", candidate.name)
    .replaceAll("{amount}", formatAmount(Math.abs(candidate.amount)));
}

export function createReminderMessage(candidate: ReminderCandidate): ReminderMessage {
  const template: ReminderTemplate = randomItem(REMINDER_TEMPLATES[candidate.kind]);

  return {
    description: applyTokenTemplate(template.description, candidate),
    caption: applyTokenTemplate(template.caption, candidate),
  };
}

export const reminderTemplateLibrary = {
  collect: REMINDER_TEMPLATES.collect,
  repay: REMINDER_TEMPLATES.repay,
};
