import { Status } from "@/types/utils";
import { COLORS } from "@/constants";

export function formatDateToDisplay(isoString: string): string {
  const date = new Date(isoString);

  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  const hours = date.getHours() % 12 || 12;
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = date.getHours() >= 12 ? "PM" : "AM";

  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

export function formatAmount(amount: number): { sign: string; display: string } {
  const status = getAmountStatus(amount);
  const sign = status === "positive" ? "+" : status === "negative" ? "-" : "";
  return { sign, display: `${sign} ${Math.abs(amount).toFixed(2)}` };
}

export function getAmountStatus(amount: number): Status {
  return amount > 0 ? "positive" : amount < 0 ? "negative" : "neutral";
}

export function statusColor(status: Status): { color: string } {
  switch (status) {
    case "positive":
      return { color: COLORS.success };
    case "negative":
      return { color: COLORS.destructiveStrong };
    default:
      return { color: COLORS.mutedForeground };
  }
}
