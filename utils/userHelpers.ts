import { User } from "@/types/user";

/**
 * Sort users: active amounts (desc by absolute value) first, zeroes last.
 */
export function sortUsers(users: User[]): User[] {
  return [...users].sort(
    (a, b) =>
      (b.amount !== 0 ? b.amount : -Infinity) -
      (a.amount !== 0 ? a.amount : -Infinity)
  );
}

/**
 * Case-insensitive name search.
 */
export function filterUsers(users: User[], query: string): User[] {
  const q = query.toLowerCase();
  return users.filter((user) => user.name.toLowerCase().includes(q));
}
