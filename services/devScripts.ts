import {
  triggerDebtReminderNow,
} from "@/services/notificationService";
import { User } from "@/types/user";

export type DevScriptAlert = {
  title: string;
  message: string;
};

export async function runDevNotificationTriggerFlow(users: User[]): Promise<DevScriptAlert> {
  const result = await triggerDebtReminderNow(users);

  if (result === "permission-denied") {
    return {
      title: "Permission Required",
      message: "Allow notifications to run the dev notification trigger flow.",
    };
  }

  if (result === "no-candidates") {
    return {
      title: "No Debt Data",
      message: "Add a user with pending debt before running this dev script.",
    };
  }

  return {
    title: "Dev Script Success",
    message: "Notification trigger flow executed.",
  };
}
