import { formatDisplayName } from './displayName';

export function formatFriendDisplayName(
  name: string | null | undefined,
  email: string,
  nickname?: string | null,
): string {
  const base = formatDisplayName(name, email);
  const trimmed = nickname?.trim();
  if (trimmed) return `${trimmed} (${base})`;
  return base;
}
