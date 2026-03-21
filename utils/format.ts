import { Status } from "@/types/utils";

export function formatDateToDisplay(isoString: string): string {
  const date = new Date(isoString);

  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const year = date.getUTCFullYear();

  const hours = date.getUTCHours() % 12 || 12;
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const ampm = date.getUTCHours() >= 12 ? "PM" : "AM";

  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

export function formatAmount(amount: number): { sign: string; display: string } {
  const status = getAmountStatus(amount);
  const sign = status === "positive" ? "+" : status === "negative" ? "-" : "";
  return { sign, display: `${sign} ${Math.abs(amount)}` };
}

export function getAmountStatus(amount: number): Status {
  return amount > 0 ? "positive" : amount < 0 ? "negative" : "neutral";
}

export function statusColor(status: Status): string {
  switch (status) {
    case "positive":
      return "text-green-500";
    case "negative":
      return "text-red-500";
    default:
      return "text-[#aaa]";
  }
}
