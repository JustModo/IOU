import { User } from "@/types/user";

type ParsedUser = User & {
  parsedAmount: number;
};

export type DashboardStats = {
  totalUsers: number;
  totalOwedToMe: number;
  totalIOwe: number;
  netBalance: number;
  usersWhoOweMe: number;
  usersIOwe: number;
  settledUsers: number;
  exposure: number;
};

export type TopBalancePoint = {
  id: number;
  name: string;
  amount: number;
  absoluteAmount: number;
};

export function parseUserAmount(amount: unknown): number {
  if (typeof amount === "number") {
    return Number.isFinite(amount) ? amount : 0;
  }

  if (typeof amount === "string") {
    const normalized = amount.replace(/,/g, "").trim();
    if (!normalized) return 0;
    const value = Number(normalized);
    return Number.isFinite(value) ? value : 0;
  }

  return 0;
}

function withParsedAmounts(users: User[]): ParsedUser[] {
  return users.map((user) => ({
    ...user,
    parsedAmount: parseUserAmount(user.amount),
  }));
}

export function computeDashboardStats(users: User[]): DashboardStats {
  const parsedUsers = withParsedAmounts(users);

  const totalOwedToMe = parsedUsers
    .filter((user) => user.parsedAmount > 0)
    .reduce((sum, user) => sum + user.parsedAmount, 0);

  const totalIOwe = parsedUsers
    .filter((user) => user.parsedAmount < 0)
    .reduce((sum, user) => sum + Math.abs(user.parsedAmount), 0);

  const usersWhoOweMe = parsedUsers.filter((user) => user.parsedAmount > 0).length;
  const usersIOwe = parsedUsers.filter((user) => user.parsedAmount < 0).length;
  const settledUsers = parsedUsers.filter((user) => user.parsedAmount === 0).length;

  return {
    totalUsers: parsedUsers.length,
    totalOwedToMe,
    totalIOwe,
    netBalance: totalOwedToMe - totalIOwe,
    usersWhoOweMe,
    usersIOwe,
    settledUsers,
    exposure: totalOwedToMe + totalIOwe,
  };
}

export function getTopBalances(users: User[], limit = 5): TopBalancePoint[] {
  return withParsedAmounts(users)
    .filter((user) => user.parsedAmount !== 0)
    .sort((a, b) => Math.abs(b.parsedAmount) - Math.abs(a.parsedAmount))
    .slice(0, limit)
    .map((user) => ({
      id: user.id,
      name: user.name,
      amount: user.parsedAmount,
      absoluteAmount: Math.abs(user.parsedAmount),
    }));
}